import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { Inertia } from '@inertiajs/inertia';
import axios from 'axios';
import Modal from '@/Components/CustomModal';

export default function Edit({ loanpackage }) {
    const { data, setData, put, errors, processing, reset } = useForm({
        name: loanpackage.name,
        duration: loanpackage.duration,
        interest_type: loanpackage.interest_type,
        interest_rate: loanpackage.interest_rate,
    });

    const [modalState, setModalState] = useState({
        isOpen: false,
        message: '',
        isAlert: false,
    });
    const [isSaving, setIsSaving] = useState(false);


    const handleModalClose = () => {
        setModalState({ isOpen: false, message: '', isAlert: false });
    };

    const showAlert = (message) => {
        setModalState({ isOpen: true, message, isAlert: true });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSaving(true);
        put(route('systemconfiguration0.loanpackages.update', loanpackage.id), {
            onSuccess: () => {
                setIsSaving(false);
                resetForm();
            },
            onError: (errors) => {
                console.error(errors);
                setIsSaving(false);
                showAlert('An error occurred while saving the loanpackage.');
            },
        });
    };

    const resetForm = () => {
        reset();
        showAlert('loanpackage updated successfully!');
    };


    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Edit Package</h2>}
        >
            <Head title="Edit Package" />
            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow sm:rounded-lg">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Name and Duration */}
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
                                    <label className="block text-sm font-medium text-gray-700">Duration (Months)</label>
                                    <input
                                        type="number"
                                        value={data.duration}
                                        onChange={(e) => setData('duration', e.target.value)}
                                        className={`w-full border p-2 rounded text-sm ${errors.duration ? 'border-red-500' : ''}`}
                                        placeholder="Enter duration..."
                                    />
                                    {errors.duration && <p className="text-sm text-red-600">{errors.duration}</p>}
                                </div>
                            </div>

                            {/* Interest Type and Interest Rate */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                            <div className="flex justify-end space-x-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => Inertia.get(route('systemconfiguration0.loanpackages.index'))}
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
                                    <span>{isSaving ? 'Saving...' : 'Save'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

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