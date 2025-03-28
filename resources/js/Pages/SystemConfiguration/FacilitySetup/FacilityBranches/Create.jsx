import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head,Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimesCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Modal from '@/Components/CustomModal';

export default function Create({ facilityoptions }) {
    const { data, setData, post, errors, processing, reset } = useForm({
        name: '',
        facilityoption_id: facilityoptions?.length ? facilityoptions[0].id : '',
    });

    const [modalState, setModalState] = useState({ isOpen: false, message: '', isAlert: false });
    const [isSaving, setIsSaving] = useState(false);

    const showAlert = (message) => {
        setModalState({ isOpen: true, message, isAlert: true });
    };

    const handleModalClose = () => setModalState({ isOpen: false, message: '', isAlert: false });

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSaving(true);
        post(route('systemconfiguration5.facilitybranches.store'), {
            onSuccess: () => {
                setIsSaving(false);
                reset();
                showAlert('Facility branch created successfully!');
            },
            onError: () => {
                setIsSaving(false);
                showAlert('An error occurred while saving.');
            },
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">New Facility Branch</h2>}>
            <Head title="New Facility Branch" />
            <div className="py-10">
                <div className="mx-auto max-w-3xl px-4">
                    <div className="bg-white p-6 shadow-lg rounded-lg">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Facility Option Dropdown */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Facility</label>
                                    <select 
                                        value={data.facilityoption_id} 
                                        onChange={(e) => setData('facilityoption_id', e.target.value)} 
                                        className="w-full border p-2 rounded-md text-sm focus:ring focus:ring-blue-300"
                                    >
                                        <option value="">Select Facility</option>
                                        {facilityoptions.map(({ id, name }) => (
                                            <option key={id} value={id}>{name}</option>
                                        ))}
                                    </select>
                                    {errors.facilityoption_id && <p className="text-sm text-red-600">{errors.facilityoption_id}</p>}
                                </div>

                                {/* Name Input Field */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                        Name
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        placeholder="Enter name..."
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={`w-full border p-2 rounded-md text-sm focus:ring focus:ring-blue-300 ${errors.name ? 'border-red-500' : ''}`}
                                    />
                                    {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end space-x-4 mt-6">
                                <Link
                                    href={route('systemconfiguration5.facilitybranches.index')}  // Using the route for navigation
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
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 transition disabled:opacity-50"
                                >
                                    {isSaving ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
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
                title="Notification"
                message={modalState.message}
                isAlert={modalState.isAlert}
            />
        </AuthenticatedLayout>
    );
}
