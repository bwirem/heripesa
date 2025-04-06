import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head,Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCheck, faTimes, faEye,faTimesCircle} from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';
import Modal from '@/Components/CustomModal';

export default function Approve({ customer,customerTypes,documentTypes }) {
    const { data, setData, post, errors, processing, reset } = useForm({
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

        remarks: '',
    });

    const [modalState, setModalState] = useState({
        isOpen: false,
        message: '',
        isAlert: false,
    });
    const [isSaving, setIsSaving] = useState(false);

    const [approveModalOpen, setApproveModalOpen] = useState(false); 
    const [approveRemarks, setApproveRemarks] = useState(''); // State for the remarks
    const [remarksError, setRemarksError] = useState(''); // State to display remarks error

    const [submitModalLoading, setSubmitModalLoading] = useState(false);
    const [submitModalSuccess, setSubmitModalSuccess] = useState(false);
   
    const handleModalConfirm = () => {
       
        setModalState({ isOpen: false, message: '', isAlert: false });
    };

    const handleModalClose = () => {
        setModalState({ isOpen: false, message: '', isAlert: false });
    };

    const showAlert = (message) => {
        setModalState({ isOpen: true, message, isAlert: true });
    };

     //GUARANTOR FUNCTIONS END

     const handleApproveClick = () => {        
    
        setApproveModalOpen(true);
        setApproveRemarks('');
        setRemarksError('');
        setSubmitModalLoading(false); // Reset loading state
        setSubmitModalSuccess(false); // Reset success state
    };

   const handleApproveModalClose = () => {
       setApproveModalOpen(false);      
       setApproveRemarks(''); // Clear remarks when closing modal
       setRemarksError(''); // Clear any error
       setSubmitModalLoading(false); // Reset loading state
       setSubmitModalSuccess(false); // Reset success state
   };

   const handleApproveModalConfirm = () => {
 
       if (!data.remarks) {
           setRemarksError('Please enter Approve remarks.');
           return;
       }

       
       const formData = new FormData();
       formData.append('remarks', data.remarks);

        setSubmitModalLoading(true); // Set loading state

        post(route('customer0.approve', customer.id), formData, {
            forceFormData: true,
            onSuccess: () => {
                setSubmitModalLoading(false);
                reset(); // Reset form data
                setSubmitModalSuccess(true); // Set success state
                handleApproveModalClose(); // Close the modal on success
            },
            onError: (errors) => {
                setSubmitModalLoading(false);
                console.error('Submission errors:', errors);
            },
        });          

       
   };

   
   const handleRejectClick = () => {

   }

  
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Approve Customer</h2>}
        >
            <Head title="Approve Customer" />
            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow sm:rounded-lg">
                        <form className="space-y-6">

                            {/* Customer Details Section */}
                            <section className="border-b border-gray-200 pb-4">
                                <h4 className="text-md font-semibold text-gray-700 mb-3">Customer Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Customer Type:</label>
                                        <p className="mt-1 text-sm text-gray-500">{data.customer_type}</p>
                                    </div>

                                    {data.customer_type === 'individual' ? (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">First Name:</label>
                                                <p className="mt-1 text-sm text-gray-500">{data.first_name}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Other Names:</label>
                                                <p className="mt-1 text-sm text-gray-500">{data.other_names || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Surname:</label>
                                                <p className="mt-1 text-sm text-gray-500">{data.surname}</p>
                                            </div>
                                        </>
                                    ) : (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Company Name:</label>
                                            <p className="mt-1 text-sm text-gray-500">{data.company_name}</p>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email:</label>
                                        <p className="mt-1 text-sm text-gray-500">{data.email}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Phone:</label>
                                        <p className="mt-1 text-sm text-gray-500">{data.phone}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Address:</label>
                                        <p className="mt-1 text-sm text-gray-500">{data.address}</p>
                                    </div>
                                </div>
                            </section>  

                            {/* Identification Document Display */}
                            <section className="border-b border-gray-200 pb-4">                            
                               
                                <h4 className="text-md font-semibold text-gray-700 mb-3">Identification Document</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Document Type:</label>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {/* Find the document type object based on the value and display its label */}
                                            {documentTypes.find(type => type.value === data.document_type)?.label || 'Document type not found'}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Document Number:</label>
                                        <p className="mt-1 text-sm text-gray-500">{data.document_number}</p>
                                    </div>

                                    {customer.document_path ? (
                                        <div className="mt-2">
                                            <a
                                                href={`/storage/${customer.document_path}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded-md font-semibold text-xs uppercase tracking-widest focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-50 transition ease-in-out duration-150"
                                            >
                                                <FontAwesomeIcon icon={faEye} className="mr-2" />
                                                View Document
                                            </a>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">No Identification Document Available.</p>
                                    )}
                                </div>

                            </section>

                            {/* Selfie Display */}
                            <section className="border-b border-gray-200 pb-4">  
                                <h4 className="text-md font-semibold text-gray-700 mb-3"> Selfie</h4>                                
                                {/* Display Selfie Image */}
                                <div className="relative flex justify-center items-center"> {/* Added flex utilities here */}
                                    <div className="mt-1">
                                        {/* Check if selfie is available in data or customer */}
                                        {data.selfieFile || customer.selfie_path ? (
                                            <div className="flex flex-col items-center">
                                                <img
                                                    src={data.selfieFile ? URL.createObjectURL(data.selfieFile) : `/storage/${customer.selfie_path}`} 
                                                    alt="Selfie"
                                                    className="w-32 h-32 object-cover rounded-md"  // Adjust size as needed
                                                />
                                                <span className="mt-2 text-sm text-gray-500">
                                                    {data.selfieFile ? data.selfieFile.name : 'Uploaded Selfie'}
                                                </span>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500">No Selfie Available</p>
                                        )}
                                    </div>
                                </div>                                
                            </section>

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
                                
                                <Link
                                    href={route('customer0.back', customer.id)}
                                    className="bg-blue-300 text-blue-700 rounded p-2 flex items-center space-x-2"
                                >
                                    <FontAwesomeIcon icon={faArrowLeft} />
                                    <span>Back</span>
                                </Link>  

                                <button
                                    type="button"
                                    onClick={handleRejectClick}  // Ensure you have a separate function for rejecting
                                    className="bg-red-500 hover:bg-red-700 text-white rounded px-4 py-2 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                                >
                                    <FontAwesomeIcon icon={faTimes} /> 
                                    <span>Reject</span>
                                </button>       
                                
                            
                                <button
                                    type="button"
                                    onClick={handleApproveClick}
                                    className="bg-green-500 hover:bg-green-700 text-white rounded px-4 py-2 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                                >
                                    <FontAwesomeIcon icon={faCheck} />
                                    <span>Approve</span>
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

             {/* Approve Confirmation Modal */}
             <Modal
                    isOpen={approveModalOpen}
                    onClose={handleApproveModalClose}
                    onConfirm={handleApproveModalConfirm}
                    title="Approve Confirmation"                  
                    confirmButtonText={submitModalLoading ? 'Loading...' : (submitModalSuccess ? "Success" : 'Approve')}
                    confirmButtonDisabled={submitModalLoading || submitModalSuccess}
                >
                    <div>
                        <p>
                            Are you sure you want to Approve <strong>
                                {data.customer_type === 'individual' ? (
                                    `${data.first_name} ${data.other_names ? data.other_names + ' ' : ''}${data.surname}`
                                ) : (
                                    data.company_name
                                )}
                            </strong>?
                        </p>

                        <label htmlFor="Approve_remarks" className="block text-sm font-medium text-gray-700 mt-4">
                            Approve Remarks:
                        </label>
                        <textarea
                            id="Approve_remarks"
                            rows="3"
                            className="mt-1 block w-full border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            value={data.remarks}
                            onChange={(e) => setData('remarks', e.target.value)}
                        />
                        {remarksError && <p className="text-red-500 text-sm mt-1">{remarksError}</p>}
                    </div>
            </Modal>
        </AuthenticatedLayout>
    );
}