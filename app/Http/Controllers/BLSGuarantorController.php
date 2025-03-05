<?php

namespace App\Http\Controllers;

use App\Models\BLSGuarantor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BLSGuarantorController extends Controller
{
    /**
     * Display a listing of BLSGuarantors.
     */
    public function index(Request $request)
    {
        $query = BLSGuarantor::query();

        // Search functionality
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('first_name', 'like', '%' . $request->search . '%')
                    ->orWhere('other_names', 'like', '%' . $request->search . '%')
                    ->orWhere('surname', 'like', '%' . $request->search . '%')
                    ->orWhere('company_name', 'like', '%' . $request->search . '%');
            });
        }

        // Paginate the results
        $guarantors = $query->orderBy('created_at', 'desc')->paginate(10);

        return inertia('SystemConfiguration/LoanSetup/Guarantors/Index', [
            'guarantors' => $guarantors,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new guarantor.
     */
    public function create()
    {
        return inertia('SystemConfiguration/LoanSetup/Guarantors/Create');
    }

    /**
     * Store a newly created guarantor in storage.
     */
    public function store(Request $request)
    {
        // Validate input
        $validated = $request->validate([
            'guarantor_type' => 'required|in:individual,company',
            'first_name' => 'nullable|string|max:255',
            'other_names' => 'nullable|string|max:255',
            'surname' => 'nullable|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'email' => 'required|email|max:255|unique:bls_guarantors',
            'phone' => 'nullable|string|max:13',
        ]);

        // Ensure either individual or company fields are filled, but not both
        if ($validated['guarantor_type'] == 'individual') {
            Validator::make($request->all(), [
                'first_name' => 'required|string|max:255',
                'surname' => 'required|string|max:255',
                'company_name' => 'sometimes|nullable',
            ])->validate();
            $validated['company_name'] = null; // Ensure company_name is null
        } else {
            Validator::make($request->all(), [
                'company_name' => 'required|string|max:255',
                'first_name' => 'sometimes|nullable',
                'surname' => 'sometimes|nullable',
                'other_names' => 'sometimes|nullable',
            ])->validate();

            $validated['first_name'] = null;
            $validated['other_names'] = null;
            $validated['surname'] = null;
            // Ensure individual fields are null
        }

        // Create the guarantor
        BLSGuarantor::create($validated);

        return redirect()->route('systemconfiguration0.guarantors.index')
            ->with('success', 'Guarantor created successfully.');
    }

    public function directstore(Request $request)
    {
        // Validate input
        $validated = $request->validate([
            'guarantor_type' => 'required|in:individual,company',
            'first_name' => 'nullable|string|max:255',
            'other_names' => 'nullable|string|max:255',
            'surname' => 'nullable|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'email' => 'required|email|max:255|unique:bls_guarantors',
            'phone' => 'nullable|string|max:13',
        ]);

        // Ensure either individual or company fields are filled, but not both
        if ($validated['guarantor_type'] == 'individual') {
            Validator::make($request->all(), [
                'first_name' => 'required|string|max:255',
                'surname' => 'required|string|max:255',
                'company_name' => 'sometimes|nullable',
            ])->validate();
             $validated['company_name'] = null;  // Ensure company_name is null
        } else {
            Validator::make($request->all(), [
                'company_name' => 'required|string|max:255',
                'first_name' => 'sometimes|nullable',
                'surname' => 'sometimes|nullable',
                'other_names' => 'sometimes|nullable',
            ])->validate();
             $validated['first_name'] = null;
             $validated['other_names'] = null;
             $validated['surname'] = null; // Ensure individual fields are null
        }

        // Create the guarantor
        $guarantor = BLSGuarantor::create($validated);

        // Return the created guarantor as JSON
        return response()->json([
            'id' => $guarantor->id,
            'guarantor_type' => $guarantor->guarantor_type,
            'first_name' => $guarantor->first_name,
            'other_names' => $guarantor->other_names,
            'surname' => $guarantor->surname,
            'company_name' => $guarantor->company_name,
            'email' => $guarantor->email,
            'phone' => $guarantor->phone,

        ]);
    }

    /**
     * Show the form for editing the specified guarantor.
     */
    public function edit(BLSGuarantor $guarantor)
    {
        return inertia('SystemConfiguration/LoanSetup/Guarantors/Edit', [
            'guarantor' => $guarantor,
        ]);
    }

    /**
     * Update the specified guarantor in storage.
     */
    public function update(Request $request, BLSGuarantor $guarantor)
    {
        // Validate input
        $validated = $request->validate([
            'guarantor_type' => 'required|in:individual,company',
            'first_name' => 'nullable|string|max:255',
            'other_names' => 'nullable|string|max:255',
            'surname' => 'nullable|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'email' => 'required|email|max:255|unique:bls_guarantors,email,' . $guarantor->id,  // Ignore current guarantor's email for unique check
            'phone' => 'nullable|string|max:13',
        ]);

        // Ensure either individual or company fields are filled, but not both
        if ($validated['guarantor_type'] == 'individual') {
            Validator::make($request->all(), [
                'first_name' => 'required|string|max:255',
                'surname' => 'required|string|max:255',
                'company_name' => 'sometimes|nullable',
            ])->validate();
            $validated['company_name'] = null; // Ensure company_name is null

        } else {
            Validator::make($request->all(), [
                'company_name' => 'required|string|max:255',
                'first_name' => 'sometimes|nullable',
                'surname' => 'sometimes|nullable',
                'other_names' => 'sometimes|nullable',
            ])->validate();
            $validated['first_name'] = null;
            $validated['other_names'] = null;
            $validated['surname'] = null; // Ensure individual fields are null

        }

        // Update the guarantor
        $guarantor->update($validated);

        return redirect()->route('systemconfiguration0.guarantors.index')
            ->with('success', 'Guarantor updated successfully.');
    }

    /**
     * Remove the specified guarantor from storage.
     */
    public function destroy(BLSGuarantor $guarantor)
    {
        $guarantor->delete();

        return redirect()->route('systemconfiguration0.guarantors.index')
            ->with('success', 'Guarantor deleted successfully.');
    }

    /**
     * Search for guarantors based on query.
     */
    // public function search(Request $request)
    // {
    //     $query = $request->input('query');
    //     $guarantors = BLSGuarantor::where('first_name', 'like', '%' . $query . '%')
    //         ->orWhere('other_names', 'like', '%' . $query . '%')
    //         ->orWhere('surname', 'like', '%' . $query . '%')
    //         ->orWhere('company_name', 'like', '%' . $query . '%')
    //         ->get();

    //     // Return JSON response instead of an Inertia page
    //     return response()->json(['guarantors' => $guarantors]);
    // }

    //GuarantorController
    public function search(Request $request)
    {
        $query = $request->input('query');

        $guarantors = BlsGuarantor::where('guarantor_type', 'individual')
            ->where(function ($individualQuery) use ($query) {
                $individualQuery->where('first_name', 'like', "%{$query}%")
                    ->orWhere('surname', 'like', "%{$query}%");
            })
            ->orWhere(function ($companyQuery) use ($query) {
                $companyQuery->where('guarantor_type', 'company')
                    ->where('company_name', 'like', "%{$query}%");
            })
            ->get();
        
        return response()->json(['guarantors' => $guarantors]);
        //return response()->json($guarantors);
    }
}