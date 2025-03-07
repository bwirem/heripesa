<?php

namespace App\Http\Controllers;

use App\Models\{Loan,LoanGuarantor,Saving, Repayment, Transaction};
use App\Models\{BLSPackage, BLSPaymentType, BLSCustomer}; 
use App\Models\{ChartOfAccount, JournalEntry, JournalEntryLine};
use App\Enums\{AccountType,LoanStage,ApprovalStatus,TransactionType};





use Inertia\Inertia;


use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

use Carbon\Carbon;


class RepaymentSaving extends Controller
{
    
    /**
     * Show the form for creating a new loan.
     */
    public function repaymentIndex()
    {
        return inertia('RepaymentSaving/Repayment', [ 
            'paymentTypes'=> BLSPaymentType::all(),         
            'loanTypes' => BLSPackage::all(),
        ]);
    } 

    
    public function storeRepayment(Request $request, Loan $loan)
    {
        $validatedData = $request->validate([
            'amount' => 'required|numeric|min:0',
            'payment_type_id' => 'required|exists:bls_paymenttypes,id',
            'remarks' => 'required|string',
            'payment_date' => 'required|date',
        ]);


        // Calculate outstanding balance (you'll need a function for this)
        $outstandingBalance = $this->calculateOutstandingBalance($loan);

        // Ensure repayment amount does not exceed outstanding balance
        if ($validatedData['amount'] > $outstandingBalance) {
            return back()->withErrors(['amount' => 'Repayment amount exceeds outstanding balance.']);
        }

        DB::transaction(function () use ($validatedData, $loan, $outstandingBalance) {
            // 1. Create Repayment record
            $repayment = $loan->payments()->create([
                'user_id' => auth()->user()->id,
                'amount_paid' => $validatedData['amount'],
                'payment_date' => $validatedData['payment_date'],
                'balance_before' => $outstandingBalance, // Store balance before repayment
                'balance_after' => $outstandingBalance - $validatedData['amount'], // Calculate balance after repayment
            ]);

            // 2. Create Transaction record
            $transaction = Transaction::create([
                'customer_id' => $loan->customer_id,
                'user_id' => auth()->user()->id,
                'loan_id' => $loan->id,
                'amount' => $validatedData['amount'],
                'type' => TransactionType::LoanPayment->value,
                'payment_type_id' => $validatedData['payment_type_id'],
                'transaction_reference' => $this->generateTransactionReference(),
                'description' => $validatedData['remarks'],
            ]);

            $repayment->transaction_id = $transaction->id;  // Link repayment to transaction
            $repayment->save();


            // *** Accounting Entries ***
            $journalEntry = JournalEntry::create([
                'entry_date' => $validatedData['payment_date'],  // Use the payment date for the journal entry
                'reference_number' => $transaction->transaction_reference,
                'description' => "Loan Repayment - " . $loan->customer->fullname, // Or $transaction->description
                'transaction_id' => $transaction->id,
            ]);

            // 1. Debit: Cash/Bank Account (Increase)
            $cashBankAccount = ChartOfAccount::where('account_type', AccountType::Asset->value) // Account type should match your chart of accounts
                                            ->where('account_name', 'Cash') // Replace 'Cash' with your actual account name for cash/bank
                                            ->firstOrFail(); 
            JournalEntryLine::create([
                'journal_entry_id' => $journalEntry->id,
                'account_id' => $cashBankAccount->id,
                'debit' => $validatedData['amount'],
                'credit' => 0,
            ]);

            // 2. Credit: Loan Receivable Account (Decrease)
            $loanReceivableAccount = ChartOfAccount::where('account_type', AccountType::Asset->value)  // Loans receivable are usually assets
                                                    ->where('account_name', 'Loan Receivable') // Use your loan receivable account name
                                                    ->firstOrFail();
            JournalEntryLine::create([
                'journal_entry_id' => $journalEntry->id,
                'account_id' => $loanReceivableAccount->id,
                'debit' => 0,
                'credit' => $validatedData['amount'],
            ]);



            // 3. Update loan status if fully repaid (optional, if you have a 'repaid' status)
            if ($outstandingBalance - $validatedData['amount'] <= 0) {  // Or use a more sophisticated check for full repayment
                $loan->status = 'repaid'; // Replace with your actual status value/enum if needed
                $loan->save();
            }

        });

        return redirect()->back()->with('success', 'Repayment successful!');
    }


