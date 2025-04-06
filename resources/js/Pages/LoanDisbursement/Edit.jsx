import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm,Link } from '@inertiajs/react';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft,faTimesCircle, faEye, faPlus, faTrash, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { Inertia } from '@inertiajs/inertia';
import axios from 'axios';
import Modal from '../../Components/CustomModal.jsx';


export default function Edit({ loan, loanTypes,paymentTypes }) {
    // Form state using Inertia's useForm hook
    const { data, setData, put, errors, processing, reset } = useForm({
        customer_type: loan.customer.customer_type,
        first_name: loan.customer.first_name || '',
        other_names: loan.customer.other_names || '',
        surname: loan.customer.surname || '',
        company_name: loan.customer.company_name || '',
        email: loan.customer.email,
        phone: loan.customer.phone || '',
        customer_id: loan.customer_id,
        loanType: loan.loan_type || '',
        loanAmount: loan.loan_amount,
        loanDuration: loan.loan_duration,
        interestRate: loan.interest_rate,
        interestAmount: loan.interest_amount,
        monthlyRepayment: loan.monthly_repayment,
        totalRepayment: loan.total_repayment,
        stage: loan.stage,
        guarantors: loan.loan_guarantors || [],  // Array of guarantor details
        approvals: loan.approvals || [],  // Array of approvals details        
    });

    
    // Modal state
    const [modalState, setModalState] = useState({
        isOpen: false,
        message: '',
        isAlert: false,
        itemToRemoveIndex: null,
    });

    // Saving state
    const [isSaving, setIsSaving] = useState(false); 
    const [disburseModalOpen, setDisburseModalOpen] = useState(false); 
    const [disburseRemarks, setDisburseRemarks] = useState(''); // State for the remarks
    const [remarksError, setRemarksError] = useState(''); // State to display remarks error

    const [paymentType, setPaymentType] = useState(''); // State for the paymentType
    const [paymentTypesError, setPaymentTypesError] = useState(''); // State to display remarks error
    
    

    const showAlert = (message) => {
        setModalState({
            isOpen: true,
            message: message,
            isAlert: false,
            itemToRemoveIndex: null,
        });
    };
   
   
    //Modal confirmations
    const handleModalConfirm = () => {

        setModalState({ isOpen: false, message: '', isAlert: false, itemToRemoveIndex: null });
    };

    const handleModalClose = () => {
        setModalState({ isOpen: false, message: '', isAlert: false, itemToRemoveIndex: null });
    };

    //GUARANTOR FUNCTIONS END

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
    
        const formData = new FormData();
        formData.append('stage', data.stage || '');
    
        let hasFile = false; // Track if at least one file is attached
           
        // Append Guarantors
        data.guarantors.forEach((guarantor, index) => {
            formData.append(`guarantors[${index}][guarantor_id]`, guarantor.guarantor_id);
    
            if (guarantor.collateral_doc instanceof File) {
                formData.append(`guarantors[${index}][collateral_doc]`, guarantor.collateral_doc, guarantor.collateralDocName);
                hasFile = true; // File is attached
            }
        });
    
        formData.append('_method', 'PUT'); // Method Spoofing
    
        // Alert if no file is attached or existing file is missing
        if (!hasFile && data.guarantors.some(g => !g.collateral_doc)) {
            showAlert('Please attach at least one collateral document.');
            setIsSaving(false);
            return;
        }       
    
        try {
            const response = await axios.post(route('loan2.update', loan.id), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
    
            setIsSaving(false);            
            showAlert(response.data.message);

            setTimeout(() => {  // Introduce a short delay
                resetForm();
            }, 100); // Adjust the timeout as needed
                
    
        } catch (error) {
            setIsSaving(false);
            console.error('Full error object:', error);
            if (error.response && error.response.data) {
                console.error('Error data:', error.response.data);
                setData('errors', error.response.data.errors);
            } else {
                console.error("Error updating loan:", error);
                showAlert('An error occurred while saving the application.');
            }
        }
    };    

    // Reset the form
    const resetForm = () => { // No message parameter needed here
        reset('', {
            onSuccess: () => {
                Inertia.reload({ // Only reload here
                    only: ['loan.loan_guarantors'],
                    preserveScroll: true
                });
            }
        });
    };   

    const handleDisburseClick = () => {
        if (data.guarantors.length === 0) {
            showAlert('Please add at least one guarantor before approving.');
            return;
        }
    
        if (data.guarantors.some(g => !g.collateral_doc)) {
            showAlert('Please ensure all guarantors have collateral documents attached.');
            return;
        }
    
        setDisburseModalOpen(true);
        setDisburseRemarks('');
        setRemarksError('');
        setPaymentTypesError('');
    };

   const handleDisburseModalClose = () => {
       setDisburseModalOpen(false);      
       setDisburseRemarks(''); // Clear remarks when closing modal
       setRemarksError(''); // Clear any error
       setPaymentTypesError('');
   };

   const handleDisburseModalConfirm = () => {
 
        if (!paymentType) { // Check paymentType state directly
            setPaymentTypesError('Select Payment Method.');
            return;
        }

        if (!disburseRemarks.trim()) {
            setRemarksError('Please enter Disburse remarks.');
            return;
        }

        const disburseData = {          
            remarks: disburseRemarks,
            payment_type_id: paymentType, // Include paymentType from state
        };
    
       // *** Replace this with your actual API call ***
       axios.post(route('loan2.disburse', loan.id), disburseData) // Assuming you create a new route
           .then(response => {
               console.log("Disburse successful:", response);
               if (response.data && response.data.message) { // Check if message exists
                   showAlert(response.data.message); // Show message from backend
               }

               if (response.status === 200) { // Check the status code for success
                   Inertia.get(route('loan2.index')); // Navigate to procurements0.index
               } else {
                 console.error("Disburse failed (non-200 status):", response);
                 showAlert('Disburse failed. Please check the console for details.');
               }
           })
           .catch(error => {
               console.error("Error Disburseing Loan:", error);

               let errorMessage = 'Failed to Disburse loan. Please try again.';
               if (error.response && error.response.data && error.response.data.message) {
                   errorMessage = error.response.data.message;  // Use the backend error message, if available
               }
               showAlert(errorMessage); // Show more specific error

           });

       setDisburseModalOpen(false);      
       setDisburseRemarks(''); // Clear remarks after confirming
       setRemarksError(''); // Clear error after confirming (or failing)
       setPaymentTypesError('');
   };


    const handlePaymentTypeChange = (e) => {
      
        setPaymentType(e.target.value); // Update 
    };

    const Unit = (loanTypeId) => {
        const durationUnit = loanTypes.find(type => type.id === loanTypeId)?.duration_unit || 'Months';
        return durationUnit.charAt(0).toUpperCase() + durationUnit.slice(1);
    }; 
    
return (
    <AuthenticatedLayout
        header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Loan Disbursement</h2>}
    >
        <Head title="Loan Disbursement" />
        <div className="py-12">
            <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                <div className="bg-white p-8 shadow sm:rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">Loan Application Details</h3>
                    <form onSubmit={handleSubmit} className="space-y-6">

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
                            </div>
                        </section>

                        {/* Loan Details Section */}
                        <section className="border-b border-gray-200 pb-4">
                            <h4 className="text-md font-semibold text-gray-700 mb-3">Loan Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Loan Type:</label>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {loanTypes.find(type => type.id === loan.loan_type)?.name || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Loan Amount:</label>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {parseFloat(data.loanAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Tsh
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Loan Duration:</label>
                                    <p className="mt-1 text-sm text-gray-500">{data.loanDuration} {Unit(data.loanType)}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Interest Rate:</label>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {parseFloat(data.interestRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Interest Amount:</label>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {parseFloat(data.interestAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Tsh
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Monthly Repayment:</label>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {parseFloat(data.monthlyRepayment).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Tsh
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Total Repayment:</label>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {parseFloat(data.totalRepayment).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Tsh
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Application Form Display */}
                        <section className="border-b border-gray-200 pb-4">
                            <h4 className="text-md font-semibold text-gray-700 mb-3">Application Form</h4>
                            {loan.application_form ? (
                                <div className="mt-2">
                                    <a
                                        href={`/storage/${loan.application_form}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded-md font-semibold text-xs uppercase tracking-widest focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-50 transition ease-in-out duration-150"
                                    >
                                        <FontAwesomeIcon icon={faEye} className="mr-2" />
                                        View Application Form
                                    </a>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">No application form available.</p>
                            )}
                        </section>

                        {/* Guarantor Section */}
                        <section className="border-b border-gray-200 pb-4">
                            <h4 className="text-md font-semibold text-gray-700 mb-3">Guarantors Details</h4>
                            {data.guarantors.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collateral Document</th>
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Preview</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {data.guarantors.map((guarantor, index) => (
                                                <tr key={index}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {guarantor.guarantor_type === 'company' ? guarantor.company_name : `${guarantor.first_name} ${guarantor.surname}`}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {guarantor.collateralDocName || 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                                        {guarantor.collateral_doc ? (
                                                            <a
                                                                href={`/storage/${guarantor.collateral_doc}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:text-blue-800"
                                                            >
                                                                <FontAwesomeIcon icon={faEye} />
                                                            </a>
                                                        ) : (
                                                            <span className="text-gray-400">No file</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">No guarantors added.</p>
                            )}
                        </section>

                        <section>
                            <h4 className="text-md font-semibold text-gray-700 mb-3">Declaration Remarks</h4>
                            <div>                                    
                                <p className="mt-1 text-sm text-gray-500">{loan.submit_remarks}</p>
                            </div>
                        </section>  

                        {/* Stage Selection */}
                        <section>
                            <h4 className="text-md font-semibold text-gray-700 mb-3">Review Details</h4>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th> 
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>  
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>                                         
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                    {data.approvals
                                        .filter(approval => approval.remarks && approval.remarks.trim() !== '') // Filter out approvals with null or empty remarks
                                        .map((approval, index) => (
                                            <tr key={index}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {approval.remarks || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {approval.approver?.user_group?.name || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {approval.approver?.name || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {approval.updated_at ? new Intl.DateTimeFormat('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: '2-digit',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        second: '2-digit',
                                                        hour12: true
                                                    }).format(new Date(approval.updated_at)) : 'N/A'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => Inertia.get(route('loan2.index'))}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-700 rounded px-4 py-2 flex items-center space-x-2"
                            >
                                <FontAwesomeIcon icon={faTimesCircle} />
                                <span>Cancel</span>
                            </button>

                            <Link
                                    href={route('loan2.back', loan.id)}
                                    className="bg-blue-300 text-blue-700 rounded p-2 flex items-center space-x-2"
                                >
                                    <FontAwesomeIcon icon={faArrowLeft} />
                                    <span>Back</span>
                            </Link>
                           
                            <button
                                type="button"
                                onClick={handleDisburseClick}
                                className="bg-green-500 hover:bg-green-700 text-white rounded px-4 py-2 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                            >
                                <FontAwesomeIcon icon={faCheck} />
                                <span>Disburse</span>
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

        {/* Disburse Confirmation Modal */}
        <Modal
            isOpen={disburseModalOpen}
            onClose={handleDisburseModalClose}
            onConfirm={handleDisburseModalConfirm}
            title="Disburse Confirmation"
            confirmButtonText="Disburse"
        >
            <div> {/* Contains the confirmation message only */}
                <p>
                    Are you sure you want to Disburse the loan to <strong>
                        {data.customer_type === 'individual' ? (
                            `${data.first_name} ${data.other_names ? data.other_names + ' ' : ''}${data.surname}`
                        ) : (
                            data.company_name
                        )}
                    </strong>?
                </p>
            </div>

            {/* Payment Type dropdown is now outside the previous div */}
            <div>
                <label htmlFor="paymentType" className="block text-sm font-medium text-gray-700 mt-4">Payment Type</label>
                <select
                    id="paymentType"                            
                    onChange={handlePaymentTypeChange}
                    value={paymentType} // Bind value to the paymentType state
                    className="w-full border p-2 rounded text-sm"
                    required
                >
                    <option value="" disabled>Select Payment Type</option>
                    {paymentTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                </select>
                {paymentTypesError && <p className="text-sm text-red-600">{paymentTypesError}</p>}
            </div>



            <div> {/* Contains remarks textarea */}
                <label htmlFor="Disburse_remarks" className="block text-sm font-medium text-gray-700 mt-4">
                    Disburse Remarks:
                </label>
                <textarea
                    id="Disburse_remarks"
                    rows="3"
                    className="mt-1 block w-full border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={disburseRemarks}
                    onChange={(e) => setDisburseRemarks(e.target.value)}
                />
                {remarksError && <p className="text-red-500 text-sm mt-1">{remarksError}</p>}
            </div>
        </Modal>

    </AuthenticatedLayout>
);
}