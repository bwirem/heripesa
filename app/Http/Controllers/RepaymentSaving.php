<?php

namespace App\Http\Controllers;


use App\Models\Loan;
use App\Models\LoanGuarantor;
use App\Models\BLSPackage;
use App\Models\BLSPaymentType;
use App\Models\BLSCustomer;
use App\Models\Saving;
use App\Models\Transaction;

use App\Enums\LoanStage; // Or your constants class
use App\Enums\ApprovalStatus;
use App\Enums\TransactionType;

use Inertia\Inertia;


use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;


class RepaymentSaving extends Controller
{
    
    /**
     * Show the form for creating a new loan.
     */
    public function repayment()
    {
        return inertia('RepaymentSaving/Repayment', [ 
            'paymentTypes'=> BLSPaymentType::all(),         
            'loanTypes' => BLSPackage::all(),
        ]);
    } 
    
    public function saving()
    {
        return inertia('RepaymentSaving/Saving', [ 
            'paymentTypes'=> BLSPaymentType::all(),         
            'savings,' => Saving::all(),
        ]);
    }  



    public function showCustomerSaving($customerId)
    {
        $customer = BLSCustomer::with('savings')->findOrFail($customerId); // Fetch customer along with saving details
        Log::info('Start processing purchase update:', ['request_data' => $customer]);
        
        if ($customer) { // Check if a customer was returned
            return Inertia::render('RepaymentSaving/Saving', [
                'selectedCustomer' => $customer,
                'savings' => $customer->savings, // Return the customer's saving data
                'paymentTypes' => BLSPaymentType::all(),

        ]);

        }else{
            return back()->withErrors(['customer_id' => 'Failed to find customer.']);
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

        });

        return redirect()->back()->with('success', 'Transaction successful!'); // Or return a JSON response if it's an API request
    }


    private function generateTransactionReference()
    {
        return 'TRANS-' . uniqid(); // Or a more robust logic
    }

    
}