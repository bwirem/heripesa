<?php

namespace App\Http\Controllers;

use App\Models\UserGroup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response; // Import the Response facade

class UserPermissionController extends Controller
{
    /**
     * Display a listing of UserPermission.
     */
    public function index(Request $request)
    {
        $query = UserGroup::query();

        // Search functionality
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Paginate the results
        $usergroups = $query->orderBy('created_at', 'desc')->paginate(10);

        return inertia('UserManagement/UserPermission/Index', [
            'usergroups' => $usergroups,
            'modules' => $this->getModules(), // Call as method
            'moduleitems' => $this->getModuleItems(), // Call as method
            'functionaccess' => $this->getFunctionAccess(), //Call as method
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Get the modules data.
     *
     * @return array
     */
    private function getModules(): array // Make private, use return type
    {
        $modules = [
            ['modulekey' => 'loan', 'moduletext' => 'Loan Management'],
            ['modulekey' => 'repaymentsSavings', 'moduletext' => 'Repayments & Savings'],
            ['modulekey' => 'expenses', 'moduletext' => 'Expenses'],
            ['modulekey' => 'humanresurces', 'moduletext' => 'Human Resource'],
            ['modulekey' => 'accounting', 'moduletext' => 'Financial Accounting'],
            ['modulekey' => 'reporting', 'moduletext' => 'Reporting/Analytics'],
            ['modulekey' => 'systemConfig', 'moduletext' => 'System Configuration'],
            ['modulekey' => 'userManagement', 'moduletext' => 'User Management'],
            ['modulekey' => 'security', 'moduletext' => 'Security'],
        ];

        return $modules;
    }

    /**
     * Get the module items data.
     *
     * @return array
     */
    private function getModuleItems(): array  // Make private, use return type
    {
        $moduleItems = [
            'loan' => [
                ['key' => 'loan0', 'text' => 'Application'],
                ['key' => 'loan1', 'text' => 'Approval Workflow'],
                ['key' => 'loan2', 'text' => 'Disbursement'],
                ['key' => 'loan3', 'text' => 'Reconciliation'],
                ['key' => 'loan4', 'text' => 'History'],
            ],
            'repaymentsSavings' => [
                ['key' => 'repaymentsavings0', 'text' => 'Repayments'],
                ['key' => 'repaymentsavings1', 'text' => 'Savings'],
                ['key' => 'repaymentsavings2', 'text' => 'Collections'],
            ],
            'expenses' => [
                ['key' => 'expenses0', 'text' => 'Post Expenses'],
                ['key' => 'expenses1', 'text' => 'Expenses History'],
            ],
            'humanresurces' => [
                ['key' => 'humanresurces0', 'text' => 'Employee Bio Data'],
                ['key' => 'humanresurces1', 'text' => 'Import Employee Data'],
                ['key' => 'humanresurces2', 'text' => 'Termination'],
                ['key' => 'humanresurces3', 'text' => 'Payroll'],
            ],
            'accounting' => [
                ['key' => 'accounting0', 'text' => 'General Ledger'],
                ['key' => 'accounting1', 'text' => 'Profit & Loss Statements'],
            ],
            'reporting' => [
                ['key' => 'reportingAnalytics0', 'text' => 'Loan Portfolio Reports'],
                ['key' => 'reportingAnalytics1', 'text' => 'Client Activity Reports'],
                ['key' => 'reportingAnalytics2', 'text' => 'Financial Performance Analytics'],
            ],
            'systemConfig' => [
                ['key' => 'systemconfiguration0', 'text' => 'Loan Setup'],
                ['key' => 'systemconfiguration1', 'text' => 'Expenses Setup'],
                ['key' => 'systemconfiguration2', 'text' => 'Human Resource Setup'],
                ['key' => 'systemconfiguration3', 'text' => 'Accounting Setup'],
                ['key' => 'systemconfiguration4', 'text' => 'Location Setup'],
                ['key' => 'systemconfiguration5', 'text' => 'Facility Setup'],
            ],
            'userManagement' => [], // No subitems
            'security' => [], // No subitems
        ];

        return $moduleItems;
    }

    /**
     * Get the function access data.  This could potentially be read from a database.
     * For simplicity, we'll define a default set here.
     *
     * @return array
     */
    private function getFunctionAccess(): array
    {
        $functionAccess = [
            'create' => true,
            'read' => true,
            'update' => false,
            'delete' => false,
        ];

        return $functionAccess;
    }
}