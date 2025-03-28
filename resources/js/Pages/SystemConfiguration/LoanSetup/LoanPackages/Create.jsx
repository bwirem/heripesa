import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/CustomModal';
import { Head,Link, useForm } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import { useState } from 'react';

// Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';

export default function Create() {
    // Form Handling
    const { data, setData, post, errors, processing, reset } = useForm({
        name: '',
        duration: '',
        interest_type: '',
        interest_rate: '',
    });

    // State Management
    const [modalState, setModalState] = useState({ isOpen: false, message: '', isAlert: false });
    const [isSaving, setIsSaving] = useState(false);


    // Handlers
    const handleModalClose = () => setModalState({ isOpen: false, message: '', isAlert: false });
    const showAlert = (message) => setModalState({ isOpen: true, message, isAlert: true });
    const resetForm = () => { reset(); showAlert('loanpackage created successfully!'); };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSaving(true);
        post(route('systemconfiguration0.loanpackages.store'), {
            onSuccess: () => { setIsSaving(false); resetForm(); },
            onError: () => { setIsSaving(false); showAlert('An error occurred while saving the loanpackage.'); },
        });
    };


    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">New Package</h2>}>
            <Head title="New Package" />
            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow sm:rounded-lg">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name and loanpackage Group */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 {/* Name */}
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
                                {/* Duration */}
                                <div className="relative flex-1">
                                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mr-2">Duration (Months)</label>
                                    <input
                                        id="duration"
                                        type="number"
                                        placeholder="Enter Duration..."
                                        value={data.duration}
                                        onChange={(e) => setData('duration', e.target.value)}
                                        className={`w-full border p-2 rounded text-sm ${errors.duration ? 'border-red-500' : ''}`}
                                    />
                                    {errors.duration && <p className="text-sm text-red-600 mt-1">{errors.duration}</p>}
                                </div>
                            </div>


                            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                                <div className="relative flex-1">
                                    <label className="block text-sm font-medium text-gray-700">Interest Type</label>
                                    <select
                                        value={data.interest_type}
                                        onChange={(e) => setData('interest_type', e.target.value)}
                                        className="w-full border p-2 rounded text-sm"
                                    >
                                        <option value="">Select Interest Type</option>
                                        <option value="fixed">Fixed</option>
                                        <option value="variable">Variable</option>
                                    </select>
                                    {errors.interest_type && <p className="text-sm text-red-600">{errors.interest_type}</p>}
                                </div>

                                <div className="relative flex-1">
                                    <label htmlFor="interest_rate" className="block text-sm font-medium text-gray-700 mr-2">Interest Rate (%)</label>
                                    <input
                                        id="interest_rate"
                                        type="number"
                                        placeholder="Enter Interest Rate..."
                                        value={data.interest_rate}
                                        onChange={(e) => setData('interest_rate', e.target.value)}
                                        className={`w-full border p-2 rounded text-sm ${errors.interest_rate ? 'border-red-500' : ''}`}
                                    />
                                    {errors.interest_rate && <p className="text-sm text-red-600 mt-1">{errors.interest_rate}</p>}
                                </div>

                            </div>


                            {/* Buttons */}
                            <div className="flex justify-end space-x-4">
                                <Link
                                    href={route('systemconfiguration0.loanpackages.index')}  // Using the route for navigation
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

            {/* Alert Modal */}
            <Modal
                isOpen={modalState.isOpen}
                onClose={handleModalClose}
                title={modalState.isAlert ? "Alert" : "Confirm Action"}
                message={modalState.message}
                isAlert={modalState.isAlert}
            />
        </AuthenticatedLayout>
    );
}