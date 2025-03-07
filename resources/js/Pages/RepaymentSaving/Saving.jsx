import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react'; 
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowUp, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
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

export default function Saving({ paymentTypes }) {
    const { data, setData, post, errors, processing, reset } = useForm({
        customer_type: 'individual',
        first_name: '',
        other_names: '',
        surname: '',
        company_name: '',
        email: '',
        phone: '',
        customer_id: null,
        amount: 0, // State for deposit/withdrawal amount
    });

    const [customerSearchQuery, setCustomerSearchQuery] = useState('');
    const [customerSearchResults, setCustomerSearchResults] = useState([]);
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const customerDropdownRef = useRef(null);
    const customerSearchInputRef = useRef(null);


    const [savingModalOpen, setSavingModalOpen] = useState(false);
    const [savingRemarks, setSavingRemarks] = useState('');
    const [remarksError, setRemarksError] = useState('');
    const [paymentType, setPaymentType] = useState('');
    const [paymentTypesError, setPaymentTypesError] = useState('');
    const [amountError, setAmountError] = useState(''); // For deposit/withdrawal amount error
    const [transactionType, setTransactionType] = useState('deposit'); // 'deposit' or 'withdrawal'
   
    const [modalState, setModalState] = useState({
        isOpen: false,
        message: '',
        isAlert: false,
        itemToRemoveIndex: null,
    });

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
        axios.get(route('repaymentsavings1.customerSavings', selectedCustomer.id))
        .then(response => {           
            
            // Check if savings exists and is an array
            if (response.data.savings && Array.isArray(response.data.savings) && response.data.savings.length > 0) {
                // Assuming savings is an array, access the first element
                const savings = response.data.savings[0];
    
                setData(prevData => ({
                    ...prevData,
                    amount: savings.balance, // Access balance from the first savings object
                }));
            } else {
                setData(prevData => ({
                    ...prevData,
                    amount: 0, // Reset saving details in form
                }));
                // Optionally display a message if no savings are found.
                // alert('No savings found for this customer.'); // Uncomment if needed
            }
        })
        .catch(error => {
            console.error("Error fetching saving details:", error);
            showAlert('Failed to fetch saving details. Please try again later.');
        });
    
    

        setCustomerSearchQuery('');
        setCustomerSearchResults([]);
        setShowCustomerDropdown(false);
    };

    const showAlert = (message) => {
        setModalState({
            isOpen: true,
            message: message,
            isAlert: false,
            itemToRemoveIndex: null,
        });
    };

    const handleSavingClick = (type) => {
        setSavingModalOpen(true);
        setSavingRemarks('');
        setRemarksError('');
        setPaymentTypesError('');
        setAmountError('');
        setTransactionType(type); // Set transaction type ('deposit' or 'withdrawal')
        setData('amount', ''); // Clear amount field
    };

    const handleSavingModalClose = () => {
        setSavingModalOpen(false);
        setSavingRemarks('');
        setRemarksError('');
        setAmountError('');
        setPaymentTypesError('');
    };
 
    const handleSavingModalConfirm = () => {
        if (!paymentType) {
            setPaymentTypesError('Select Payment Method.');
            return;
        }

        if (!savingRemarks?.trim()) {
            setRemarksError('Please enter Saving remarks.');
            return;
        }

        const amount = parseFloat(data.amount);
        if (isNaN(amount) || amount <= 0) {
            setAmountError('Please enter a valid positive number for the amount.');
            return;
        }

        const savingData = {
            remarks: savingRemarks,
            payment_type_id: paymentType,
            amount: data.amount,
            transaction_type: transactionType,
        };

        axios.post(route('repaymentsavings1.savings', data.customer_id), savingData)
            .then(response => {
                if (response.data && response.data.message) {
                    showAlert(response.data.message);
                }

                if (response.status === 200) {
                    Inertia.get(route('repaymentsavings1.savingIndex'));
                } else {
                    console.error("Saving failed (non-200 status):", response);
                    showAlert('Saving transaction failed. Please check the console for details.');
                }
            })
            .catch(error => {
                console.error("Error processing saving transaction:", error);
                let errorMessage = 'Failed to process saving transaction. Please try again.';
                if (error.response && error.response.data && error.response.data.message) {
                    errorMessage = error.response.data.message;
                }
                showAlert(errorMessage);
            });

        setSavingModalOpen(false);
        setSavingRemarks('');
        setRemarksError('');
        setPaymentTypesError('');
    }; 

    const handlePaymentTypeChange = (e) => {
        setPaymentType(e.target.value);
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Loan Saving</h2>}
        >
            <Head title="Loan Saving" />
            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow sm:rounded-lg">
                        <form className="space-y-6">
                            {/* Customer Search */}
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
                                        className= "w-full border p-2 rounded text-sm pr-10"
                                        ref={customerSearchInputRef}
                                        autoComplete="off"
                                    />                                  
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

                                    {data.customer_id && ( // Only display savings details if savings data is available
                                        <section className="border-b border-gray-200 pb-4 mt-8">
                                            <h4 className="text-md font-semibold text-gray-700 mb-3">Savings Details</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Balance:</label>
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        {parseFloat(data.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Tsh
                                                    </p>
                                                </div>
                                                {/* Add other savings details as needed */}
                                            </div>
                                        </section>
                                    )}
                                        
                                </div>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex justify-end space-x-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => handleSavingClick('deposit')}
                                    className="bg-green-500 hover:bg-green-700 text-white rounded px-4 py-2 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                                >
                                     <FontAwesomeIcon icon={faArrowDown} />
                                    <span>Deposit</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSavingClick('withdrawal')}
                                    className="bg-red-500 hover:bg-red-700 text-white rounded px-4 py-2 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                                >
                                    <FontAwesomeIcon icon={faArrowUp} />
                                    <span>Withdrawal</span>
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

            <Modal
                isOpen={savingModalOpen}
                onClose={handleSavingModalClose}
                onConfirm={handleSavingModalConfirm}
                title={`${transactionType === 'deposit' ? 'Deposit' : 'Withdrawal'} Confirmation`}
                confirmButtonText={transactionType === 'deposit' ? 'Deposit' : 'Withdraw'}
            >
                <div>
                    <p>
                        Are you sure you want to <strong>{transactionType}</strong> the amount to <strong>
                            {data.customer_type === 'individual' ? (
                                `${data.first_name} ${data.other_names ? data.other_names + ' ' : ''}${data.surname}`
                            ) : (
                                data.company_name
                            )}
                        </strong>?
                    </p>

                </div>

                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mt-4">Amount:</label>
                    <input
                        type="number"
                        id="amount"
                        name="amount"
                        value={data.amount}
                        onChange={(e) => setData('amount', e.target.value)}
                        className={`mt-1 block w-full border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500 ${amountError ? 'border-red-500' : ''}`}
                        min="0"
                        step="0.01"
                        required
                    />
                    {amountError && <p className="text-red-500 text-sm mt-1">{amountError}</p>}
                </div>

                <div>
                    <label htmlFor="paymentType" className="block text-sm font-medium text-gray-700 mt-4">Payment Type</label>
                    <select
                        id="paymentType"
                        onChange={handlePaymentTypeChange}
                        value={paymentType}
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

                <div>
                    <label htmlFor="savingRemarks" className="block text-sm font-medium text-gray-700 mt-4">
                        {transactionType === 'deposit' ? 'Deposit' : 'Withdrawal'} Remarks:
                    </label>
                    <textarea
                        id="savingRemarks"
                        rows="3"
                        className="mt-1 block w-full border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        value={savingRemarks}
                        onChange={(e) => setSavingRemarks(e.target.value)}
                    />
                    {remarksError && <p className="text-red-500 text-sm mt-1">{remarksError}</p>}
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}

