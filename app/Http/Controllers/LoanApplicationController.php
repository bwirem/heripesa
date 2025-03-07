<?php

namespace App\Http\Controllers;


use App\Models\Loan;
use App\Models\LoanGuarantor;
use App\Models\BLSPackage;

use App\Enums\LoanStage; // Or your constants class
use App\Enums\ApprovalStatus;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;


class LoanApplicationController extends Controller
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

        $query->where('stage', '<=', '3');
        // Filtering by stage
        if ($request->filled('stage')) {
            $query->where('stage', $request->stage);
        }

        // Only show stages less than or equal to 3
        $loans = $query->orderBy('created_at', 'desc')->paginate(10);

        return inertia('LoanApplication/Index', [
            'loans' => $loans,
            'filters' => $request->only(['search', 'stage']),
        ]);
    }

    /**
     * Show the form for creating a new loan.
     */
    public function create()
    {
        return inertia('LoanApplication/Create', [          
            'loanTypes' => BLSPackage::all(),
        ]);
    }

    /**
     * Store a newly created loan in storage.
     */
    
    public function store(Request $request)
    {

       
        // Validate input
        $validated = $request->validate([
            'customer_type' => 'required|in:individual,company',
            'first_name' => 'nullable|string|max:255',
            'other_names' => 'nullable|string|max:255',
            'surname' => 'nullable|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:13',
            'customer_id' => 'nullable|exists:bls_customers,id', // Modified: customer_id can be nullable
            'loanType' => 'required|exists:bls_packages,id',
            'loanAmount' => 'required|numeric|min:0',
            'loanDuration' => 'required|integer|min:1',
            'interestRate' => 'required|numeric',
            'interestAmount' => 'required|numeric',
            'monthlyRepayment' => 'required|numeric',
            'totalRepayment' => 'required|numeric',
            'stage' => 'required|integer',
            'applicationForm' => 'nullable|file|mimes:pdf,doc,docx|max:2048', // Max 2MB
        ]);

        // Map validated data to model attributes
        $mappedData = [
            'customer_type' => $validated['customer_type'],
            'first_name' => $validated['first_name'],
            'other_names' => $validated['other_names'],
            'surname' => $validated['surname'],
            'company_name' => $validated['company_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'customer_id' => $validated['customer_id'],
            'loan_type' => $validated['loanType'], // Mapping to model
            'loan_amount' => $validated['loanAmount'], // Mapping to model
            'loan_duration' => $validated['loanDuration'], // Mapping to model
            'interest_rate' => $validated['interestRate'], // Mapping to model
            'interest_amount' => $validated['interestAmount'],
            'monthly_repayment' => $validated['monthlyRepayment'], // Mapping to model
            'total_repayment' => $validated['totalRepayment'], // Mapping to model
            'stage' => $validated['stage'],
            'user_id' => Auth::id(),
        ];

        // Conditional validation: require either individual or company fields
        if ($validated['customer_type'] === 'individual') {
            Validator::make($validated, [
                'first_name' => 'required|string|max:255',
                'surname' => 'required|string|max:255',
                'company_name' => 'nullable',
            ])->validate();

            $mappedData['company_name'] = null;
        } else {
            Validator::make($validated, [
                'company_name' => 'required|string|max:255',
                'first_name' => 'nullable',
                'surname' => 'nullable',
                'other_names' => 'nullable',
            ])->validate();

            $mappedData['first_name'] = null;
            $mappedData['other_names'] = null;
            $mappedData['surname'] = null;
        }

        // Handle file upload
        if ($request->hasFile('applicationForm')) {
            $path = $request->file('applicationForm')->store('application_forms', 'public');
            $mappedData['application_form'] = $path;
        }

        // Create the loan
        Loan::create($mappedData);

        return redirect()->route('loan0.index')->with('success', 'Loan application created successfully.');
    }

    /**
     * Show the form for editing the specified loan.
     */
    public function edit(Loan $loan)
    {    
        
        if($loan->stage == 1){

            return inertia('LoanApplication/Edit', [
                'loan' => $loan,
                'loanTypes' => BLSPackage::all(),
            ]);
           
        }else{

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
        
            return inertia('LoanApplication/Documentation', [
                'loan' => $loan,
                'loanTypes' => BLSPackage::all(),
            ]);
            
        }     
        
    }

    /**
     * Update the specified loan in storage.
     */  
   
    public function update(Request $request, Loan $loan)
    {       
       
         $rules = [
            'customer_type' => 'required|in:individual,company',
            'first_name' => 'nullable|string|max:255',
            'other_names' => 'nullable|string|max:255',
            'surname' => 'nullable|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:13',
            'customer_id' => 'nullable|exists:bls_customers,id',
            'loanType' => 'required|exists:bls_packages,id',
            'loanAmount' => 'required|numeric|min:0',
            'loanDuration' => 'required|integer|min:1',
            'interestRate' => 'required|numeric',
            'interestAmount'=> 'required|numeric',
            'monthlyRepayment' => 'required|numeric',
            'totalRepayment' => 'required|numeric',
            'stage' => 'required|integer',
           
        ];

        if (!$loan->application_form){
             $rules['applicationForm'] = 'required|file|mimes:pdf,doc,docx|max:2048';
        }


        // Validate input
        $validated = $request->validate($rules);

        // Map validated data to model attributes
        $mappedData = [
            'customer_type' => $validated['customer_type'],
            'first_name' => $validated['first_name'],
            'other_names' => $validated['other_names'],
            'surname' => $validated['surname'],
            'company_name' => $validated['company_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'customer_id' => $validated['customer_id'],
            'loan_type' => $validated['loanType'],
            'loan_amount' => $validated['loanAmount'],
            'loan_duration' => $validated['loanDuration'],
            'interest_rate' => $validated['interestRate'],
            'interest_amount' => $validated['interestAmount'],
            'monthly_repayment' => $validated['monthlyRepayment'],
            'total_repayment' => $validated['totalRepayment'],
            'stage' => $validated['stage'],
            'user_id' => Auth::id(), // Ensure user_id is always updated
        ];

        // Conditional validation: require either individual or company fields
        if ($validated['customer_type'] === 'individual') {
            Validator::make($validated, [
                'first_name' => 'required|string|max:255',
                'surname' => 'required|string|max:255',
                'company_name' => 'nullable',
            ])->validate();

            $mappedData['company_name'] = null;
        } else {
            Validator::make($validated, [
                'company_name' => 'required|string|max:255',
                'first_name' => 'nullable',
                'surname' => 'nullable',
                'other_names' => 'nullable',
            ])->validate();

            $mappedData['first_name'] = null;
            $mappedData['other_names'] = null;
            $mappedData['surname'] = null;
        }

        // Handle file upload
        if ($request->hasFile('applicationForm')) {
            // Delete old file if it exists
            if ($loan->application_form) {
                Storage::disk('public')->delete($loan->application_form);
            }
            $path = $request->file('applicationForm')->store('application_forms', 'public');
            $mappedData['application_form'] = $path;
        }

        // Update the loan
        $loan->update($mappedData);

        return redirect()->route('loan0.index')->with('success', 'Loan application updated successfully.');
    }

    /**
     * Update the specified loan in storage.
     */    
     
    public function documentation(Request $request, Loan $loan)
    {
        // Validate request fields
        $validator = Validator::make($request->all(), [
            'stage' => 'required|integer',
            'guarantors' => 'nullable|array|min:1',
            'guarantors.*.id' => [
                'nullable',
                Rule::exists('loan_guarantors', 'id')->where('loan_id', $loan->id),
            ], // Ensuring guarantor belongs to the loan
            'guarantors.*.guarantor_id' => 'required_with:guarantors|exists:bls_guarantors,id',
            'guarantors.*.collateral_doc' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::transaction(function () use ($request, $loan) {
            // Update loan details
            $loan->update(['stage' => $request->input('stage')]);

            // Fetch existing and updating guarantors
            $existingGuarantors = $loan->loanGuarantors()->pluck('guarantor_id')->toArray();
            $updatingGuarantors = collect($request->input('guarantors'))->pluck('guarantor_id')->map(fn($id) => (int) $id)->toArray();

            // Identify guarantors to delete
            $guarantorsToDelete = array_values(array_diff($existingGuarantors, $updatingGuarantors));
            $guarantorData = [];

            // Process new/updated guarantors
            if ($request->has('guarantors')) {
                foreach ($request->input('guarantors') as $index => $guarantor) {
                    $guarantorId = $guarantor['guarantor_id'];
                    $collateralDocPath = null;
                    $collateralDocName = null;

                    if ($request->hasFile("guarantors.{$index}.collateral_doc")) {
                        $file = $request->file("guarantors.{$index}.collateral_doc");

                        // Delete existing file if present
                        $existingGuarantor = LoanGuarantor::where('loan_id', $loan->id)
                            ->where('guarantor_id', $guarantorId)
                            ->first();

                        if ($existingGuarantor && $existingGuarantor->collateral_doc) {
                            $oldFilePath = storage_path('app/public/' . $existingGuarantor->collateral_doc);
                            if (file_exists($oldFilePath)) {
                                unlink($oldFilePath);
                            }
                        }

                        // Store new file
                        $filename = uniqid() . '.' . $file->getClientOriginalExtension();
                        $collateralDocPath = $file->storeAs('loan_guarantor_collateral', $filename, 'public');
                        $collateralDocName = $file->getClientOriginalName();
                    }

                    // Set attributes for the relationship
                    $attributes = ['user_id' => Auth::id()];
                    if ($collateralDocPath) {
                        $attributes['collateral_doc'] = $collateralDocPath;
                        $attributes['collateral_docname'] = $collateralDocName;
                    }

                    $guarantorData[$guarantorId] = $attributes;
                }

                // Sync relationships
                $loan->blsGuarantors()->syncWithoutDetaching($guarantorData);
            }

            // Delete unselected guarantors and their files
            if (!empty($guarantorsToDelete)) {
                LoanGuarantor::whereIn('guarantor_id', $guarantorsToDelete)
                    ->where('loan_id', $loan->id)
                    ->get()
                    ->each(function ($guarantor) {
                        if ($guarantor->collateral_doc) {
                            $filePath = storage_path('app/public/' . $guarantor->collateral_doc);
                            if (file_exists($filePath)) {
                                unlink($filePath);
                            }
                        }
                        $guarantor->delete();
                    });
            }
        });

        return response()->json(['message' => 'Loan application updated successfully.']);
    } 
   
    public function submit(Request $request, Loan $loan)
    {

        //Log::info('Start processing purchase update:', ['purchase' => $loan, 'request_data' => $request->all()]);

        // Validate request fields.
        $validator = Validator::make($request->all(), [
            'remarks' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::transaction(function () use ($request, $loan) {
                // Update loan stage to Loan Officer Review using Enum
                $loan->update([
                    'stage' => LoanStage::LoanOfficerReview->value,// Enum value for Loan Officer Review
                    'submit_remarks' => $request->input('remarks')
                ]);

                // Create approval record for the loan
                $loan->approvals()->create([
                    'stage' => LoanStage::LoanOfficerReview->value,
                    'status' => ApprovalStatus::Pending->value,
                    'approved_by' => Auth::id(),
                ]);
            });

            return response()->json(['message' => 'Loan approved successfully.'], 200);

        } catch (\Exception $e) {
            Log::error('Error approving loan: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to approve loan. Please try again.'], 500);
        }
    }

    /**
     * customerLoans
     */  

    //  public function customerLoans($customerId)
    //  {
    //      try {

    //         $loan = Loan::with('payments') // Eager load payments
    //         ->where('customer_id', $customerId)
    //         ->first();
     
    //          // Return a JSON response
    //          if ($loan) {
    //             $outstandingBalance = $this->calculateOutstandingBalance($loan);  // Call the balance calculation function (see below)
    //             return response()->json(['loan' => $loan, 'outstandingBalance' => $outstandingBalance]); // Include balance in response
            
    //          } else {
    //              return response()->json(['loan' => null]); // Or an empty object {} if preferred
    //          }   
     
    //      } catch (\Exception $e) {
    //          \Log::error("Error in customerLoans:", ['error' => $e]);
    //          return response()->json(['error' => 'Failed to fetch loan details.'], 500);
    //      }
    //  }

    //  private function calculateOutstandingBalance(Loan $loan) {
    //     // Implement your balance calculation logic HERE (server-side).
    //     // This should match the frontend logic for consistency.
    //     return $loan->total_repayment - $loan->payments->sum('amount'); // Example using Eloquent's sum()
    // }

    
// ... other functions


public function customerLoans($customerId)
{
    $loan = Loan::with('payments') // Eager load payments
               ->where('customer_id', $customerId)
               ->first();

    if ($loan) {
        return response()->json([
            'loan' => $loan,
            'disburse_date' => $loan->created_at,//$loan->disburse_date, // Assuming you have a disburse_date column on your Loan model            
        ]);
    } else {
        return response()->json(['loan' => null]);
    }
}




    
}