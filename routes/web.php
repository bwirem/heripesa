<?php

use App\Http\Controllers\ProfileController;

use App\Http\Controllers\LoanApplicationController;
use App\Http\Controllers\LoanApprovalController;
use App\Http\Controllers\LoanDisbursementController;
use App\Http\Controllers\LoanReconciliationController;

use App\Http\Controllers\RepaymentSaving;

use App\Http\Controllers\BLSFeesTypeController;
use App\Http\Controllers\BLSPackageController;
use App\Http\Controllers\BLSCurrencyController;
use App\Http\Controllers\BLSPaymentTypeController;
use App\Http\Controllers\BLSCustomerController;
use App\Http\Controllers\BLSGuarantorController;

use App\Http\Controllers\ExpPostController;

use App\Http\Controllers\SEXPItemGroupController;
use App\Http\Controllers\SEXPItemController;




use App\Http\Controllers\LOCCountryController;
use App\Http\Controllers\LOCRegionController;
use App\Http\Controllers\LOCDistrictController;
use App\Http\Controllers\LOCWardController;
use App\Http\Controllers\LOCStreetController;

use App\Http\Controllers\FacilityOptionController;

use App\Http\Controllers\UserGroupController;
use App\Http\Controllers\UserController;


use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),        
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    // Profile routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Order routes
    Route::prefix('loan0')->name('loan0.')->group(function () {
        Route::get('/', [LoanApplicationController::class, 'index'])->name('index');
        Route::get('/create', [LoanApplicationController::class, 'create'])->name('create');
        Route::post('/', [LoanApplicationController::class, 'store'])->name('store');
        Route::get('/{loan}/edit', [LoanApplicationController::class, 'edit'])->name('edit');
        Route::put('/{loan}', [LoanApplicationController::class, 'update'])->name('update');
        Route::put('documentation/{loan}', [LoanApplicationController::class, 'documentation'])->name('documentation');
        Route::post('submit/{loan}', [LoanApplicationController::class, 'submit'])->name('submit');
        Route::get('customerLoans/{customerId}', [LoanApplicationController::class, 'customerLoans'])->name('customerLoans'); 
       
    });

     // Post Bills routes
     Route::prefix('loan1')->name('loan1.')->group(function () {
        Route::get('/', [LoanApprovalController::class, 'index'])->name('index');        
        Route::get('/{loan}/edit', [LoanApprovalController::class, 'edit'])->name('edit');
        Route::put('/{loan}', [LoanApprovalController::class, 'update'])->name('update'); 
        Route::post('approve/{loan}', [LoanApprovalController::class, 'approve'])->name('approve'); 
    });

     // Pay Bills routes
     Route::prefix('loan2')->name('loan2.')->group(function () {
        Route::get('/', [LoanDisbursementController::class, 'index'])->name('index');        
        Route::get('/{loan}/edit', [LoanDisbursementController::class, 'edit'])->name('edit'); 
        Route::post('/disburse/{loan}', [LoanDisbursementController::class, 'disburse'])->name('disburse');  // POST route with no parameter
    
    });

    //routes for Loan Reconciliation (Version 3)
    Route::prefix('loan3')->name('loan3.')->group(function () {

        // Main index route
        Route::get('/', [LoanReconciliationController::class, 'index'])->name('index');

        // --- Normal Adjustment Routes ---
        Route::prefix('normal-adjustment')->name('normal-adjustment.')->group(function () {
            Route::get('/', [LoanReconciliationController::class, 'normalAdjustment'])->name('index'); // or .list, .view, .show, etc. depending on what normalAdjustment() does. I used 'index' to be consistent.
            Route::get('/create', [LoanReconciliationController::class, 'createNormalAdjustment'])->name('create');
            Route::post('/', [LoanReconciliationController::class, 'storeNormalAdjustment'])->name('store'); // Corrected typo: 'srore' to 'store'
            Route::get('/{normaladjustment}/edit', [LoanReconciliationController::class, 'editNormalAdjustment'])->name('edit');
            Route::put('/{normaladjustment}', [LoanReconciliationController::class, 'updateNormalAdjustment'])->name('update');  //Simplified route definition
        });

        // --- Physical Loan Routes ---
        Route::prefix('physical-loan')->name('physical-loan.')->group(function () {
            Route::get('/', [LoanReconciliationController::class, 'physicalLoan'])->name('index');  // Consistent naming
            Route::get('/create', [LoanReconciliationController::class, 'createPhysicalLoan'])->name('create');
            Route::post('/', [LoanReconciliationController::class, 'storePhysicalLoan'])->name('store'); // Commented out, as in the original
            Route::get('/{physicalloan}/edit', [LoanReconciliationController::class, 'editPhysicalLoan'])->name('edit');
            Route::put('/{physicalloan}', [LoanReconciliationController::class, 'updatePhysicalLoan'])->name('update');  //Simplified route definition
       
        });
    });


     // Repayment routes
    Route::prefix('repaymentsavings0')->name('repaymentsavings0.')->group(function () {       
        Route::get('/', [RepaymentSaving::class, 'repayment'])->name('repayment');
        Route::post('/repayment', [RepaymentSaving::class, 'update'])->name('update');  
    });

    // Saving routes
    Route::prefix('repaymentsavings1')->name('repaymentsavings1.')->group(function () {       
        Route::get('/', [RepaymentSaving::class, 'saving'])->name('saving');
        Route::get('/customer/{customerId}', [RepaymentSaving::class, 'showCustomerSaving'])->name('customer');
        Route::post('/saving', [RepaymentSaving::class, 'storeTransaction'])->name('update');        
    });
      
    // expenses routes
    Route::prefix('expenses0')->name('expenses0.')->group(function () {
        Route::get('/', [ExpPostController::class, 'index'])->name('index');
        Route::get('/create', [ExpPostController::class, 'create'])->name('create');
        Route::post('/', [ExpPostController::class, 'store'])->name('store');
        Route::get('/{post}/edit', [ExpPostController::class, 'edit'])->name('edit');
        Route::put('/{post}', [ExpPostController::class, 'update'])->name('update');
        Route::delete('/{post}', [ExpPostController::class, 'destroy'])->name('destroy');
    });

       
   

    
    
    // Routes for loan Setup (Version 3)
    Route::prefix('systemconfiguration0')->name('systemconfiguration0.')->group(function () {

        // Main index route
        Route::get('/', function () {
            return Inertia::render('SystemConfiguration/LoanSetup/Index');
        })->name('index'); // Added a proper route name for the index.


         // --- currencies Routes ---
         Route::prefix('currencies')->name('currencies.')->group(function () {
            Route::get('/', [BLSCurrencyController::class, 'index'])->name('index'); // Lists item groups
            Route::get('/create', [BLSCurrencyController::class, 'create'])->name('create'); // Show form to create new item group
            Route::post('/', [BLSCurrencyController::class, 'store'])->name('store'); // Store new item group
            Route::get('/{itemgroup}/edit', [BLSCurrencyController::class, 'edit'])->name('edit'); // Show form to edit item group
            Route::put('/{itemgroup}', [BLSCurrencyController::class, 'update'])->name('update'); // Update item group
        });


        // --- paymenttypes Routes ---
        Route::prefix('paymenttypes')->name('paymenttypes.')->group(function () {
            Route::get('/', [BLSPaymentTypeController::class, 'index'])->name('index'); // Lists item groups
            Route::get('/create', [BLSPaymentTypeController::class, 'create'])->name('create'); // Show form to create new item group
            Route::post('/', [BLSPaymentTypeController::class, 'store'])->name('store'); // Store new item group
            Route::get('/{paymenttype}/edit', [BLSPaymentTypeController::class, 'edit'])->name('edit'); // Show form to edit item group
            Route::put('/{paymenttype}', [BLSPaymentTypeController::class, 'update'])->name('update'); // Update item group
            Route::delete('/{paymenttype}', [BLSPaymentTypeController::class, 'destroy'])->name('destroy');
            Route::get('/search', [BLSPaymentTypeController::class, 'search'])->name('search');
        });

        // --- pricecategories Routes ---
        Route::prefix('pricecategories')->name('pricecategories.')->group(function () {
            Route::get('/', [BLSPaymentTypeController::class, 'index'])->name('index'); // Lists item groups
            Route::get('/create', [BLSPaymentTypeController::class, 'create'])->name('create'); // Show form to create new item group
            Route::post('/', [BLSPaymentTypeController::class, 'store'])->name('store'); // Store new item group
            Route::get('/{pricecategory}/edit', [BLSPaymentTypeController::class, 'edit'])->name('edit'); // Show form to edit item group
            Route::put('/{pricecategory}', [BLSPaymentTypeController::class, 'update'])->name('update'); // Update item group
        });

        // --- feestype Routes ---
        Route::prefix('feestypes')->name('feestypes.')->group(function () {
            Route::get('/', [BLSFeesTypeController::class, 'index'])->name('index'); 
            Route::get('/create', [BLSFeesTypeController::class, 'create'])->name('create');
            Route::post('/', [BLSFeesTypeController::class, 'store'])->name('store'); 
            Route::get('/{feestype}/edit', [BLSFeesTypeController::class, 'edit'])->name('edit');
            Route::put('/{feestype}', [BLSFeesTypeController::class, 'update'])->name('update');
            Route::delete('/{feestype}', [BLSFeesTypeController::class, 'destroy'])->name('destroy');
            Route::get('/search', [BLSFeesTypeController::class, 'search'])->name('search'); 
        });

        // --- packages Routes ---
        Route::prefix('loanpackages')->name('loanpackages.')->group(function () {
            Route::get('/', [BLSPackageController::class, 'index'])->name('index'); 
            Route::get('/create', [BLSPackageController::class, 'create'])->name('create');
            Route::post('/', [BLSPackageController::class, 'store'])->name('store'); 
            Route::get('/{loanpackage}/edit', [BLSPackageController::class, 'edit'])->name('edit'); 
            Route::put('/{loanpackage}', [BLSPackageController::class, 'update'])->name('update'); 
            Route::get('/search', [BLSPackageController::class, 'search'])->name('search'); 
        });

         // --- customers Routes ---
         Route::prefix('customers')->name('customers.')->group(function () {
            Route::get('/', [BLSCustomerController::class, 'index'])->name('index'); 
            Route::get('/create', [BLSCustomerController::class, 'create'])->name('create'); 
            Route::post('/', [BLSCustomerController::class, 'store'])->name('store'); 
            Route::post('/directstore', [BLSCustomerController::class, 'directstore'])->name('directstore');
            Route::get('/{customer}/edit', [BLSCustomerController::class, 'edit'])->name('edit'); 
            Route::put('/{customer}', [BLSCustomerController::class, 'update'])->name('update');
            Route::get('/search', [BLSCustomerController::class, 'search'])->name('search'); 
        });

        // --- guarantors Routes ---
        Route::prefix('guarantors')->name('guarantors.')->group(function () {
            Route::get('/', [BLSGuarantorController::class, 'index'])->name('index'); 
            Route::get('/create', [BLSGuarantorController::class, 'create'])->name('create'); 
            Route::post('/', [BLSGuarantorController::class, 'store'])->name('store'); 
            Route::post('/directstore', [BLSGuarantorController::class, 'directstore'])->name('directstore');
            Route::get('/{guarantor}/edit', [BLSGuarantorController::class, 'edit'])->name('edit'); 
            Route::put('/{guarantor}', [BLSGuarantorController::class, 'update'])->name('update');
            Route::get('/search', [BLSGuarantorController::class, 'search'])->name('search'); 
        });


    });

    
    // Routes for Expenses Setup (Version 3)
    Route::prefix('systemconfiguration1')->name('systemconfiguration1.')->group(function () {

        // Main index route
        Route::get('/', function () {
            return Inertia::render('SystemConfiguration/ExpensesSetup/Index');
        })->name('index'); // Added a proper route name for the index.


         // --- itemgroups Routes ---
        Route::prefix('itemgroups')->name('itemgroups.')->group(function () {
            Route::get('/', [SEXPItemGroupController::class, 'index'])->name('index'); 
            Route::get('/create', [SEXPItemGroupController::class, 'create'])->name('create'); 
            Route::post('/', [SEXPItemGroupController::class, 'store'])->name('store'); 
            Route::get('/{itemgroup}/edit', [SEXPItemGroupController::class, 'edit'])->name('edit'); 
            Route::put('/{itemgroup}', [SEXPItemGroupController::class, 'update'])->name('update'); 
            Route::delete('/{itemgroup}', [SEXPItemGroupController::class, 'destroy'])->name('destroy');
            Route::get('/search', [SEXPItemGroupController::class, 'search'])->name('search'); 
        });

          // --- items Routes ---
        Route::prefix('items')->name('items.')->group(function () {
            Route::get('/', [SEXPItemController::class, 'index'])->name('index');
            Route::get('/create', [SEXPItemController::class, 'create'])->name('create');
            Route::post('/', [SEXPItemController::class, 'store'])->name('store');
            Route::get('/{item}/edit', [SEXPItemController::class, 'edit'])->name('edit');
            Route::put('/{item}', [SEXPItemController::class, 'update'])->name('update'); 
            Route::delete('/{item}', [SEXPItemController::class, 'destroy'])->name('destroy');
            Route::get('/search', [SEXPItemController::class, 'search'])->name('search'); 
        });
        

    });
 
    // Routes for Location Setup (Version 3)
    Route::prefix('systemconfiguration2')->name('systemconfiguration2.')->group(function () {

        // Main index route
        Route::get('/', function () {
            return Inertia::render('SystemConfiguration/LocationSetup/Index');
        })->name('index'); // Added a proper route name for the index.


         // --- countries Routes ---
        Route::prefix('countries')->name('countries.')->group(function () {
            Route::get('/', [LOCCountryController::class, 'index'])->name('index'); 
            Route::get('/create', [LOCCountryController::class, 'create'])->name('create'); 
            Route::post('/', [LOCCountryController::class, 'store'])->name('store'); 
            Route::get('/{country}/edit', [LOCCountryController::class, 'edit'])->name('edit'); 
            Route::put('/{country}', [LOCCountryController::class, 'update'])->name('update'); 
            Route::delete('/{country}', [LOCCountryController::class, 'destroy'])->name('destroy');
            Route::get('/search', [LOCCountryController::class, 'search'])->name('search'); 
        });

        // --- Product regions Routes ---
        Route::prefix('regions')->name('regions.')->group(function () {
            Route::get('/', [LOCRegionController::class, 'index'])->name('index');
            Route::get('/create', [LOCRegionController::class, 'create'])->name('create');
            Route::post('/', [LOCRegionController::class, 'store'])->name('store');
            Route::get('/{region}/edit', [LOCRegionController::class, 'edit'])->name('edit');
            Route::put('/{region}', [LOCRegionController::class, 'update'])->name('update'); 
            Route::delete('/{region}', [LOCRegionController::class, 'destroy'])->name('destroy');
        });

        // --- District Routes ---
        Route::prefix('districts')->name('districts.')->group(function () {
            Route::get('/', [LOCDistrictController::class, 'index'])->name('index');
            Route::get('/create', [LOCDistrictController::class, 'create'])->name('create');
            Route::post('/', [LOCDistrictController::class, 'store'])->name('store');
            Route::get('/{district}/edit', [LOCDistrictController::class, 'edit'])->name('edit');
            Route::put('/{district}', [LOCDistrictController::class, 'update'])->name('update'); 
            Route::delete('/{district}', [LOCDistrictController::class, 'destroy'])->name('destroy');
        });

        // --- Ward Routes ---
        Route::prefix('wards')->name('wards.')->group(function () {
            Route::get('/', [LOCWardController::class, 'index'])->name('index');
            Route::get('/create', [LOCWardController::class, 'create'])->name('create');
            Route::post('/', [LOCWardController::class, 'store'])->name('store');
            Route::get('/{ward}/edit', [LOCWardController::class, 'edit'])->name('edit');
            Route::put('/{ward}', [LOCWardController::class, 'update'])->name('update'); 
            Route::delete('/{ward}', [LOCWardController::class, 'destroy'])->name('destroy');
        });

        // --- Street Routes ---
        Route::prefix('streets')->name('streets.')->group(function () {
            Route::get('/', [LOCStreetController::class, 'index'])->name('index');
            Route::get('/create', [LOCStreetController::class, 'create'])->name('create');
            Route::post('/', [LOCStreetController::class, 'store'])->name('store');
            Route::get('/{street}/edit', [LOCStreetController::class, 'edit'])->name('edit');
            Route::put('/{street}', [LOCStreetController::class, 'update'])->name('update'); 
            Route::delete('/{street}', [LOCStreeetController::class, 'destroy'])->name('destroy');
        });   
        

    });


    // Routes for Facility Setup (Version 3)
    Route::prefix('systemconfiguration3')->name('systemconfiguration3.')->group(function () {

        // Main index route
        Route::get('/', function () {
            return Inertia::render('SystemConfiguration/FacilitySetup/Index');
        })->name('index'); // Added a proper route name for the index.

         // --- facilityoption Routes ---
         Route::prefix('facilityoptions')->name('facilityoptions.')->group(function () {
            Route::get('/', [FacilityOptionController::class, 'index'])->name('index');
            Route::get('/create', [FacilityOptionController::class, 'create'])->name('create');
            Route::post('/', [FacilityOptionController::class, 'store'])->name('store');
            Route::get('/{facilityoption}/edit', [FacilityOptionController::class, 'edit'])->name('edit');
            Route::put('/{facilityoption}', [FacilityOptionController::class, 'update'])->name('update'); 
            Route::delete('/{facilityoption}', [FacilityOptionController::class, 'destroy'])->name('destroy');
            Route::get('/search', [FacilityOptionController::class, 'search'])->name('search');
        });   

    });


    // Routes for User Management(Version 3)
    Route::prefix('usermanagement')->name('usermanagement.')->group(function () {

        // Main index route
        Route::get('/', function () {
            return Inertia::render('UserManagement/Index');
        })->name('index'); // Added a proper route name for the index.

         // --- usergroup Routes ---
         Route::prefix('usergroups')->name('usergroups.')->group(function () {
            Route::get('/', [UserGroupController::class, 'index'])->name('index');
            Route::get('/create', [UserGroupController::class, 'create'])->name('create');
            Route::post('/', [UserGroupController::class, 'store'])->name('store');
            Route::get('/{usergroup}/edit', [UserGroupController::class, 'edit'])->name('edit');
            Route::put('/{usergroup}', [UserGroupController::class, 'update'])->name('update'); 
            Route::delete('/{usergroup}', [UserGroupController::class, 'destroy'])->name('destroy');
        });   

         // --- user Routes ---
         Route::prefix('users')->name('users.')->group(function () {
            Route::get('/', [UserController::class, 'index'])->name('index');
            Route::get('/create', [UserController::class, 'create'])->name('create');
            Route::post('/', [UserController::class, 'store'])->name('store');
            Route::get('/{user}/edit', [UserController::class, 'edit'])->name('edit');
            Route::put('/{user}', [UserController::class, 'update'])->name('update'); 
            Route::delete('/{user}', [UserController::class, 'destroy'])->name('destroy');
        });   

    });
    
});


require __DIR__.'/auth.php';
