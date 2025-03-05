import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { faUsers, faHandHoldingUsd, faPiggyBank, faMoneyCheckAlt, faWallet } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function Dashboard() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Members Card */}
                        <div className="bg-white shadow-md rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-blue-500 rounded-full">
                                    <FontAwesomeIcon icon={faUsers} className="text-white" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-gray-600">Total Members</p>
                                    <h3 className="text-2xl font-bold">320</h3>
                                    <div className="mt-2">
                                        <a href="#" className="text-blue-500 hover:underline">Manage Members</a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Loans Card */}
                        <div className="bg-white shadow-md rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-green-500 rounded-full">
                                    <FontAwesomeIcon icon={faHandHoldingUsd} className="text-white" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-gray-600">Total Loans</p>
                                    <h3 className="text-2xl font-bold">Tsh 10M</h3>
                                    <div className="mt-2">
                                        <a href="#" className="text-green-500 hover:underline">View Loans</a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Savings Card */}
                        <div className="bg-white shadow-md rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-yellow-500 rounded-full">
                                    <FontAwesomeIcon icon={faPiggyBank} className="text-white" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-gray-600">Total Savings</p>
                                    <h3 className="text-2xl font-bold">Tsh 15M</h3>
                                    <div className="mt-2">
                                        <a href="#" className="text-yellow-500 hover:underline">View Savings</a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Repayments Card */}
                        <div className="bg-white shadow-md rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-red-500 rounded-full">
                                    <FontAwesomeIcon icon={faMoneyCheckAlt} className="text-white" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-gray-600">Loan Repayments</p>
                                    <h3 className="text-2xl font-bold">Tsh 7M</h3>
                                    <div className="mt-2">
                                        <a href="#" className="text-red-500 hover:underline">Manage Repayments</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Section for Transactions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        {/* Withdrawals */}
                        <div className="bg-white shadow-md rounded-lg p-6">
                            <h4 className="text-xl font-bold">Total Withdrawals</h4>
                            <p className="text-gray-600">Tsh 5M Processed</p>
                        </div>

                        {/* Loan Applications */}
                        <div className="bg-white shadow-md rounded-lg p-6">
                            <h4 className="text-xl font-bold">Loan Applications</h4>
                            <p className="text-gray-600">12 Pending Approvals</p>
                        </div>

                        {/* Recent Transactions */}
                        <div className="bg-white shadow-md rounded-lg p-6">
                            <h4 className="text-xl font-bold">Recent Transactions</h4>
                            <p className="text-gray-600">Latest member activities and financial transactions</p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

