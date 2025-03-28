import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head,Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimesCircle, faLock } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { Inertia } from '@inertiajs/inertia';
import Modal from '@/Components/CustomModal';
import axios from 'axios';


export default function Edit({ user, userGroups, facilityBranches,assignedBranchIds }) {
    const { data, setData, put, errors, processing } = useForm({
        name: user.name,
        email: user.email,
        usergroup_id: user.usergroup_id,
        facilitybranch_id: user.facilitybranch_id,
        selectedBranches: assignedBranchIds || [], // Set assigned branches initially
    });

    const [modalState, setModalState] = useState({ isOpen: false, message: '', isAlert: false });
    const [isSaving, setIsSaving] = useState(false);
    const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [remarksError, setRemarksError] = useState('');

    useEffect(() => {
        if (user && user.facilityBranches) {
            setData('selectedBranches', user.facilityBranches.map(branch => branch.id));
        }
    }, [user]);

    useEffect(() => {
        if (user?.facilityBranches) {
            setSelectedBranches(user.facilityBranches.map(branch => branch.id));
            setData('selectedBranches', user.facilityBranches.map(branch => branch.id));
        }
    }, [user]);

    const handleModalClose = () => setModalState({ isOpen: false, message: '', isAlert: false });
    const handleModalConfirm = () => { setModalState({ isOpen: false, message: '', isAlert: false }); };
    const showAlert = (message) => setModalState({ isOpen: true, message, isAlert: true });


    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSaving(true);

        put(route('usermanagement.users.update', user.id), {
            ...data,
            onSuccess: () => {
                setIsSaving(false);
                showAlert('User updated successfully!');
            },
            onError: () => {
                setIsSaving(false);
                showAlert('An error occurred while saving the user.');
            },
        });
    };

    
    useEffect(() => {
        setData('selectedBranches', assignedBranchIds);
    }, [assignedBranchIds]);

    const handleBranchChange = (branchId) => {
        setData('selectedBranches', data.selectedBranches.includes(branchId)
            ? data.selectedBranches.filter(id => id !== branchId)
            : [...data.selectedBranches, branchId]
        );
    };

    const handleResetPassword = () => {
        if (newPassword.length < 8) {
            setRemarksError('Password must be at least 8 characters long.');
            return;
        }

        axios.post(route('usermanagement.users.resetPassword', user.id), { password: newPassword })
            .then(response => {
                showAlert(response.data.message || 'Password reset successfully!');
                if (response.status === 200) {
                    setResetPasswordModalOpen(false);
                    setNewPassword('');
                    setRemarksError('');
                }
            })
            .catch(error => {
                showAlert(error.response?.data?.message || 'Failed to reset password. Please try again.');

            });
    };


    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Edit User</h2>}
        >
            <Head title="Edit User" />
            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow sm:rounded-lg">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name and Email */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={`w-full border p-2 rounded text-sm ${errors.name ? 'border-red-500' : ''}`}
                                        placeholder="Enter name..."
                                    />
                                    {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={`w-full border p-2 rounded text-sm ${errors.email ? 'border-red-500' : ''}`}
                                        placeholder="Enter email..."
                                    />
                                    {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                                </div>
                            </div>

                            {/* Branch and Role */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Branch</label>
                                    <select
                                        value={data.facilitybranch_id}
                                        onChange={(e) => setData('facilitybranch_id', e.target.value)}
                                        className={`w-full border p-2 rounded text-sm ${errors.facilitybranch_id ? 'border-red-500' : ''}`}
                                    >
                                        <option value="">Select Branch</option>
                                        {Array.isArray(facilityBranches) && facilityBranches.map(branch => (
                                            <option key={branch.id} value={branch.id}>{branch.name}</option>
                                        ))}
                                    </select>
                                    {errors.facilitybranch_id && <p className="text-sm text-red-600">{errors.facilitybranch_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Role</label>
                                    <select
                                        value={data.usergroup_id}
                                        onChange={(e) => setData('usergroup_id', e.target.value)}
                                        className={`w-full border p-2 rounded text-sm ${errors.usergroup_id ? 'border-red-500' : ''}`}
                                    >
                                        <option value="">Select Role</option>
                                        {Array.isArray(userGroups) && userGroups.map(group => (
                                            <option key={group.id} value={group.id}>{group.name}</option>
                                        ))}
                                    </select>
                                    {errors.usergroup_id && <p className="text-sm text-red-600">{errors.usergroup_id}</p>}
                                </div>
                            </div>

                            {/* FacilityBranches Table */}
                            <div className="flex-1 overflow-x-auto mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Assign Branches</label>
                                <table className="min-w-full border border-gray-300 shadow-md rounded">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="border-b p-3 text-center font-medium text-gray-700"></th>
                                            <th className="border-b p-3 text-center font-medium text-gray-700">Branches</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {facilityBranches && facilityBranches.length > 0 ? (
                                            facilityBranches.map(branch => (
                                                <tr key={branch.id} className={branch.id % 2 === 0 ? 'bg-gray-50' : ''}>
                                                    <td className="border-b p-3 text-gray-700 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={data.selectedBranches.includes(branch.id)}
                                                            onChange={() => handleBranchChange(branch.id)}
                                                        />                                                       
                                                    </td>
                                                    <td className="border-b p-3 text-gray-700">{branch.name}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="2" className="border-b p-3 text-center text-gray-700">No branches found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Role */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <div className="flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => setResetPasswordModalOpen(true)}
                                        className="ml-4 bg-yellow-500 text-white rounded p-2 flex items-center space-x-1"
                                    >
                                        <FontAwesomeIcon icon={faLock} />
                                        <span>Reset Password</span>
                                    </button>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end space-x-4 mt-6">
                                <Link
                                    href={route('usermanagement.users.index')}  // Using the route for navigation
                                    method="get"  // Optional, if you want to define the HTTP method (GET is default)
                                    preserveState={true}  // Keep the page state (similar to `preserveState: true` in the button)
                                    className="bg-gray-300 text-gray-700 rounded p-2 flex items-center space-x-2"
                                >
                                    <FontAwesomeIcon icon={faTimesCircle} />
                                    <span>Cancel</span>
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing || isSaving}
                                    className="bg-blue-600 text-white rounded p-2 flex items-center space-x-2"
                                >
                                    <FontAwesomeIcon icon={faSave} />
                                    <span>{isSaving ? 'Saving...' : 'Save'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Reset Password Modal */}
            <Modal
                isOpen={resetPasswordModalOpen}
                onClose={() => setResetPasswordModalOpen(false)}
                onConfirm={handleResetPassword}
                title="Reset Password"
                confirmButtonText="Reset Password"
            >
                <div>
                    <p>
                        Are you sure you want to reset the password for <strong>{data.email}</strong>?
                    </p>

                    <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mt-4">
                        New Password:
                    </label>
                    <input
                        id="new_password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => {
                            setNewPassword(e.target.value);
                            setRemarksError(''); // Clear error when typing
                        }}
                        className={`mt-1 block w-full border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                        placeholder="Enter new password..."
                    />
                    {remarksError && <p className="text-red-500 text-sm mt-1">{remarksError}</p>}
                </div>
            </Modal>

            {/* Alert Modal */}
            <Modal
                isOpen={modalState.isOpen}
                onClose={handleModalClose}
                onConfirm={handleModalConfirm}
                title={modalState.isAlert ? "Alert" : "Confirm Action"}
                message={modalState.message}
                isAlert={modalState.isAlert}
            />
        </AuthenticatedLayout>
    );
}