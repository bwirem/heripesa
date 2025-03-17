<?php

namespace App\Http\Controllers;

use App\Models\UserGroup;
use App\Models\UserGroupModuleItem;
use App\Models\UserGroupFunction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response; // Import the Response facade
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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

        // Get modules and module items
        $modules = $this->getModules();
        $moduleItems = $this->getModuleItems();

        // Prepare function access data
        $functionAccessData = [];
        foreach ($moduleItems as $moduleKey => $items) {
            foreach ($items as $item) {
                $functionAccessData[$item['key']] = $this->getFunctionAccess($item['key']);
            }
        }

        return inertia('UserManagement/UserPermission/Index', [
            'usergroups' => $usergroups,
            'modules' => $modules,
            'moduleitems' => $moduleItems,
            'functionAccessData' => $functionAccessData, // Include function access data
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Store or update the module item and function access data for a given user group.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $userGroupId
     * @return \Illuminate\Http\JsonResponse
     */
    public function storePermissions(Request $request, int $userGroupId)
    {
        \Log::info('Request Data: ' . json_encode($request->all()));
    
        // Validate the incoming request
        $request->validate([
            'permissions' => 'required|array',
            'permissions.*.moduleItemKey' => 'required|string',
            'permissions.*.functionAccess' => 'required|array',
        ]);
    
        try {
            // Begin database transaction
            DB::transaction(function () use ($request, $userGroupId) {
                foreach ($request->permissions as $permission) {
                    // Find or create the UserGroupModuleItem record
                    $moduleItem = UserGroupModuleItem::firstOrNew(
                        ['usergroup_id' => $userGroupId, 'moduleitemkey' => $permission['moduleItemKey']]
                    );

                    // Save the new module item if it's not already saved
                    if (!$moduleItem->exists) {
                        $moduleItem->save();
                    }
                    
                    // Remove existing function access linked to the module item
                    UserGroupFunction::where('usergroup_id', $userGroupId)
                        ->where('usergroupmoduleitem_id', $moduleItem->id)
                        ->delete();

                    // Create new function access based on the provided data
                    foreach ($permission['functionAccess'] as $accessKey => $accessValue) {
                        if ($accessValue === true) {
                            UserGroupFunction::create([
                                'usergroup_id' => $userGroupId,
                                'usergroupmoduleitem_id' => $moduleItem->id,
                                'functionaccesskey' => $accessKey,
                            ]);
                        }
                    }                    
                }
            });
    
            // Return success response
            return response()->json([
                'success' => 'Permissions updated successfully!'
            ]);
        } catch (\Exception $e) {
            // Log error and return failure response
            \Log::error('Error updating permissions: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to update permissions. Please try again.'
            ], 500);
        }
    }

    /**
     * Get the permissions for a specific user group.
     *
     * @param UserGroup $userGroup
     * @return array
     */
    public function getPermissions(UserGroup $userGroup)
    {
        $permissions = UserGroupModuleItem::with('userGroupFunctions')
            ->where('usergroup_id', $userGroup->id)
            ->get();

        // Transform data to match the needed format.
        $permissionsData = [];
        foreach($permissions as $permission) {
            foreach ($permission->userGroupFunctions as $function) {
                $permissionsData[] = [
                    'moduleitemkey' => $permission->moduleitemkey,
                    'functionaccesskey' => $function->functionaccesskey,
                    //'value' => $function->value, // Get value from your model
                    //'value' => $function->value === null ? false : (bool)$function->value, // Handle null
                    'value' =>true
                ];
            }
        }    
        return $permissionsData;
    }


    public function assignAllPermissionsToAdmin(UserGroup $userGroup)
    {
        \Log::info('Assigning all permissions to Admin group: ' . $userGroup->id);
    
        $modules = $this->getModuleItems();
        
        foreach ($modules as $moduleKey => $items) {
            foreach ($items as $item) {
                \Log::info('Processing module item: ' . $item['key']);
                
                $moduleItem = UserGroupModuleItem::firstOrCreate([
                    'usergroup_id' => $userGroup->id,
                    'moduleitemkey' => $item['key']
                ]);
    
                // Log module item creation
                \Log::info('Module item created/exists: ' . $moduleItem->id);
    
                $functionAccessKeys = $this->getFunctionAccess($item['key']);
                foreach ($functionAccessKeys as $accessKey => $accessValue) {
                    UserGroupFunction::create([
                        'usergroup_id' => $userGroup->id,
                        'usergroupmoduleitem_id' => $moduleItem->id,
                        'functionaccesskey' => $accessKey,
                    ]);
                    \Log::info('Function access created: ' . $accessKey);
                }
            }
        }
    }
    


    /**
     * Get the modules data.
     *
     * @return array
     */
    private function getModules(): array
    {
        return [
            ['modulekey' => 'customer', 'moduletext' => 'Customers'],
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
    }

    /**
     * Get the module items data.
     *
     * @return array
     */
    private function getModuleItems(): array
    {
        return [
            'customer' => [
                ['key' => 'customer0', 'text' => 'Registration'],
                ['key' => 'customer1', 'text' => 'Customer Members'],
                ['key' => 'customer2', 'text' => 'Guarantors'],
            ],
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
            'userManagement' => [
                ['key' => 'userManagement0', 'text' => 'Manage Users'],
            ],
            'security' => [
                ['key' => 'security0', 'text' => 'Audit Trail'],
            ],
        ];
    }

    /**
     * Get the function access data.
     *
     * @param string $key The module item key (e.g., 'customer0', 'reportingAnalytics1').
     * @return array
     */
    // Backend (PHP - UserPermissionController.php) - getFunctionAccess method
    private function getFunctionAccess(string $key): array
    {
        // Default function access (basic permissions)
        $defaultFunctionAccess = [
            'create' => false,
            'read' => false,
            'update' => false,
            'delete' => false,
        ];

        // Add loan-specific permissions only for 'loan1'
        if ($key === 'loan1') {
            return [
                'read' => false, // Set read to false for loan1
                'officerreview' => false, // Default state
                'managerreview' => false,
                'committeereview' => false,
                'approve' => false,                
            ];
        }

        return $defaultFunctionAccess; // Return default for other keys
    }

}
