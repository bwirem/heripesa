import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCog,          // Settings
    faMoneyBill,    // Currencies
    faCreditCard,   // Payment Types    
    faLayerGroup,   // Billing Item Group
    faListAlt,      // Packages
    faUsers,        // Customers  
    faUserCheck     // Guarantors
} from '@fortawesome/free-solid-svg-icons';
import { Link } from '@inertiajs/react';

export default function Index() {
    // Placeholder counts (replace with actual values from props or data fetching)
    const currencyCount = 0;
    const paymentTypeCount = 0;
    const feestypeCount = 0;
    const packageCount = 0;
    const customerCount = 0;
    const guarantorCount = 0;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Loan Setup Dashboard
                </h2>
            }
        >
            <Head title="Billing Setup Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">                 

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Currencies */}
                        <div className="bg-white shadow-md rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-red-500 rounded-full">
                                    <FontAwesomeIcon icon={faMoneyBill} className="text-white" aria-label="Currencies" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-gray-600">Currencies</p>
                                    <h3 className="text-2xl font-bold">{currencyCount}</h3>
                                    <div className="mt-2">
                                        <Link href={route('systemconfiguration0.currencies.index')} className="text-red-500 hover:underline">Manage Currencies</Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Types */}
                        <div className="bg-white shadow-md rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-green-500 rounded-full">
                                    <FontAwesomeIcon icon={faCreditCard} className="text-white" aria-label="Payment Types" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-gray-600">Payment Types</p>
                                    <h3 className="text-2xl font-bold">{paymentTypeCount}</h3>
                                    <div className="mt-2">
                                        <Link href={route('systemconfiguration0.paymenttypes.index')} className="text-green-500 hover:underline">Manage Payment Types</Link>
                                    </div>
                                </div>
                            </div>
                        </div>                       

                        {/* Fees Types */}
                        <div className="bg-white shadow-md rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-purple-500 rounded-full">
                                    <FontAwesomeIcon icon={faLayerGroup} className="text-white" aria-label="Fees Types" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-gray-600">Fees Types</p>
                                    <h3 className="text-2xl font-bold">{feestypeCount}</h3>
                                    <div className="mt-2">
                                        <Link href={route('systemconfiguration0.feestypes.index')} className="text-purple-500 hover:underline">Manage Fees Types</Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Packages */}
                        <div className="bg-white shadow-md rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-green-500 rounded-full">
                                    <FontAwesomeIcon icon={faListAlt} className="text-white" aria-label="Packages" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-gray-600">Packages</p>
                                    <h3 className="text-2xl font-bold">{packageCount}</h3>
                                    <div className="mt-2">
                                        <Link href={route('systemconfiguration0.loanpackages.index')} className="text-green-500 hover:underline">Manage Packages</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6"> 
                        {/* Customers */}
                        <div className="bg-white shadow-md rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-blue-500 rounded-full">
                                    <FontAwesomeIcon icon={faUsers} className="text-white" aria-label="Customers" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-gray-600">Customers</p>
                                    <h3 className="text-2xl font-bold">{customerCount}</h3>
                                    <div className="mt-2">
                                        <Link href={route('systemconfiguration0.customers.index')} className="text-blue-500 hover:underline">Manage Customers</Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Guarantors */}
                        <div className="bg-white shadow-md rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-blue-500 rounded-full">
                                    <FontAwesomeIcon icon={faUserCheck} className="text-white" aria-label="Guarantors" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-gray-600">Guarantors</p>
                                    <h3 className="text-2xl font-bold">{guarantorCount}</h3>
                                    <div className="mt-2">
                                        <Link href={route('systemconfiguration0.guarantors.index')} className="text-blue-500 hover:underline">Manage Guarantors</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}

