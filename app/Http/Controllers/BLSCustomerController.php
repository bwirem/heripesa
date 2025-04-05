<?php

namespace App\Http\Controllers;

use App\Models\BLSCustomer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Enums\CustomerType;
use App\Enums\DocumentType;



class BLSCustomerController extends Controller
{
    /**
     * Display a listing of BLSCustomers.
     */
    public function index(Request $request)
    {
        $query = BLSCustomer::query();

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
        $customers = $query->orderBy('created_at', 'desc')->paginate(10);

        return inertia('Customers/Index', [
            'customers' => $customers,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new customer.
     */
    public function create()
    {
        // Get customer types from the enum
        $customerTypes = CustomerType::cases();
        $customerTypes = array_map(fn($type) => ['value' => $type->value, 'label' => $type->label()], $customerTypes);

        return inertia('Customers/Create', [
            'customerTypes' => $customerTypes,
        ]);
    }

    /**
     * Store a newly created customer in storage.
     */
    public function store(Request $request)
    {
        // Validate input using enum values
        $validated = $request->validate([
            'customer_type' => ['required', 'in:' . implode(',', CustomerType::values())],
            'first_name' => 'nullable|string|max:255',
            'other_names' => 'nullable|string|max:255',
            'surname' => 'nullable|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'email' => 'required|email|max:255|unique:bls_customers',
            'phone' => 'nullable|string|max:13',
            'address' => 'nullable|string|max:255',
        ]);

        // Ensure either individual or company fields are filled, but not both
        if ($validated['customer_type'] == CustomerType::INDIVIDUAL->value) {
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

        // Create the customer
        $customer = BLSCustomer::create($validated);  

        return redirect()->route('customer0.edit', ['customer' => $customer->id])          
            ->with('success', 'Customer created successfully.');
    }

    public function directstore(Request $request)
    {
        // Validate input using enum values
        $validated = $request->validate([
            'customer_type' => ['required', 'in:' . implode(',', CustomerType::values())],
            'first_name' => 'nullable|string|max:255',
            'other_names' => 'nullable|string|max:255',
            'surname' => 'nullable|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'email' => 'required|email|max:255|unique:bls_customers',
            'phone' => 'nullable|string|max:13',            
        ]);

        // Ensure either individual or company fields are filled, but not both
        if ($validated['customer_type'] == CustomerType::INDIVIDUAL->value) {
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

        // Create the customer
        $customer = BLSCustomer::create($validated);

        // Return the created customer as JSON
        return response()->json([
            'id' => $customer->id,
            'customer_type' => $customer->customer_type,
            'first_name' => $customer->first_name,
            'other_names' => $customer->other_names,
            'surname' => $customer->surname,
            'company_name' => $customer->company_name,
            'email' => $customer->email,
            'phone' => $customer->phone,
        ]);
    }

    /**
     * Show the form for editing the specified customer.
     */
    public function edit(BLSCustomer $customer)
    {
        $customerTypes = CustomerType::cases();
        $customerTypes = array_map(fn($type) => ['value' => $type->value, 'label' => $type->label()], $customerTypes);

        $documentTypes= DocumentType::cases();
        $documentTypes = array_map(fn($type) => ['value' => $type->value, 'label' => $type->label()], $documentTypes);

        return inertia('Customers/Edit', [
            'customer' => $customer,
            'customerTypes' => $customerTypes,
            'documentTypes' => $documentTypes,
        ]);
    }

    /**
     * Update the specified customer in storage.
     */
    public function update(Request $request, BLSCustomer $customer)
    {
        // Validate input using enum values
        $validated = $request->validate([
            'customer_type' => ['required', 'in:' . implode(',', CustomerType::values())],
            'first_name' => 'nullable|string|max:255',
            'other_names' => 'nullable|string|max:255',
            'surname' => 'nullable|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'email' => 'required|email|max:255|unique:bls_customers,email,' . $customer->id,  // Ignore current customer's email for unique check
            'phone' => 'nullable|string|max:13',
            'address' => 'nullable|string|max:255',
        ]);

        // Ensure either individual or company fields are filled, but not both
        if ($validated['customer_type'] == CustomerType::INDIVIDUAL->value) {
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

        // Update the customer
        $customer->update($validated);

        return redirect()->route('customer0.index')
            ->with('success', 'Customer updated successfully.');
    }

    /**
     * Remove the specified customer from storage.
     */
    public function destroy(BLSCustomer $customer)
    {
        $customer->delete();

        return redirect()->route('customer0.index')
            ->with('success', 'Customer deleted successfully.');
    }

    /**
     * Search for customers based on query.
     */
    public function search(Request $request)
    {
        $query = $request->input('query');
        $customers = BLSCustomer::where('first_name', 'like', '%' . $query . '%')
            ->orWhere('other_names', 'like', '%' . $query . '%')
            ->orWhere('surname', 'like', '%' . $query . '%')
            ->orWhere('company_name', 'like', '%' . $query . '%')
            ->get();

        // Return JSON response instead of an Inertia page
        return response()->json(['customers' => $customers]);
    }
}
