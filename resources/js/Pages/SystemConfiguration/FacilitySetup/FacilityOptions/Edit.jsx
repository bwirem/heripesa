import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head,Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';
import Modal from '@/Components/CustomModal';

export default function Edit({ facilityoption }) {
    const { data, setData, put, errors, processing, reset } = useForm({
        name: facilityoption.name,
        rounding_factor: facilityoption.rounding_factor, 
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

    const handleModalConfirm = async () => {
            
        setModalState({ isOpen: false, message: '', isAlert: false });
    };

    const showAlert = (message) => {
        setModalState({ isOpen: true, message, isAlert: true });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        setIsSaving(true);
        put(route('systemconfiguration5.facilityoptions.update', facilityoption.id), {
            onSuccess: () => {
                setIsSaving(false);
                resetForm();
            },
            onError: (errors) => {
                console.error(errors);
                setIsSaving(false);
                showAlert('An error occurred while saving the facilityoption.');
            },
        });
    };

    const resetForm = () => {
        reset();
        showAlert('Facilityoption updated successfully!');
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Edit Facility Options</h2>}
        >
            <Head title="Edit Facility Options" />
            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow sm:rounded-lg">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                                {/* Name Input Box */}
                                <div className="relative flex-1">
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                        Name
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        placeholder="Enter name..."
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={`w-full border p-2 rounded text-sm ${errors.name ? 'border-red-500' : ''}`}
                                    />
                                    {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                                </div>

                                <div className="relative flex-1">
                                    <label htmlFor="rounding_factor" className="block text-sm font-medium text-gray-700 mr-2">Round Factor</label>
                                    <input
                                        id="rounding_factor"
                                        type="number"
                                        placeholder="Enter Rounding_factor..."
                                        value={data.rounding_factor}
                                        onChange={(e) => setData('rounding_factor', e.target.value)}
                                        className={`w-full border p-2 rounded text-sm ${errors.rounding_factor ? 'border-red-500' : ''}`}
                                    />
                                    {errors.rounding_factor && <p className="text-sm text-red-600 mt-1">{errors.rounding_factor}</p>}
                                </div>   
                            </div>

                            <div className="flex justify-end space-x-4 mt-6">
                                <Link
                                        href={route('systemconfiguration5.facilityoptions.index')}  // Using the route for navigation
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
