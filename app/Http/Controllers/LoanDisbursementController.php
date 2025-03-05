<?php

namespace App\Http\Controllers;

use App\Models\Loan;
use App\Models\BLSPackage;
use App\Models\BLSPaymentType;
use App\Models\Transaction;
use App\Models\Saving;

use App\Models\{ChartOfAccount, JournalEntry, JournalEntryLine};

use App\Enums\AccountType;
use App\Enums\LoanStage;
use App\Enums\TransactionType;


use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class LoanDisbursementController extends Controller
{
    /**
     * Display a listing of loans.
     */
    public function index(Request $request)
    {
        $query = Loan::with(['customer', 'loanPackage', 'user']);

        // Search functionality (search customer's name, company name)
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('first_name', 'like', '%' . $request->search . '%')
                    ->orWhere('other_names', 'like', '%' . $request->search . '%')
                    ->orWhere('surname', 'like', '%' . $request->search . '%')
                    ->orWhere('company_name', 'like', '%' . $request->search . '%');
            });
        }

        $query->where('stage', '>=', '6');

        // Filtering by stage
        if ($request->filled('stage')) {
            $query->where('stage', $request->stage);
        }



        // Only show stages less than or equal to 3
        $loans = $query->orderBy('created_at', 'desc')->paginate(10);

        return inertia('LoanDisbursement/Index', [
            'loans' => $loans,
            'filters' => $request->only(['search', 'stage']),
        ]);
    }
    
    /**
     * Show the form for editing the specified loan.
     */
    public function edit(Loan $loan)
    {     
        $loan->load('loanGuarantors.guarantor'); // Eager load the relationship and the guarantor details

        $loan->loanGuarantors->transform(function ($loanGuarantor) {
            return [    
                //'id' => $loanGuarantor->id,         
                'collateral_doc' => $loanGuarantor->collateral_doc, // Or format as needed    
                'collateralDocName' => $loanGuarantor->collateral_docname,         
                'first_name' => $loanGuarantor->guarantor->first_name,               
                'surname' => $loanGuarantor->guarantor->surname,
                'company_name' => $loanGuarantor->guarantor->company_name,
                'guarantor_type' => $loanGuarantor->guarantor->guarantor_type,
                'guarantor_id' => $loanGuarantor->guarantor->id,  

            ];
        });
     
        return inertia('LoanDisbursement/Edit', [
            'loan' => $loan,
            'loanTypes' => BLSPackage::all(),
            'paymentTypes'=> BLSPaymentType::all(),           
        ]);
        
    }

    /**
     * Update the specified loan in storage.
     */  
   
     public function disburse(Request $request, Loan $loan)
     {
         // Validation (payment type, remarks) - removed amount
         $validatedData = $request->validate([
             'payment_type_id' => 'required|integer|min:1',
             'remarks' => 'required|string',
         ]);
     
         if ($loan->stage < LoanStage::Approved->value) {  // Assuming 'Approved' and subsequent stages are higher values in your enum
            abort(400, 'Loan is not yet fully approved or already disbursed.');
         }
     
         // Check if loan amount is valid
         if ($loan->loan_amount <= 0) {
             abort(400, 'Invalid loan amount for disbursement.');
         }
     
         $paymentType = BLSPaymentType::findOrFail($validatedData['payment_type_id']);

         DB::transaction(function () use ($validatedData, $loan, $paymentType) {
             
            $currentStage = LoanStage::from($loan->stage);
    
            if (!$currentStage) {
                // Handle invalid stage (e.g., throw an exception or return an error response)
                abort(400, 'Invalid loan stage.'); 
            }    
    
            $nextStage = match ($currentStage) {
                LoanStage::LoanOfficerReview => LoanStage::ManagerReview,
                LoanStage::ManagerReview => LoanStage::CommitteeReview,
                LoanStage::CommitteeReview => LoanStage::Approved,
                LoanStage::Approved => LoanStage::Disbursed,
                default => null, // No next stage (already approved or rejected, or in an unapprovable state)
            };

            $disbursementAmount = $loan->loan_amount; // Use the loan amount
     
            if ($nextStage) {
                // Update loan stage
                $loan->update(['stage' => $nextStage->value]);
           
     
                $transaction = Transaction::create([
                    'customer_id' => $loan->customer_id,
                    'user_id' => auth()->user()->id,
                    'loan_id' => $loan->id,
                    'amount' => $disbursementAmount, 
                    'type' => TransactionType::Disbursement->value, 
                    'payment_type_id' => $validatedData['payment_type_id'],
                    'transaction_reference' => $this->generateTransactionReference(),
                    'description' => $validatedData['remarks'],
                ]);


                $description = match ($loan->customer_type) {
                    'individual' => 'Loan Disbursement - ' . $loan->first_name . ' ' . $loan->surname,
                    'company' => 'Loan Disbursement - ' . $loan->company_name,
                    default => 'Loan Disbursement - Customer ' . $loan->customer_id, // Fallback if customer_type is invalid
                };

                // *** Accounting Entries ***
                $journalEntry = JournalEntry::create([
                    'entry_date' => now()->toDateString(), // Or $transaction->created_at->toDateString() if you prefer
                    'reference_number' => $transaction->transaction_reference,  // Use the transaction reference
                    'description' => $description,
                    'transaction_id' => $transaction->id, // Link to the transaction
                ]);

                // 1. Debit: Loan Receivable Account (Increase)
                $loanReceivableAccount = ChartOfAccount::where('account_type', AccountType::Asset->value)
                                                        ->where('account_name', 'Loan Receivable') // Replace 'Loan Receivable' with your actual account name
                                                        ->firstOrFail(); // Make sure the account exists
                JournalEntryLine::create([
                    'journal_entry_id' => $journalEntry->id,
                    'account_id' => $loanReceivableAccount->id,
                    'debit' => $disbursementAmount,
                    'credit' => 0,
                ]);


                // Handle savings account deposit if issaving is true
                if ($paymentType->issaving) {
                    $saving = Saving::where('customer_id', $loan->customer_id)->first(); // Get the customer's savings account.  You might need to adjust this logic based on your application's requirements

                    if (!$saving) {
                        // Handle the case where the customer doesn't have a savings account.
                        // You could create one, throw an error, or choose another course of action.
                        // Example:
                        $saving = Saving::create(['customer_id' => $loan->customer_id, 'balance' => 0]);  // Or throw an exception if you require a savings account
                        
                    }


                    $saving->balance += $disbursementAmount;
                    $saving->save();

                    // Record savings deposit transaction
                    Transaction::create([
                        'customer_id' => $loan->customer_id,
                        'user_id' => auth()->user()->id,
                        'savings_id' => $saving->id, // Link to the savings account
                        'amount' => $disbursementAmount,
                        'type' => TransactionType::Deposit->value,  // Deposit into savings
                        'payment_type_id' => $validatedData['payment_type_id'], // Assuming the same payment type applies
                        'transaction_reference' => $this->generateTransactionReference(),
                        'description' => 'Loan disbursement deposit', // or similar description
                    ]);


                     // 2. Credit: Savings Account (Decrease - because the bank's liability decreases when disbursing to savings)
                    $savingsAccount = ChartOfAccount::where('account_type', AccountType::Liability->value)  // Usually a liability
                                                            ->where('account_name', 'Savings Deposit') // Replace with your savings account name
                                                            ->firstOrFail(); // Make sure the account exists

                    JournalEntryLine::create([
                                            'journal_entry_id' => $journalEntry->id,
                                            'account_id' => $savingsAccount->id,
                                            'debit' => 0,
                                            'credit' => $disbursementAmount,  //
                                            ]);

                
                }else { // If not a savings disbursement, assume it's a cash disbursement

                    // 2. Credit: Cash Account (Decrease)
                    $cashAccount = ChartOfAccount::where('account_type', AccountType::Asset->value)
                                                        ->where('account_name', 'Cash') // Replace 'Cash' with your cash account name
                                                        ->firstOrFail();
                    JournalEntryLine::create([
                        'journal_entry_id' => $journalEntry->id,
                        'account_id' => $cashAccount->id,
                        'debit' => 0,
                        'credit' => $disbursementAmount,
                    ]);
    
                }

            }
     
             // ... (Update loan status, disbursed_amount, etc. as before) ...
     
         });
     
         return redirect()->route('loan2.index')->with('success', 'Loan disbursed successfully!');
     }


    private function generateTransactionReference()
    {
        // Implement your logic to generate a unique transaction reference
        // Example:
        return 'DISB-' . uniqid();
    }
    
}

