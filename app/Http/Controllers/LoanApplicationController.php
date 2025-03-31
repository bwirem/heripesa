<?php

namespace App\Http\Controllers;


use App\Models\Loan;
use App\Models\LoanGuarantor;
use App\Models\BLSPackage;
use App\Models\FacilityBranch;
use App\Models\FacilityOption;

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
            $query->whereHas('customer', function ($q) use ($request) {
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

        if ($request->filled('facilitybranch_id')) {
            $query->where('facilitybranch_id', $request->facilitybranch_id);
        }

        // Only show stages less than or equal to 3
        $loans = $query->orderBy('created_at', 'desc')->paginate(10);

        return inertia('LoanApplication/Index', [
            'loans' => $loans,
            'facilityBranches' => FacilityBranch::all(),
            'filters' => $request->only(['search', 'stage']),
        ]);
    }


    /**
     * Show the form for creating a new loan.
     */
    public function create()
    {
        $facilityOption = FacilityOption::first();

        return inertia('LoanApplication/Create', [          
            'loanTypes' => BLSPackage::all(),
            'facilityBranches' => FacilityBranch::all(),
            'facilityoption' => $facilityOption ? $facilityOption : null, // Set default value if null
        ]);
    }


    /**
     * Store a newly created loan in storage.
     */
    
    
     public function store(Request $request)
     {   
         $validated = $request->validate($this->validationRules());
         $mappedData = $this->mapLoanData($validated);
     
         // Handle file upload before transaction to prevent orphaned files
         if ($request->hasFile('applicationForm')) {
             $path = $request->file('applicationForm')->store('application_forms', 'public');
             $mappedData['application_form'] = $path;
         }
     
         try {
             $loan = DB::transaction(fn () => Loan::create($mappedData));
     
             return redirect()->route('loan0.edit', ['loan' => $loan->id]);

         } catch (\Exception $e) {
             // Rollback file if transaction fails
             if (isset($path)) Storage::disk('public')->delete($path);
     
             return back()->withErrors(['error' => 'Loan creation failed. Please try again.']);
         }
     }    
    


    /**
     * Show the form for editing the specified loan.
     */
    public function edit(Loan $loan)
    { 
        $loan->load('customer');  
        
        if($loan->stage == 1){
            $facilityOption = FacilityOption::first();

            return inertia('LoanApplication/Edit', [
                'loan' => $loan,
                'loanTypes' => BLSPackage::all(),
                'facilityBranches' => FacilityBranch::all(),
                'facilityoption' => $facilityOption ? $facilityOption : null, // Set default value if null
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

            if($loan->stage == 2){    
        
            return inertia('LoanApplication/Documentation', [
                'loan' => $loan,
                'loanTypes' => BLSPackage::all(),
            ]);

            }else{

                return inertia('LoanApplication/Submission', [
                    'loan' => $loan,
                    'loanTypes' => BLSPackage::all(),
                ]);
            }
            
        }     
        
    }

    /**
     * Update the specified loan in storage.
     */  
   
     public function update(Request $request, Loan $loan)
     {   
         $validated = $request->validate($this->validationRules());
         $mappedData = $this->mapLoanData($validated);
     
         try {
             
            DB::transaction(function () use ($request, $loan, &$mappedData) {
                $this->handleFileUpload($request, $loan, $mappedData);
                $loan->update($mappedData);
            });
     
            return redirect()->route('loan0.edit', ['loan' => $loan->id])
                              ->with('success', 'Loan updated successfully!');
         } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Loan update failed. Please try again.']);
         }
     }
     

    /**
     * Update the specified loan in storage.
     */  
    
    
     public function next(Request $request, Loan $loan)
     {   

        if($loan->stage == 1){
        
            $validated = $request->validate($this->validationRules());
            $mappedData = $this->mapLoanData($validated);        
            $mappedData['stage'] = $validated['stage'] + 1; 
            
            try {
                DB::transaction(function () use ($request, $loan, &$mappedData) {
                    $this->handleFileUpload($request, $loan, $mappedData);
                    $loan->update($mappedData);
                });
        
                return redirect()->route('loan0.edit', ['loan' => $loan->id,'saved' => true])
                                ->with('success', 'Loan updated successfully!');
            } catch (\Exception $e) {
                return back()->withErrors(['error' => 'An error occurred while updating the loan. Please try again.']);
            }
        }
        else if($loan->stage == 2){

            $this->documentation($request,$loan);
        }
        else if($loan->stage == 3){

            $this->submit($request, $loan);

            return redirect()->route('loan0.index')->with('success', 'Loan submitted successfully!');

        }
       
    }
     

    /**
     * Update the specified loan in storage.
     */    
     
    private function documentation($request,$loan)
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

        

        DB::transaction(function () use ($request, $loan) {
            // Update loan details
            $loan->update(['stage' => $request->input('stage') + 1]);

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

        
        // Redirect to the 'edit' route for the current loan
        return redirect()->route('loan0.edit', ['loan' => $loan->id]);

    } 
   
    private function submit($request, $loan)
    {    
          
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
            

        } catch (\Exception $e) {
            Log::error('Error approving loan: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to approve loan. Please try again.'], 500);
        }
    }



    private function validationRules(): array
    {
        return [
            'customer_id' => 'nullable|exists:bls_customers,id',
            'loanType' => 'required|exists:bls_packages,id',
            'loanAmount' => 'required|numeric|min:0',
            'loanDuration' => 'required|integer|min:1',
            'interestRate' => 'required|numeric',
            'interestAmount' => 'required|numeric',
            'monthlyRepayment' => 'required|numeric',
            'totalRepayment' => 'required|numeric',
            'stage' => 'required|integer',
            'applicationForm' => 'nullable|file|mimes:pdf,doc,docx|max:2048',
            'facilitybranch_id' => 'required|exists:facilitybranches,id',
        ];
    }


    private function mapLoanData(array $validated): array
    {
        return [
            'customer_id' => $validated['customer_id'],
            'loan_type' => $validated['loanType'],
            'loan_amount' => $validated['loanAmount'],
            'loan_duration' => $validated['loanDuration'],
            'interest_rate' => $validated['interestRate'],
            'interest_amount' => $validated['interestAmount'],
            'monthly_repayment' => $validated['monthlyRepayment'],
            'total_repayment' => $validated['totalRepayment'],
            'stage' => $validated['stage'],
            'facilitybranch_id' => $validated['facilitybranch_id'],
            'user_id' => Auth::id(),
        ];
    }

     /**
     * Handle file upload safely.
     */
    private function handleFileUpload(Request $request, Loan $loan, array &$mappedData)
    {
        if ($request->hasFile('applicationForm')) {
            $newPath = $request->file('applicationForm')->store('application_forms', 'public');

            // Ensure successful upload before deleting old file
            if ($newPath) {
                if ($loan->application_form) {
                    Storage::disk('public')->delete($loan->application_form);
                }
                $mappedData['application_form'] = $newPath;
            }
        }
    }



    public function back(Loan $loan)
    { 
        // Check if the current stage is greater than 0
        if ($loan->stage > 1) {
            // Decrease the loan stage by 1
            $loan->update(['stage' => $loan->stage - 1]);
        } else {
            // Optionally, you can log or handle the case where the stage is already 0
            // Log::warning('Attempted to decrease loan stage below zero for loan ID: ' . $loan->id);
        }
    
        // Redirect to the 'edit' route for the current loan
        return redirect()->route('loan0.edit', ['loan' => $loan->id]);
    }    


    public function customerLoans($customerId)
    {
        $loan = Loan::with('payments') // Eager load payments
                ->where('customer_id', $customerId)
                ->where('stage', 8)
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