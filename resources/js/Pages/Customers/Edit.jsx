import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head,Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimesCircle, faFileUpload } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';
import Modal from '@/Components/CustomModal';

export default function Edit({ customer,customerTypes,documentTypes }) {
    const { data, setData, put, errors, processing, reset } = useForm({
        customer_type: customer.customer_type,
        first_name: customer.first_name || '',
        other_names: customer.other_names || '',
        surname: customer.surname || '',
        company_name: customer.company_name || '',
        email: customer.email,
        phone: customer.phone || '',
        address: customer.address || '',
        document_type: customer.document_type || '',
        document_number: customer.document_number || '',
        document_path: customer.document_path || '',
        documentFile: null,
        selfie_path: customer.selfie_path || '',
        selfieFile: null,
    });

    const [modalState, setModalState] = useState({
        isOpen: false,
        message: '',
        isAlert: false,
    });
    const [isSaving, setIsSaving] = useState(false);

    const [documentFileError, setDocumentFileError] = useState(''); 
    const [selfieFileError, setSelfieFileError] = useState(''); 

    const handleModalConfirm = () => {
       
        setModalState({ isOpen: false, message: '', isAlert: false });
    };

    const handleModalClose = () => {
        setModalState({ isOpen: false, message: '', isAlert: false });
    };

    const showAlert = (message) => {
        setModalState({ isOpen: true, message, isAlert: true });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!data.documentFile && !customer.document_path) {
            setDocumentFileError('Identification Document is required.');
            return;
        }

        setDocumentFileError('');

        if (!data.selfieFile && !customer.selfie_path) {
            setSelfieFileError('Selfie is required.');
            return;
        }

        setSelfieFileError('');
        
        setIsSaving(true);

        const formData = new FormData();
        for (const key in data) {
            formData.append(key, data[key]);
        }

        put(route('customer0.update', customer.id), formData, {
            forceFormData: true, // Ensure Inertia uses FormData when files are present            
            onSuccess: () => {
                setIsSaving(false);
                resetForm();
            },
            onError: (error) => {
                console.error(error);
                setIsSaving(false);
                showAlert('An error occurred while saving the customer.');
            },
        });           
        
    };

    const resetForm = () => {
        reset();
        showAlert('Customer updated successfully!');
    };

    const handleDocumentFileChange = (e) => {
        const file = e.target.files?.[0]; // Access the selected file
        if (!file) {
            setDocumentFileError('No file selected.'); // Handle no file case
            return;
        }
    
        const MAX_SIZE = 2 * 1024 * 1024; // Maximum file size set to 2MB
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png'
        ];
    
        // Check if the file size exceeds the maximum limit
        if (file.size > MAX_SIZE) {
            setDocumentFileError('File size exceeds 2MB limit.');
            return;
        }
    
        // Check if the file type is allowed
        if (!allowedTypes.includes(file.type)) {
            setDocumentFileError('Invalid file type. Please upload a PDF, DOC/DOCX, or image file (JPEG/PNG).');
            return;
        }
    
        // Store the valid file object and clear any previous error message
        setData('documentFile', file);
        setDocumentFileError(''); // Clear error message
    };

    const handleSelfieFileChange = (e) => {   
        const file = e.target.files?.[0]; // Access the selected file
        if (!file) {
            setSelfieFileError('No file selected.'); // Handle no file case
            return;
        }
    
        const MAX_SIZE = 2 * 1024 * 1024; // Maximum file size set to 2MB
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png'
        ];
    
        // Check if the file size exceeds the maximum limit
        if (file.size > MAX_SIZE) {
            setSelfieFileError('File size exceeds 2MB limit.');
            return;
        }
    
        // Check if the file type is allowed
        if (!allowedTypes.includes(file.type)) {
            setSelfieFileError('Invalid file type. Please upload a PDF, DOC/DOCX, or image file (JPEG/PNG).');
            return;
        }
    
        // Store the valid file object and clear any previous error message
        setData('selfieFile', file);
        setSelfieFileError(''); // Clear error message
    };
      


    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Edit Customer</h2>}
        >
            <Head title="Edit Customer" />
            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow sm:rounded-lg">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Customer Type */}
                            <div>
                                <label htmlFor="customer_type" className="block text-sm font-medium text-gray-700">Customer Type</label>
                                <select
                                    id="customer_type"
                                    value={data.customer_type}
                                    onChange={(e) => setData('customer_type', e.target.value)}
                                    className="w-full border p-2 rounded text-sm"
                                >
                                    {customerTypes.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.customer_type && <p className="text-sm text-red-600">{errors.customer_type}</p>}
                            </div> 

                            {/* Individual Customer Fields */}
                            {data.customer_type === 'individual' && (
                                <div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">First Name</label>
                                            <input
                                                type="text"
                                                id="first_name"
                                                value={data.first_name}
                                                onChange={(e) => setData('first_name', e.target.value)}
                                                className={`w-full border p-2 rounded text-sm ${errors.first_name ? 'border-red-500' : ''}`}
                                            />
                                            {errors.first_name && <p className="text-sm text-red-600">{errors.first_name}</p>}
                                        </div>
                                        <div>
                                            <label htmlFor="other_names" className="block text-sm font-medium text-gray-700">Other Names</label>
                                            <input
                                                type="text"
                                                id="other_names"
                                                value={data.other_names}
                                                onChange={(e) => setData('other_names', e.target.value)}
                                                className={`w-full border p-2 rounded text-sm ${errors.other_names ? 'border-red-500' : ''}`}
                                            />
                                            {errors.other_names && <p className="text-sm text-red-600">{errors.other_names}</p>}
                                        </div>
                                        <div>
                                            <label htmlFor="surname" className="block text-sm font-medium text-gray-700">Surname</label>
                                            <input
                                                type="text"
                                                id="surname"
                                                value={data.surname}
                                                onChange={(e) => setData('surname', e.target.value)}
                                                className={`w-full border p-2 rounded text-sm ${errors.surname ? 'border-red-500' : ''}`}
                                            />
                                            {errors.surname && <p className="text-sm text-red-600">{errors.surname}</p>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Company Customer Fields */}
                            {data.customer_type === 'company' && (
                                <div>
                                    <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">Company Name</label>
                                    <input
                                        type="text"
                                        id="company_name"
                                        value={data.company_name}
                                        onChange={(e) => setData('company_name', e.target.value)}
                                        className={`w-full border p-2 rounded text-sm ${errors.company_name ? 'border-red-500' : ''}`}
                                    />
                                    {errors.company_name && <p className="text-sm text-red-600">{errors.company_name}</p>}
                                </div>
                            )}

                            {/* Group Customer Fields */}
                            {data.customer_type === 'group' && (
                                <div>
                                    <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">Group Name</label>
                                    <input
                                        type="text"
                                        id="company_name"
                                        value={data.company_name}
                                        onChange={(e) => setData('company_name', e.target.value)}
                                        className={`w-full border p-2 rounded text-sm ${errors.company_name ? 'border-red-500' : ''}`}
                                    />
                                    {errors.company_name && <p className="text-sm text-red-600">{errors.company_name}</p>}
                                </div>
                            )}


                            {/* Common Fields */}
                            <div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                        <input
                                            type="email"
                                            id="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className={`w-full border p-2 rounded text-sm ${errors.email ? 'border-red-500' : ''}`}
                                        />
                                        {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                                        <input
                                            type="text"
                                            id="phone"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            className={`w-full border p-2 rounded text-sm ${errors.phone ? 'border-red-500' : ''}`}
                                        />
                                        {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                                <input
                                    type="text"
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    className={`w-full border p-2 rounded text-sm ${errors.address ? 'border-red-500' : ''}`}
                                />
                                {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}
                            </div>                            

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">                                 
                                
                                {/* Document Type */}
                                <div>
                                    <label htmlFor="document_type" className="block text-sm font-medium text-gray-700">Customer Type</label>
                                    <select
                                        id="document_type"
                                        value={data.document_type}
                                        onChange={(e) => setData('document_type', e.target.value)}
                                        className="w-full border p-2 rounded text-sm"
                                    >
                                        {documentTypes.map((type) => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.document_type && <p className="text-sm text-red-600">{errors.document_type}</p>}
                                </div> 

                                <div>
                                    <label htmlFor="document_number" className="block text-sm font-medium text-gray-700">Document Number</label>
                                    <input
                                        type="text"
                                        id="document_number"
                                        value={data.document_number}
                                        onChange={(e) => setData('document_number', e.target.value)}
                                        className={`w-full border p-2 rounded text-sm ${errors.document_number ? 'border-red-500' : ''}`}
                                    />
                                    {errors.document_number && <p className="text-sm text-red-600">{errors.document_number}</p>}
                                </div> 
                                
                                {/* Upload Application Form */}
                                <div className="relative flex-1">
                                    <label htmlFor="documentFile" className="block text-sm font-medium text-gray-700">
                                        Identification Document
                                    </label>
                                    <div className="mt-1 flex items-center">
                                        <label htmlFor="documentFile" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                            <span>Upload</span>
                                            <FontAwesomeIcon icon={faFileUpload} className="ml-2" />
                                            <input
                                                id="documentFile"
                                                name="documentFile"
                                                type="file"
                                                className="sr-only"
                                                onChange={handleDocumentFileChange}
                                            />
                                        </label>
                                        {data.documentFile && (
                                            <span className="ml-3 text-gray-500 text-sm">
                                                {data.documentFile.name}
                                            </span>
                                        )}
                                        {documentFileError && <p className="text-sm text-red-600 mt-1">{documentFileError}</p>}
                                    </div>
                                </div>                                                               
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">                                 
                                
                                {/* Upload Selfie File */}
                                <div className="relative flex-1">
                                    <label htmlFor="selfieFile" className="block text-sm font-medium text-gray-700">
                                        Selfie
                                    </label>
                                    <div className="mt-1 flex items-center">
                                        <label htmlFor="selfieFile" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                            <span>Upload</span>
                                            <FontAwesomeIcon icon={faFileUpload} className="ml-2" />
                                            <input
                                                id="selfieFile"
                                                name="selfieFile"
                                                type="file"
                                                className="sr-only"
                                                onChange={handleSelfieFileChange}
                                            />
                                        </label>
                                        {data.selfieFile && (
                                            <span className="ml-3 text-gray-500 text-sm">
                                                {data.selfieFile.name}
                                            </span>
                                        )}
                                        {selfieFileError && <p className="text-sm text-red-600 mt-1">{selfieFileError}</p>}
                                    </div>
                                </div>                                                               
                            </div>

                            <div className="flex justify-end space-x-4 mt-6">
                                <Link
                                    href={route('customer0.index')}
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
                onConfirm={handleModalConfirm}
                title={modalState.isAlert ? "Alert" : "Confirm Action"}
                message={modalState.message}
                isAlert={modalState.isAlert}
            />
        </AuthenticatedLayout>
    );
}