    // Helper function to calculate outstanding balance (you'll need to implement the actual logic)
    private function calculateOutstandingBalance(Loan $loan)
    {
        // Implement your outstanding balance calculation logic here.
        // This should take into account the initial loan amount, interest, fees, and previous payments.

        // Placeholder example (replace with your actual calculation):
        return $loan->total_repayment - $loan->payments()->sum('amount_paid'); // Simple example – adjust as needed.

    }

    
    public function savingIndex()
    {
        return inertia('RepaymentSaving/Saving', [ 
            'paymentTypes'=> BLSPaymentType::all(),         
            'savings,' => Saving::all(),
        ]);
    }

    public function showCustomerSaving($customerId)
    {
        
        try {

            $customer = BLSCustomer::with('savings')->findOrFail($customerId); // Fetch customer along with saving details
            
            // Return a JSON response
            if ($customer) {

                return response()->json(['savings' => $customer->savings]); // Include balance in response
            
            } else {
                return response()->json(['loan' => null]); // Or an empty object {} if preferred
            }     

        } catch (\Exception $e) {
            \Log::error("Error in customersavingss:", ['error' => $e]);
            return response()->json(['error' => 'Failed to fetch saving details.'], 500);
        }
    }
    
    public function storeTransaction(Request $request, $customerId)
    {

        $validatedData = $request->validate([
            'amount' => 'required|numeric|min:0',
            'payment_type_id' => 'required|exists:bls_paymenttypes,id',
            'remarks' => 'required|string',
            'transaction_type' => 'required|in:deposit,withdrawal', // Validate transaction type
        ]);

        $saving = Saving::where('customer_id', $customerId)->firstOrFail(); // Find the saving account

        $amount = $validatedData['amount'];

        DB::transaction(function () use ($validatedData, $saving, $amount, $customerId) {

            // Update the savings balance
            if ($validatedData['transaction_type'] === 'deposit') {
                $saving->balance += $amount;
                $transactionType = TransactionType::Deposit;
            } else {
                // Check for sufficient funds (important!)
                if ($saving->balance < $amount) {
                    return back()->withErrors(['amount' => 'Insufficient funds in savings account.']);
                }
                $saving->balance -= $amount;
                $transactionType = TransactionType::Withdrawal;
            }

            $saving->save();

            // Record the transaction

            $transaction = $saving->transactions()->create([

                'customer_id' => $customerId,
                'user_id' => auth()->user()->id,
                'amount' => $amount,
                'type' => $transactionType->value,
                'payment_type_id' => $validatedData['payment_type_id'],
                'transaction_reference' => $this->generateTransactionReference(),  // Implement this in your controller
                'description' => $validatedData['remarks'],
            ]);

            // *** Accounting Entries ***
            $journalEntry = JournalEntry::create([
                'entry_date' => now()->toDateString(),
                'reference_number' => $transaction->transaction_reference,
                'description' => "Savings {$validatedData['transaction_type']} - {$saving->customer->fullname}", // Improved description
                'transaction_id' => $transaction->id,
            ]);


            $savingsControlAccount = ChartOfAccount::where('account_type', AccountType::Liability->value)
                                                ->where('account_name', 'Savings Deposit') // Replace with your actual account name
                                                ->firstOrFail();

            // Determine debit/credit based on transaction type
            $debit = ($validatedData['transaction_type'] === 'deposit') ? $amount : 0;
            $credit = ($validatedData['transaction_type'] === 'withdrawal') ? $amount : 0;

            JournalEntryLine::create([
                'journal_entry_id' => $journalEntry->id,
                'account_id' => $savingsControlAccount->id, // Savings control account
                'debit' => $debit,
                'credit' => $credit,
            ]);

            // Counterpart account (Cash or Bank, depending on payment type)
            $paymentType = BLSPaymentType::findOrFail($validatedData['payment_type_id']);
            $counterpartAccountName = ($paymentType->issaving) ? 'Savings Deposit' : 'Cash'; // Replace with your account names

            $counterpartAccount = ChartOfAccount::where('account_type', AccountType::Asset->value) // Adjust account type if needed
                                                ->where('account_name', $counterpartAccountName)
                                                ->firstOrFail();


            // Reverse debit/credit for counterpart entry
            $counterpartDebit = $credit; // Reverse for double-entry
            $counterpartCredit = $debit;


            JournalEntryLine::create([
                'journal_entry_id' => $journalEntry->id,
                'account_id' => $counterpartAccount->id,
                'debit' => $counterpartDebit,  // Counterpart entry, reversed
                'credit' => $counterpartCredit, // Counterpart entry, reversed

            ]);

        });

        return redirect()->back()->with('success', 'Transaction successful!'); // Or return a JSON response if it's an API request
    }

    private function generateTransactionReference()
    {
        return 'TRANS-' . uniqid(); // Or a more robust logic
    }

    
}