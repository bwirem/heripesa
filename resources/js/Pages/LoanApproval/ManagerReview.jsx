import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head,Link, useForm } from '@inertiajs/react';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimesCircle, faEye, faPlus, faTrash, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { Inertia } from '@inertiajs/inertia';
import axios from 'axios';
import Modal from '../../Components/CustomModal.jsx';


export default function ManagerReview({ loan, loanTypes }) {
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
    const [approveModalOpen, setApproveModalOpen] = useState(false); 
    const [approveRemarks, setApproveRemarks] = useState(''); // State for the remarks
    const [remarksError, setRemarksError] = useState(''); // State to display remarks error
    

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

    const handleApproveClick = () => {
        if (data.guarantors.length === 0) {
            showAlert('Please add at least one guarantor before approving.');
            return;
        }
    
        if (data.guarantors.some(g => !g.collateral_doc)) {
            showAlert('Please ensure all guarantors have collateral documents attached.');
            return;
        }
    
        setApproveModalOpen(true);
        setApproveRemarks('');
        setRemarksError('');
    };

   const handleApproveModalClose = () => {
       setApproveModalOpen(false);      
       setApproveRemarks(''); // Clear remarks when closing modal
       setRemarksError(''); // Clear any error
   };

   const handleApproveModalConfirm = () => {
 
       if (!approveRemarks.trim()) {
           setRemarksError('Please enter Approve remarks.');
           return;
       }

       const approveData = {          
           remarks: approveRemarks,
       };
    
       // *** Replace this with your actual API call ***
       axios.post(route('loan1.approve', loan.id), approveData) // Assuming you create a new route
           .then(response => {
               console.log("Approve successful:", response);
               if (response.data && response.data.message) { // Check if message exists
                   showAlert(response.data.message); // Show message from backend
               }

               if (response.status === 200) { // Check the status code for success
                   Inertia.get(route('loan1.index')); // Navigate to procurements0.index
               } else {
                 console.error("Approve failed (non-200 status):", response);
                 showAlert('Approve failed. Please check the console for details.');
               }
           })
           .catch(error => {
               console.error("Error Approveing Loan:", error);

               let errorMessage = 'Failed to Approve loan. Please try again.';
               if (error.response && error.response.data && error.response.data.message) {
                   errorMessage = error.response.data.message;  // Use the backend error message, if available
               }
               showAlert(errorMessage); // Show more specific error

           });

       setApproveModalOpen(false);      
       setApproveRemarks(''); // Clear remarks after confirming
       setRemarksError(''); // Clear error after confirming (or failing)
   };

   const Unit = (loanTypeId) => {
    const durationUnit = loanTypes.find(type => type.id === loanTypeId)?.duration_unit || 'Months';
    return durationUnit.charAt(0).toUpperCase() + durationUnit.slice(1);
}; 
    
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Loan Application Review </h2>}
        >
            <Head title="Loan Application Review" />
            <div className="py-12">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                    <div className="bg-white p-8 shadow sm:rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-800 mb-6">Loan Application Details</h3>
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
                                            {data.approvals.map((approval, index) => (
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
                                                        {approval.created_at || 'N/A'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-4">
                                <Link
                                    href={route('loan1.index')}  // Using the route for navigation
                                    method="get"  // Optional, if you want to define the HTTP method (GET is default)
                                    preserveState={true}  // Keep the page state (similar to `preserveState: true` in the button)
                                    className="bg-gray-300 text-gray-700 rounded p-2 flex items-center space-x-2"
                                >
                                    <FontAwesomeIcon icon={faTimesCircle} />
                                    <span>Cancel</span>
                                </Link>                           
                            
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
                    confirmButtonText="Approve"
                >
                    <div>
                        <p>
                            Are you sure you want to Approve the loan to <strong>
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
                            value={approveRemarks}
                            onChange={(e) => setApproveRemarks(e.target.value)}
                        />
                        {remarksError && <p className="text-red-500 text-sm mt-1">{remarksError}</p>}
                    </div>
            </Modal>


        </AuthenticatedLayout>
    );
}