import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimesCircle, faLock } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { Inertia } from '@inertiajs/inertia';
import Modal from '@/Components/CustomModal';

export default function Edit({ user, userGroups }) {
    const { data, setData, put, errors, processing, reset } = useForm({
        name: user.name,
        email: user.email,
        resetpassword: false,
        usergroup_id: user.usergroup_id,
    });

    const [modalState, setModalState] = useState({
        isOpen: false,
        message: '',
        isAlert: false,
    });
    const [isSaving, setIsSaving] = useState(false);
    const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [remarksError, setRemarksError] = useState('');

    const handleModalClose = () => {
        setModalState({ isOpen: false, message: '', isAlert: false });
    };

    const handleModalConfirm = () => {  
        setModalState({ isOpen: false, message: '', isAlert: false }); 
    };

    const showAlert = (message) => {
        setModalState({ isOpen: true, message, isAlert: true });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSaving(true);
        put(route('usermanagement.users.update', user.id), {
            onSuccess: () => {
                setIsSaving(false);
                resetForm();
            },
            onError: (errors) => {
                console.error(errors);
                setIsSaving(false);
                showAlert('An error occurred while saving the user.');
            },
        });
    };

    const resetForm = () => {
        reset();
        showAlert('User updated successfully!');
    };

    const handleResetPassword = () => {
        // Check if the new password is valid
        if (newPassword.length < 8) {
            setRemarksError('Password must be at least 8 characters long.');
            return;
        }
    
        const resetPasswordData = {
            password: newPassword,
        };    
        
        // API call to reset password
        axios.post(route('usermanagement.users.resetPassword', user.id), resetPasswordData) // Adjust the route as necessary
            .then(response => {              
    
                // Show message from backend or default success message
                if (response.data && response.data.message) {
                    showAlert(response.data.message);
                } else {
                    showAlert('Password reset successfully!'); // Default success message
                }
    
                // Check for successful status
                if (response.status === 200) {
                    setResetPasswordModalOpen(false); // Close modal on success
                    setNewPassword(''); // Clear the password input after confirming
                    setRemarksError(''); // Clear error after confirming
                }
            })
            .catch(error => {
               
                if (error.response) {
                      
                    let errorMessage = 'Failed to reset password. Please try again.';
                    if (error.response.data && error.response.data.message) {
                        errorMessage = error.response.data.message; // Use the backend error message, if available
                    }
                    showAlert(errorMessage); // Show more specific error
                } else {
                    showAlert('Failed to reset password. Please check your network connection.'); // Generic error message for network issues
                }
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

                            {/* Role */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Role</label>
                                    <select
                                        value={data.usergroup_id}
                                        onChange={(e) => setData('usergroup_id', e.target.value)}
                                        className={`w-full border p-2 rounded text-sm ${errors.usergroup_id ? 'border-red-500' : ''}`}
                                    >
                                        <option value="">Select Role</option>
                                        {userGroups.map(group => (
                                            <option key={group.id} value={group.id}>{group.name}</option>
                                        ))}
                                    </select>
                                    {errors.usergroup_id && <p className="text-sm text-red-600">{errors.usergroup_id}</p>}
                                </div>
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
                                <button
                                    type="button"
                                    onClick={() => Inertia.get(route('usermanagement.users.index'))}
                                    className="bg-gray-300 text-gray-700 rounded p-2 flex items-center space-x-2"
                                >
                                    <FontAwesomeIcon icon={faTimesCircle} />
                                    <span>Cancel</span>
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing || isSaving}
                                    className="bg-blue-600 text-white rounded p-2 flex items-center space-x-2"
                                >
                                    <FontAwesomeIcon icon={faSave} />
                                    <span>{isSaving ? 'Saving...' : 'Save User'}</span>
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
