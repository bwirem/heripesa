import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from '@inertiajs/react';  // Import Link
import {
    faCog,        // Settings
    faLayerGroup, // Expense Item Group
    faListAlt,    // Expense Items
} from '@fortawesome/free-solid-svg-icons';

export default function Index() {
    // Placeholder counts (replace with actual values from props or data fetching)
    const itemGroupCount = 0;
    const expenseItemCount = 0;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Account Setup Dashboard
                </h2>
            }
        >
            <Head title="Account Setup Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                        {/* Expense Item Group */}
                        <div className="bg-white shadow-md rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-purple-500 rounded-full">
                                    <FontAwesomeIcon icon={faLayerGroup} className="text-white" aria-label="Expense Item Group" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-gray-600">Chart Of Account</p>
                                    <h3 className="text-2xl font-bold">{itemGroupCount}</h3>
                                    <div className="mt-2">
                                        <Link href={route('systemconfiguration3.chartofaccounts.index')} className="text-purple-500 hover:underline">Manage Account Option</Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Expense Items */}
                        <div className="bg-white shadow-md rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-green-500 rounded-full">
                                    <FontAwesomeIcon icon={faListAlt} className="text-white" aria-label="Expense Items" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-gray-600">Accounts Mapping</p>
                                    <h3 className="text-2xl font-bold">{expenseItemCount}</h3>
                                    <div className="mt-2">
                                        <Link href={route('systemconfiguration3.chartofaccountmappings.index')} className="text-green-500 hover:underline">Accounts Mapping</Link>
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
