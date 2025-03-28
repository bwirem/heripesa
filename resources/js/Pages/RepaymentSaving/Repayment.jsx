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
        loan_id: null,
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
        amount: '', // New state for the amount
        payment_date: new Date().toISOString().slice(0, 10), // Initialize payment_date to today's date
    });

    const [customerSearchQuery, setCustomerSearchQuery] = useState('');
    const [customerSearchResults, setCustomerSearchResults] = useState([]);
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const customerDropdownRef = useRef(null);
    const customerSearchInputRef = useRef(null);
    const [customerIDError, setCustomerIDError] = useState(null);
    const [selectedLoan, setSelectedLoan] = useState(null); // Make sure this line is present
   
    
    const [repaymentModalOpen, setRepaymentModalOpen] = useState(false);
    const [repaymentRemarks, setRepaymentRemarks] = useState('');
    const [remarksError, setRemarksError] = useState('');
    const [paymentType, setPaymentType] = useState('');
    const [paymentTypesError, setPaymentTypesError] = useState('');
    const [amountError, setAmountError] = useState('');  //  

    
    const [totalPaid, setTotalPaid] = useState(0);  // State for total amount paid
    const [remainingDebt, setRemainingDebt] = useState(0);  // State for remaining debt
    const [overdueRepayments, setOverdueRepayments] = useState([]);    
    
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
                          loan_id: response.data.loan.id,
                          loanType: response.data.loan.loan_type, // Access using response.data.loan.loan_type
                          loanAmount: response.data.loan.loan_amount, // Access other properties similarly
                          loanDuration: response.data.loan.loan_duration,
                          interestRate: response.data.loan.interest_rate,
                          interestAmount: response.data.loan.interest_amount,
                          monthlyRepayment: response.data.loan.monthly_repayment,
                          totalRepayment: response.data.loan.total_repayment,
                     }));

                    // Calculate and set loan details (totalPaid, remainingDebt, overdueRepayments)
                    const { total_paid, remaining_debt } = calculateLoanDetails(response.data.loan);
                    setTotalPaid(total_paid);
                    setRemainingDebt(remaining_debt);
                    
                    const overdue = calculateOverdueRepayments(response.data.loan);
                    setOverdueRepayments(overdue);

                    // Set default amount ONLY if a loan exists
                    setData('amount', response.data.loan.monthly_repayment); 


                } else {
                    setSelectedLoan(null) // sets loan info
                    setData(prevData => ({
                        ...prevData,
                        //Reset loan details in form                        
                        loan_id: null,
                        loan_type:'',
                        loan_amount: '',
                        loan_duration: '',
                        interest_rate: '',
                        interest_amount: '',
                        monthly_repayment: '',
                        total_repayment: '',
                    }));

                    setTotalPaid(0);
                    setRemainingDebt(0);
                    setOverdueRepayments([]);
    
                    // It's better to reset amount since no loan found
                    setData('amount','');  // Do NOT attempt to set amountToBePaid if there's no loan!
                }

                setAmountError(''); // Clear any amount errors

            })
            .catch(error => {
                console.error("Error fetching loan details:", error);
                showAlert('Failed to fetch loan details. Please try again later.');
            });
    

        setCustomerSearchQuery('');
        setCustomerSearchResults([]);
        setShowCustomerDropdown(false);
    };  

    // Helper function to calculate total paid and remaining debt
    const calculateLoanDetails = (loan) => {
       
        let totalPaid = 0;
        if (loan.payments && Array.isArray(loan.payments)) {
            totalPaid = loan.payments.reduce((sum, payment) => {
                
                // Check if payment.amount_paid is a valid number before adding
                const amountPaid = parseFloat(payment.amount_paid); // Convert amount_paid to number
                if (!isNaN(amountPaid)) {
                    return sum + amountPaid;
                } else {                  
                    return sum; // Skip invalid amount
                }
    
            }, 0);
    
        }
    
        const remainingDebt = parseFloat(loan.total_repayment) - totalPaid; //Parse total_repayment        
        return { total_paid: totalPaid, remaining_debt: remainingDebt };
    };

    const calculateOverdueRepayments = (loan) => {
        if (!loan || !loan.payments || !Array.isArray(loan.payments) || !loan.created_at) {
            return [];
        }
    
        const overdue = [];
        const disburseDate = new Date(loan.created_at);
    
        // Loop through expected payment dates based on loan duration
        for (let i = 1; i <= loan.loan_duration; i++) { // Loop from month 1 up to loan duration
            const expectedPaymentDate = new Date(disburseDate);
            expectedPaymentDate.setMonth(disburseDate.getMonth() + i); // Set the expected payment date
    
            const expectedPaymentDateString = formatDate(expectedPaymentDate); // Use the formatDate function
    
            // Find the payment corresponding to the expected payment date
            const payment = loan.payments.find(p => {
              const paymentDate = new Date(p.payment_date);
              return (
                paymentDate.getFullYear() === expectedPaymentDate.getFullYear() &&
                paymentDate.getMonth() === expectedPaymentDate.getMonth()
              );
            });
    
    
            const amountDueForMonth = loan.monthly_repayment;  // Assuming all payments should be monthly_repayment amount
    
    
            // Check for overdue status
            if (!payment && expectedPaymentDate < new Date()) { // Overdue if no payment and due date has passed.
              overdue.push({
                expected_payment_date: expectedPaymentDateString,
                actual_payment_date: null, // No payment made
                amount_due: amountDueForMonth,
              });
    
            } else if (payment && payment.amount_paid < amountDueForMonth && expectedPaymentDate < new Date()) { // Check payment amount. If less than the amount due for that month, then overdue
              overdue.push({
                expected_payment_date: expectedPaymentDateString,
                actual_payment_date: formatDate(new Date(payment.payment_date)),
                amount_due: amountDueForMonth - payment.amount_paid,
              });
            }
    
        }
    
        return overdue;
    };
    
    
    
    const formatDate = (date) => {
        // Helper function to format date to your preferred format (e.g., YYYY-MM-DD)
        if (!date) return ''; // Handle null or undefined date

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
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
        
        if (!data.amount || parseFloat(data.amount) <= 0) { // Validate amount directly in data
            setAmountError('Please enter a valid positive repayment amount.');
            return;
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
 
    
        if (!data.amount || parseFloat(data.amount) <= 0) { // Validate amount directly in data
            setAmountError('Please enter a valid positive repayment amount.');
            return;
        }
    
        const repaymentData = {
            remarks: repaymentRemarks,
            payment_type_id: paymentType,
            amount: parseFloat(data.amount), // Use data.amount. parseFloat to ensure it's a number.
            payment_date: data.payment_date, // Add the payment date to the request data
        };
    
     
        // *** Replace this with your actual API call ***
        axios.post(route('repaymentsavings0.pay', data.loan_id), repaymentData) // Assuming you create a new route
            .then(response => {
                console.log("Repayment successful:", response);
                if (response.data && response.data.message) { // Check if message exists
                    showAlert(response.data.message); // Show message from backend
                }
 
                if (response.status === 200) { // Check the status code for success
                    Inertia.get(route('repaymentsavings0.repaymentIndex')); // Navigate to procurements0.index
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
                                    {data.loan_id ? (
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

                                                <div> {/* New for total paid */}
                                                    <label className="block text-sm font-medium text-gray-700">Total Paid:</label>
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        {parseFloat(totalPaid).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Tsh
                                                    </p>
                                                </div>

                                                <div> {/* New for remaining debt */}
                                                    <label className="block text-sm font-medium text-gray-700">Remaining Debt:</label>
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        {parseFloat(remainingDebt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Tsh
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Conditionally render overdue repayments */}
                                            {overdueRepayments.length > 0 && (
                                                <div className="mt-4">
                                                    <h5 className="text-lg font-semibold text-red-600">Overdue Repayments</h5>
                                                    <ul>
                                                        {overdueRepayments.map((repayment, index) => (
                                                            <li key={index} className="text-red-500">
                                                                {/* Display overdue repayment details */}
                                                                <p>Expected: {repayment.expected_payment_date}, Actual: {repayment.actual_payment_date || 'Not paid'}, Amount Due: {repayment.amount_due}</p>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                        </section>
                                    ) : (
                                        data.customer_id && (<p className="text-center text-gray-700">No active loan found.</p> )
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

                <div>
                    <label htmlFor="payment_date" className="block text-sm font-medium text-gray-700 mt-4">Payment Date:</label>
                    <input
                        type="date" // Use a date input
                        id="payment_date"
                        name="payment_date"
                        value={data.payment_date}
                        onChange={e => setData('payment_date', e.target.value)} // Update payment_date in state
                        className="mt-1 block w-full border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>             

                {/* New div for amount input */}
                <div> 
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mt-4">
                        Amount To Be Paid:
                    </label>
                    <input 
                         type="number" 
                         id="amount"
                         name="amount"
                         value={data.amount}  //  Bind to data.amount
                         onChange={(e) => {
                            setData('amount', e.target.value);  // Update data.amount
                            setAmountError('');  // Clear error on change
                        }}
                        className={`mt-1 block w-full border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500 ${amountError ? 'border-red-500' : ''}`}
                        min="0" // Prevent negative values
                        step="0.01" // Allow decimals (adjust as needed)
                        required
                    />
                    {amountError && <p className="text-red-500 text-sm mt-1">{amountError}</p>}
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
