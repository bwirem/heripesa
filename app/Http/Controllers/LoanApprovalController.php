<?php

namespace App\Http\Controllers;

use App\Models\Loan;
use App\Models\LoanGuarantor;
use App\Models\BLSPackage;
use App\Models\FacilityBranch;

use App\Enums\LoanStage; // Or your constants class
use App\Enums\ApprovalStatus;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;


class LoanApprovalController extends Controller
{
    /**
     * Display a listing of loans.
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $facilityBranches = $user->facilityBranches()->where('facilitybranches.id', auth()->id())->get();

        // If the user has no facility branches, return empty loans
        if ($facilityBranches->isEmpty()) {
            return inertia('LoanApproval/Index', [
                'loans' => $loans ?? ['data' => []], // Ensure loans is never undefined
                'facilityBranches' => $facilityBranches,
                'filters' => $request->only(['search', 'stage']),
            ]);
        }

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

        // Enforce stage range (4 to 6)
        $query->whereBetween('stage', [4, 6]);

        // Filtering by stage
        if ($request->filled('stage')) {
            $stages = explode(',', $request->stage);

            if (count($stages) > 1) {
                $query->whereIn('stage', $stages);
            } else {
                $query->where('stage', $stages[0]);
            }
        }

        // Filter by facility branch
        if ($request->filled('facilitybranch_id')) {
            $query->where('facilitybranch_id', $request->facilitybranch_id);
        }

        $loans = $query->orderBy('created_at', 'desc')->paginate(10);

        return inertia('LoanApproval/Index', [
            'loans' => $loans,
            'facilityBranches' => $facilityBranches,
            'filters' => $request->only(['search', 'stage']),
        ]);
    }
   
    /**
     * Show the form for editing the specified loan.
     */
    public function edit(Loan $loan)
    {
        //\Log::info($loan->load('approvals.approver.userGroup')->toArray());

        $loan->load('customer'); 
        $loan->load('loanGuarantors.guarantor'); // Eager load the relationship and the guarantor details       
        $loan->load('approvals.approver.userGroup'); 
       

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

        return inertia('LoanApproval/ManagerReview', [
            'loan' => $loan,
            'loanTypes' => BLSPackage::all(),
        ]);
           
    }

    /**
     * Show the form for approve the specified loan.
     */
         
    public function approve(Request $request, Loan $loan)
    {
        // ... validation ...
    
        DB::transaction(function () use ($request, $loan) {
            $currentStage = LoanStage::from($loan->stage);
    
            if (!$currentStage) {
                // Handle invalid stage (e.g., throw an exception or return an error response)
                abort(400, 'Invalid loan stage.'); 
            }
    
    
            $nextStage = match ($currentStage) {
                LoanStage::LoanOfficerReview => LoanStage::ManagerReview,
                LoanStage::ManagerReview => LoanStage::CommitteeReview,
                LoanStage::CommitteeReview => LoanStage::Approved,
                default => null, // No next stage (already approved or rejected, or in an unapprovable state)
            };
    
            $approval = $loan->approvals()->where([
                //'approved_by' => auth()->user()->id,
                'stage' => $currentStage->value,  // Use ->value here
                'status' => ApprovalStatus::Pending->value // Assuming ApprovalStatus is also an enum
            ])->firstOrFail();    
    
    
            // Update the current approval record
            $approval->update([
                'approved_by' => auth()->user()->id,
                'status' => ApprovalStatus::Approved->value, 
                'remarks' => $request->input('remarks')
            ]);
    
            if ($nextStage) {
                // Update loan stage
                $loan->update(['stage' => $nextStage->value]);
    
                // Create a new approval record for the next stage
                $loan->approvals()->create([
                    'stage' => $nextStage->value,
                    'status' => ApprovalStatus::Pending->value,
                    'approved_by' => auth()->user()->id,
                    // ... other fields ... (e.g., assigned approver)
                ]);
    
                // ... send notification to the next approver ...
            } 
    
        });
    
        return redirect()->route('loan1.index')->with('success', 'Loan review approved successfully!');
    }
      
   
}