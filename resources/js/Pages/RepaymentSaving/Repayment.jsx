import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSave, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { Inertia } from '@inertiajs/inertia';
import axios from 'axios';

import Modal from '../../Components/CustomModal.jsx';

// Utility function for debouncing
const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
};

export default function Repayment({ loanTypes , paymentTypes}) {
    const { data, setData, post, errors, processing, reset } = useForm({
        customer_type: 'individual',
        first_name: '',
        other_names: '',
        surname: '',
        company_name: '',
        email: '',
        phone: '',
        customer_id: null,
        loanType: '',
        loanAmount: 0,
        loanDuration: 0,
        interestRate: 0,
        interestAmount: 0,
        monthlyRepayment: 0,
        totalRepayment: 0,
        stage: 1,
        applicationForm: null,
        amountToBePaid: '', // New state for the amount
    });

    const [customerSearchQuery, setCustomerSearchQuery] = useState('');
    const [customerSearchResults, setCustomerSearchResults] = useState([]);
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const customerDropdownRef = useRef(null);
    const customerSearchInputRef = useRef(null);
    const [customerIDError, setCustomerIDError] = useState(null);
    const [selectedLoan, setSelectedLoan] = useState(null); // Make sure this line is present


    const [repaymentModalOpen, setRepaymentModalOpen] = useState(false); 
    const [repaymentRemarks, setRepaymentRemarks] = useState(''); // State for the remarks
    const [remarksError, setRemarksError] = useState(''); // State to display remarks error

    const [paymentType, setPaymentType] = useState(''); // State for the paymentType
    const [paymentTypesError, setPaymentTypesError] = useState(''); // State to display remarks error
    const [amountToBePaidError, setAmountToBePaidError] = useState('');
    const [amountToBePaid, setAmountToBePaid] = useState(''); // 

    
    const [modalState, setModalState] = useState({
        isOpen: false,
        message: '',
        isAlert: false,
        itemToRemoveIndex: null,
    });

    const [isSaving, setIsSaving] = useState(false);

    const fetchCustomers = useCallback((query) => {
        if (!query.trim()) {
            setCustomerSearchResults([]);
            return;
        }

        axios.get(route('systemconfiguration0.customers.search'), { params: { query } })
            .then((response) => {
                setCustomerSearchResults(response.data.customers.slice(0, 5));
            })
            .catch((error) => {
                console.error('Error fetching customers:', error);
                showAlert('Failed to fetch customers. Please try again later.');
                setCustomerSearchResults([]);
            });
    }, []);

    const debouncedCustomerSearch = useMemo(() => debounce(fetchCustomers, 300), [fetchCustomers]);

    useEffect(() => {
        if (customerSearchQuery.trim()) {
            debouncedCustomerSearch(customerSearchQuery);
        } else {
            setCustomerSearchResults([]);
        }
    }, [customerSearchQuery, debouncedCustomerSearch]);
  
    const handleCustomerSearchChange = (e) => {
        const query = e.target.value;
        setCustomerSearchQuery(query);
        setCustomerSearchResults([]);
        setShowCustomerDropdown(!!query.trim());

        setData((prevData) => ({
            ...prevData,
            first_name: '',
            other_names: '',
            surname: '',
            company_name: '',
            email: '',
            phone: '',
            customer_id: null,
        }));
    };

    const handleClearCustomerSearch = () => {
        setCustomerSearchQuery('');
        setCustomerSearchResults([]);
        setShowCustomerDropdown(false);
        if (customerSearchInputRef.current) {
            customerSearchInputRef.current.focus();
        }

        setData((prevData) => ({
            ...prevData,
            first_name: '',
            other_names: '',
            surname: '',
            company_name: '',
            email: '',
            phone: '',
            customer_id: null,
        }));
    };

    const selectCustomer = (selectedCustomer) => {
        setData((prevData) => ({
            ...prevData,
            customer_type: selectedCustomer.customer_type,
            first_name: selectedCustomer.first_name || '',
            other_names: selectedCustomer.other_names || '',
            surname: selectedCustomer.surname || '',
            company_name: selectedCustomer.company_name || '',
            email: selectedCustomer.email,
            phone: selectedCustomer.phone || '',
            customer_id: selectedCustomer.id,
        }));

        // Fetch loan details for the selected customer
        axios.get(route('loan0.customerLoans', selectedCustomer.id)) // Create this route
            .then(response => {    

                if (response.data.loan && Object.keys(response.data.loan).length > 0) {
                    setSelectedLoan(response.data.loan);
                     setData(prevData => ({
                          ...prevData,
                          loanType: response.data.loan.loan_type, // Access using response.data.loan.loan_type
                          loanAmount: response.data.loan.loan_amount, // Access other properties similarly
                          loanDuration: response.data.loan.loan_duration,
                          interestRate: response.data.loan.interest_rate,
                          interestAmount: response.data.loan.interest_amount,
                          monthlyRepayment: response.data.loan.monthly_repayment,
                          totalRepayment: response.data.loan.total_repayment, 
                          amountToBePaid: response.data.loan.monthly_repayment, // Default to monthly repayment

                     }));

                     // Calculate and set outstanding balance
                    const outstandingBalance = calculateOutstandingBalance(response.data.loan); // Implement this function
                    setData('outstandingBalance', outstandingBalance); // Add outstandingBalance to your form data

                } else {
                    setSelectedLoan(null) // sets loan info
                    setData(prevData => ({
                        ...prevData,
                        //Reset loan details in form
                        loan_type:'',
                        loan_amount: '',
                        loan_duration: '',
                        interest_rate: '',
                        interest_amount: '',
                        monthly_repayment: '',
                        total_repayment: '',
                    }));
                    // Optionally display a message if no loan is found.
                    // alert('No loan found for this customer.');  Remove or comment if you don't need the alert
                }


            })
            .catch(error => {
                console.error("Error fetching loan details:", error);
                showAlert('Failed to fetch loan details. Please try again later.');
            });
    

        setCustomerSearchQuery('');
        setCustomerSearchResults([]);
        setShowCustomerDropdown(false);
    };

    const calculateOutstandingBalance = (loan) => {
        // Implement your logic to calculate the outstanding balance here.
        // This will depend on your specific loan repayment rules and transaction history.

        // Example (very simplified - adjust based on your actual logic):
        return loan.total_repayment - loan.payments.reduce((sum, payment) => sum + payment.amount, 0);

    };

    const showAlert = (message) => {
        setModalState({
            isOpen: true,
            message: message,
            isAlert: false,
            itemToRemoveIndex: null,
        });
    };

    const handleRepaymentClick = () => {  

        setRepaymentModalOpen(true);
        setRepaymentRemarks('');
        setRemarksError('');
        setPaymentTypesError('');
        setAmountToBePaidError(''); // Clear any previous error
      
        // Set default amount when opening the modal:
        if (selectedLoan) {
            setAmountToBePaid(selectedLoan.monthly_repayment); // Or selectedLoan.outstandingBalance if you have it available
        }

    };

    const handleRepaymentModalClose = () => {
        setRepaymentModalOpen(false);      
        setRepaymentRemarks(''); // Clear remarks when closing modal
        setRemarksError(''); // Clear any error
        setPaymentTypesError('');
    };
 
    const handleRepaymentModalConfirm = () => {
  
         if (!paymentType) { // Check paymentType state directly
             setPaymentTypesError('Select Payment Method.');
             return;
         }
 
         if (!repaymentRemarks.trim()) {
             setRemarksError('Please enter Repayment remarks.');
             return;
         }
 
         if (!data.amountToBePaid) {
            setAmountToBePaidError('Please enter the repayment amount.');
            return;
        }
    
        // Convert amountToBePaid to a number for validation
        const amount = parseFloat(data.amountToBePaid);
    
        if (isNaN(amount) || amount <= 0) {
            setAmountToBePaidError('Please enter a valid positive number for the amount.');
            return;
        }
    
        const repaymentData = {
            remarks: repaymentRemarks,
            payment_type_id: paymentType,
            amount: data.amountToBePaid, // Include the amount to be paid
        };
    
     
        // *** Replace this with your actual API call ***
        axios.post(route('loan2.repayment', loan.id), repaymentData) // Assuming you create a new route
            .then(response => {
                console.log("Repayment successful:", response);
                if (response.data && response.data.message) { // Check if message exists
                    showAlert(response.data.message); // Show message from backend
                }
 
                if (response.status === 200) { // Check the status code for success
                    Inertia.get(route('loan2.index')); // Navigate to procurements0.index
                } else {
                  console.error("Repayment failed (non-200 status):", response);
                  showAlert('Repayment failed. Please check the console for details.');
                }
            })
            .catch(error => {
                console.error("Error Repaymenting Loan:", error);
 
                let errorMessage = 'Failed to Repayment loan. Please try again.';
                if (error.response && error.response.data && error.response.data.message) {
                    errorMessage = error.response.data.message;  // Use the backend error message, if available
                }
                showAlert(errorMessage); // Show more specific error
 
            });
 
        setRepaymentModalOpen(false);      
        setRepaymentRemarks(''); // Clear remarks after confirming
        setRemarksError(''); // Clear error after confirming (or failing)
        setPaymentTypesError('');
    }; 
 
    const handlePaymentTypeChange = (e) => {
       
        setPaymentType(e.target.value); // Update 
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Loan Repayment</h2>}
        >
            <Head title="Loan Repayment" />
            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow sm:rounded-lg">
                        <form className="space-y-6">
                            {/* Customer Search and New Customer Button */}
                            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                                <div className="relative flex-1" ref={customerDropdownRef}>
                                    <div className="flex items-center justify-between h-10">
                                        <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mr-2">
                                            Customer Name
                                        </label>                                        
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search customer..."
                                        value={customerSearchQuery}
                                        onChange={handleCustomerSearchChange}
                                        onFocus={() => setShowCustomerDropdown(!!customerSearchQuery.trim())}
                                        className={`w-full border p-2 rounded text-sm pr-10 ${customerIDError ? 'border-red-500' : ''}`}
                                        ref={customerSearchInputRef}
                                        autoComplete="off"
                                    />
                                    {customerIDError && <p className="text-sm text-red-600 mt-1">{customerIDError}</p>}
                                    {customerSearchQuery && (
                                        <button
                                            type="button"
                                            onClick={handleClearCustomerSearch}
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
                                            <FontAwesomeIcon icon={faTimesCircle} />
                                        </button>
                                    )}
                                    {showCustomerDropdown && (
                                        <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-md max-h-48 overflow-y-auto">
                                            {customerSearchResults.length > 0 ? (
                                                customerSearchResults.map((customer) => (
                                                    <li
                                                        key={customer.id}
                                                        className="p-2 hover:bg-gray-100 cursor-pointer"
                                                        onClick={() => selectCustomer(customer)}
                                                    >
                                                        {customer.customer_type === 'company' ? customer.company_name : `${customer.first_name} ${customer.surname}`}
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="p-2 text-gray-500">No customers found.</li>
                                            )}
                                        </ul>
                                    )}
                                    
                                    {data.customer_id && (
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
                                                            <p className="mt-1 text-sm text-gray-500">{data.first_name || 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700">Other Names:</label>
                                                            <p className="mt-1 text-sm text-gray-500">{data.other_names || 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700">Surname:</label>
                                                            <p className="mt-1 text-sm text-gray-500">{data.surname || 'N/A'}</p>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">Company Name:</label>
                                                        <p className="mt-1 text-sm text-gray-500">{data.company_name || 'N/A'}</p>
                                                    </div>
                                                )}

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Email:</label>
                                                    <p className="mt-1 text-sm text-gray-500">{data.email || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Phone:</label>
                                                    <p className="mt-1 text-sm text-gray-500">{data.phone || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </section>
                                    )}

                                    {/* Loan Details Section */}
                                    {data.customer_id && (
                                        <section className="border-b border-gray-200 pb-4">
                                            <h4 className="text-md font-semibold text-gray-700 mb-3">Loan Details</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Loan Type:</label>
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        {loanTypes.find(type => type.id === data.loanType)?.name || 'N/A'}
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
                                                    <p className="mt-1 text-sm text-gray-500">{data.loanDuration || 'N/A'} Months</p>
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
                                    )}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end space-x-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => Inertia.get(route('loan0.index'))}
                                    className="bg-gray-300 text-gray-700 rounded p-2 flex items-center space-x-2"
                                >
                                    <FontAwesomeIcon icon={faTimesCircle} />
                                    <span>Cancel</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRepaymentClick}
                                    className="bg-green-500 hover:bg-green-700 text-white rounded px-4 py-2 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                                >
                                    <FontAwesomeIcon icon={faSave} />
                                    <span>Pay</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>  
            
            <Modal
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ isOpen: false, message: '', isAlert: false, itemToRemoveIndex: null })}
                onConfirm={() => setModalState({ isOpen: false, message: '', isAlert: false, itemToRemoveIndex: null })}
                title={modalState.isAlert ? "Alert" : "Confirm Action"}
                message={modalState.message}
                isAlert={modalState.isAlert}
            />

             {/* Repayment Confirmation Modal */}
            <Modal
                isOpen={repaymentModalOpen}
                onClose={handleRepaymentModalClose}
                onConfirm={handleRepaymentModalConfirm}
                title="Repayment Confirmation"
                confirmButtonText="Repayment"
            >
                 {/* Contains the confirmation message only */}
                <div>
                    <p>
                        Are you sure you want to repay the loan to <strong>
                            {data.customer_type === 'individual' ? (
                                `${data.first_name} ${data.other_names ? data.other_names + ' ' : ''}${data.surname}`
                            ) : (
                                data.company_name
                            )}
                        </strong>?
                    </p>
                </div>                

                {/* New div for amount input */}
                <div> 
                    <label htmlFor="amountToBePaid" className="block text-sm font-medium text-gray-700 mt-4">
                        Amount To Be Paid:
                    </label>
                    <input 
                         type="number" 
                         id="amountToBePaid"
                         name="amountToBePaid"
                         value={amountToBePaid} // Bind to amountToBePaid state
                         onChange={(e) => setAmountToBePaid(e.target.value)}
                        className={`mt-1 block w-full border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500 ${amountToBePaidError ? 'border-red-500' : ''}`}
                        min="0" // Prevent negative values
                        step="0.01" // Allow decimals (adjust as needed)
                        required
                    />

                    {amountToBePaidError && <p className="text-red-500 text-sm mt-1">{amountToBePaidError}</p>}
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

                {/* Contains remarks textarea */}
                <div> 
                    <label htmlFor="Repayment_remarks" className="block text-sm font-medium text-gray-700 mt-4">
                        Repayment Remarks:
                    </label>
                    <textarea
                        id="Repayment_remarks"
                        rows="3"
                        className="mt-1 block w-full border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        value={repaymentRemarks}
                        onChange={(e) => setRepaymentRemarks(e.target.value)}
                    />
                    {remarksError && <p className="text-red-500 text-sm mt-1">{remarksError}</p>}
                </div>
            </Modal>

        </AuthenticatedLayout>
    );
}
