import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/CustomModal';
import { Head, Link, useForm } from '@inertiajs/react';
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
        duration_unit: 'months', // Default to months
        interest_type: '',
        interest_rate: '',
    });

    // State Management
    const [modalState, setModalState] = useState({ isOpen: false, message: '', isAlert: false });
    const [isSaving, setIsSaving] = useState(false);

    // Handlers
    const handleModalConfirm = () => setModalState({ isOpen: false, message: '', isAlert: false });
    const handleModalClose = () => setModalState({ isOpen: false, message: '', isAlert: false });
    const showAlert = (message) => setModalState({ isOpen: true, message, isAlert: true });
    const resetForm = () => { reset(); showAlert('Loan package created successfully!'); };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSaving(true);
        post(route('systemconfiguration0.loanpackages.store'), {
            onSuccess: () => { setIsSaving(false); resetForm(); },
            onError: () => { setIsSaving(false); showAlert('An error occurred while saving the loan package.'); },
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">New Package</h2>}>
            <Head title="New Package" />
            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow sm:rounded-lg">
                        <form onSubmit={handleSubmit} className="space-y-6">
                           
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

                            {/* Duration & Duration Unit */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Duration */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Duration</label>
                                    <input
                                        type="number"
                                        value={data.duration}
                                        onChange={(e) => setData('duration', e.target.value)}
                                        className={`w-full border p-2 rounded text-sm ${errors.duration ? 'border-red-500' : ''}`}
                                        placeholder="Enter duration..."
                                    />
                                    {errors.duration && <p className="text-sm text-red-600">{errors.duration}</p>}
                                </div>

                                {/* Duration Unit */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Duration Unit</label>
                                    <select
                                        value={data.duration_unit}
                                        onChange={(e) => setData('duration_unit', e.target.value)}
                                        className="w-full border p-2 rounded text-sm"
                                    >
                                        <option value="days">Days</option>
                                        <option value="months">Months</option>
                                        <option value="years">Years</option>
                                    </select>
                                    {errors.duration_unit && <p className="text-sm text-red-600">{errors.duration_unit}</p>}
                                </div>
                            </div>

                            {/* Interest Type & Interest Rate */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Interest Type */}
                                <div>
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

                                {/* Interest Rate */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Interest Rate (%)</label>
                                    <input
                                        type="number"
                                        value={data.interest_rate}
                                        onChange={(e) => setData('interest_rate', e.target.value)}
                                        className={`w-full border p-2 rounded text-sm ${errors.interest_rate ? 'border-red-500' : ''}`}
                                        placeholder="Enter interest rate..."
                                    />
                                    {errors.interest_rate && <p className="text-sm text-red-600">{errors.interest_rate}</p>}
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end space-x-4">
                                <Link
                                    href={route('systemconfiguration0.loanpackages.index')}
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
                onConfirm={handleModalConfirm}
                title={modalState.isAlert ? "Alert" : "Confirm Action"}
                message={modalState.message}
                isAlert={modalState.isAlert}
            />
        </AuthenticatedLayout>
    );
}
