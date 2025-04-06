import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faTimesCircle, faCheck,faEye } from '@fortawesome/free-solid-svg-icons';
import Modal from '../../Components/CustomModal.jsx';

export default function Submission({ loan, loanTypes }) {
    // Form state using Inertia's useForm hook
    const { data, setData, post, errors, reset } = useForm({
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
        guarantors: loan.loan_guarantors || [],
        remarks: '',
    });

    // Modal states
    const [modalState, setModalState] = useState({
        isOpen: false,
        message: '',
        isAlert: false,
        itemToRemoveIndex: null,
    });

    const [submitModalOpen, setSubmitModalOpen] = useState(false);
    const [submitRemarks, setSubmitRemarks] = useState('');
    const [remarksError, setRemarksError] = useState('');
    const [submitModalLoading, setSubmitModalLoading] = useState(false);
    const [submitModalSuccess, setSubmitModalSuccess] = useState(false);

    const showAlert = (message) => {
        setModalState({
            isOpen: true,
            message: message,
            isAlert: false,
            itemToRemoveIndex: null,
        });
    };

    const handleSubmitClick = () => {
        if (data.guarantors.length === 0) {
            showAlert('Please add at least one guarantor before submitting.');
            return;
        }

        if (data.guarantors.some(g => !g.collateral_doc)) {
            showAlert('Please ensure all guarantors have collateral documents attached.');
            return;
        }

        setSubmitModalOpen(true);
        setSubmitRemarks('');
        setRemarksError('');
        setSubmitModalLoading(false); // Reset loading state
        setSubmitModalSuccess(false); // Reset success state
    };

    
    const handleSubmitModalClose = () => {
        setSubmitModalOpen(false);
        setSubmitRemarks('');
        setRemarksError('');
        setSubmitModalLoading(false); // Reset loading state
        setSubmitModalSuccess(false); // Reset success state
    };

    const handleSubmitModalConfirm = () => {
        if (!data.remarks.trim()) {
            setRemarksError('Please enter Submit remarks.');
            return;
        }
    
        const formData = new FormData();
        formData.append('remarks', data.remarks);
    
        setSubmitModalLoading(true); // Set loading state
    
        post(route('loan0.next', loan.id), formData, {
            forceFormData: true,
            onSuccess: () => {
                setSubmitModalLoading(false);
                reset(); // Reset form data
                setSubmitModalSuccess(true); // Set success state
                handleSubmitModalClose(); // Close the modal on success
            },
            onError: (errors) => {
                setSubmitModalLoading(false);
                console.error('Submission errors:', errors);
            },
        });
    };


    const Unit = (loanTypeId) => {
        const durationUnit = loanTypes.find(type => type.id === loanTypeId)?.duration_unit || 'Months';
        return durationUnit.charAt(0).toUpperCase() + durationUnit.slice(1);
    }; 
    

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Submission</h2>}
        >
            <Head title="Submission" />
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

                                {/* Guarantor Table */}
                                <div className="overflow-x-auto bg-white border border-gray-300 rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collateral Document</th>
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Preview</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {data.guarantors.map((guarantorData, index) => (
                                                <tr key={index}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {guarantorData.guarantor_type === 'company' ? guarantorData.company_name : `${guarantorData.first_name} ${guarantorData.surname}`}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-left">
                                                        {guarantorData.collateralDocName}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                                        {guarantorData.collateral_doc ? (
                                                            <a
                                                                href={`/storage/${guarantorData.collateral_doc}`} // Adjust path based on your storage setup
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:text-blue-800"
                                                                title="Preview File"
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
                            </section>

                            {/* Submit Button */}
                            <div className="flex justify-end space-x-4 mt-6">
                                <Link
                                    href={route('loan0.index')}
                                    className="bg-gray-300 text-gray-700 rounded p-2 flex items-center space-x-2"
                                >
                                    <FontAwesomeIcon icon={faTimesCircle} />
                                    <span>Exit</span>
                                </Link>
                                
                                <Link
                                    href={route('loan0.back', loan.id)}
                                    className="bg-blue-300 text-blue-700 rounded p-2 flex items-center space-x-2"
                                >
                                    <FontAwesomeIcon icon={faArrowLeft} />
                                    <span>Back</span>
                                </Link>

                                <button
                                    type="button"
                                    onClick={handleSubmitClick}
                                    className="bg-green-500 text-white rounded p-2 flex items-center space-x-2 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                                >
                                    <FontAwesomeIcon icon={faCheck} />
                                    <span>Submit</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Submit Confirmation Modal */}
            <Modal
                isOpen={submitModalOpen}
                onClose={handleSubmitModalClose}
                onConfirm={handleSubmitModalConfirm}
                title="Submit Confirmation"
                confirmButtonText={submitModalLoading ? 'Loading...' : (submitModalSuccess ? "Success" : 'Submit')}
                confirmButtonDisabled={submitModalLoading || submitModalSuccess}
            >
                <div>
                    <p>
                        Are you sure you want to submit the loan to <strong>
                            {data.customer_type === 'individual' ? (
                                `${data.first_name} ${data.other_names ? data.other_names + ' ' : ''}${data.surname}`
                            ) : (
                                data.company_name
                            )}
                        </strong>?
                    </p>

                    <label htmlFor="Submit_remarks" className="block text-sm font-medium text-gray-700 mt-4">
                        Declaration Remarks:
                    </label>
                    <textarea
                        id="Submit_remarks"
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
