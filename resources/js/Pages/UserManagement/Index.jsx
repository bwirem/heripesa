import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUsers,
    faUserShield,
    faLockOpen,
    faShieldAlt,
    faKey,
    faFingerprint,
    faExclamationTriangle // ADD THIS LINE!
} from '@fortawesome/free-solid-svg-icons';

export default function SecuritySettings() { // Component name changed to SecuritySettings
    // Placeholder counts
    const userCount = 0; // Replace with actual value
    const roleCount = 0; // Replace with actual value
    const permissionCount = 0; // Replace with actual value
    const securityPolicyCount = 0; // Replace with actual value
    const alertCount = 0; // Replace with actual value

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Security Settings Dashboard
                </h2>
            }
        >
            <Head title="Security Settings Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* User Management Section */}
                        <div className="bg-white shadow-md rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-red-500 rounded-full">
                                    <FontAwesomeIcon icon={faUsers} className="text-white" aria-label="User Management" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-gray-600">User Management</p>
                                    <h3 className="text-2xl font-bold">{userCount}</h3>
                                    <div className="mt-2">
                                        <a href={route('usermanagement.users.index')} className="text-purple-500 hover:underline">Manage Users</a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Role Management Section */}
                        <div className="bg-white shadow-md rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-blue-500 rounded-full">
                                    <FontAwesomeIcon icon={faUserShield} className="text-white" aria-label="Role Management" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-gray-600">Role Management</p>
                                    <h3 className="text-2xl font-bold">{roleCount}</h3>
                                    <div className="mt-2">                                     
                                        <a href={route('usermanagement.usergroups.index')} className="text-purple-500 hover:underline">Manage Roles</a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Permission Management Section */}
                        <div className="bg-white shadow-md rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-green-500 rounded-full">
                                    <FontAwesomeIcon icon={faLockOpen} className="text-white" aria-label="Permission Management" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-gray-600">Permission Management</p>
                                    <h3 className="text-2xl font-bold">{permissionCount}</h3>
                                    <div className="mt-2">
                                        <a href="/permission-management" className="text-green-500 hover:underline">Manage Permissions</a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security Policies Section */}
                        <div className="bg-white shadow-md rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-yellow-500 rounded-full">
                                    <FontAwesomeIcon icon={faShieldAlt} className="text-white" aria-label="Security Policies" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-gray-600">Security Policies</p>
                                    <h3 className="text-2xl font-bold">{securityPolicyCount}</h3>
                                    <div className="mt-2">
                                        <a href="/security-policies" className="text-yellow-500 hover:underline">Manage Policies</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                        {/* Alerts Section */}
                        <div className="bg-white shadow-md rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-orange-500 rounded-full">
                                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-white" aria-label="Alerts" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-gray-600">Alerts</p>
                                    <h3 className="text-2xl font-bold">{alertCount}</h3>
                                    <div className="mt-2">
                                        <a href="/alerts" className="text-orange-500 hover:underline">View Alerts</a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security Keys Section */}
                        <div className="bg-white shadow-md rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-purple-500 rounded-full">
                                    <FontAwesomeIcon icon={faKey} className="text-white" aria-label="Security Keys" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-gray-600">Security Keys</p>
                                    <h3 className="text-2xl font-bold">N/A</h3>
                                    <div className="mt-2">
                                        <a href="/security-keys" className="text-purple-500 hover:underline">Manage Keys</a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Biometric Security Section */}
                        <div className="bg-white shadow-md rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-teal-500 rounded-full">
                                    <FontAwesomeIcon icon={faFingerprint} className="text-white" aria-label="Biometric Security" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-gray-600">Biometric Security</p>
                                    <h3 className="text-2xl font-bold">N/A</h3>
                                    <div className="mt-2">
                                        <a href="/biometric-security" className="text-teal-500 hover:underline">Manage Biometric</a>
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