import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head,Link, useForm } from '@inertiajs/react';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight,faPlus, faSave, faTimesCircle, faFileUpload, faTrash, faEye, } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';
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

export default function Edit({auth, loan, loanTypes,facilityBranches,facilityoption }) {
    // Form state using Inertia's useForm hook
    const { data, setData, post, errors, processing, reset } = useForm({
        
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
        applicationForm: null,
        application_form: loan.application_form,
        facilitybranch_id: loan.facilitybranch_id || null,
    });

    // Customer Search State (Bring back relevant parts from Create.jsx)
    //const [customerSearchQuery, setCustomerSearchQuery] = useState(loan.customer.customer_type === 'company' ? loan.customer.company_name : `${loan.customer.first_name} ${loan.customer.surname}`);
    const [customerSearchQuery, setCustomerSearchQuery] = useState('');
    const [customerSearchResults, setCustomerSearchResults] = useState([]);
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const customerDropdownRef = useRef(null);
    const customerSearchInputRef = useRef(null);
    const [customerIDError, setCustomerIDError] = useState(null);

    // New Customer Modal State (Bring back relevant parts from Create.jsx)
    const [newCustomerModalOpen, setNewCustomerModalOpen] = useState(false);
    const [newCustomer, setNewCustomer] = useState({
        customer_type: 'individual',
        first_name: '',
        other_names: '',
        surname: '',
        company_name: '',
        email: '',
        phone: '',
    });
    const [newCustomerModalLoading, setNewCustomerModalLoading] = useState(false);
    const [newCustomerModalSuccess, setNewCustomerModalSuccess] = useState(false);

    // Modal state (unchanged)
    const [modalState, setModalState] = useState({
        isOpen: false,
        message: '',
        isAlert: false,
        itemToRemoveIndex: null,
    });

    // Saving state (unchanged)
    const [isSaving, setIsSaving] = useState(false);
    const [isNexting, setIsNexting] = useState(false);

    const [filePreviewUrl, setFilePreviewUrl] = useState(null); // Track the URL of file
    const [applicationFormError, setApplicationFormError] = useState('');   
    

    // Fetch Customers dynamically (using Inertia)
    const fetchCustomers = useCallback((query) => {
        if (!query.trim()) {
            setCustomerSearchResults([]);
            return;
        }

        axios.get(route('customer0.search'), { params: { query } })
            .then((response) => {
                setCustomerSearchResults(response.data.customers.slice(0, 5));
            })
            .catch((error) => {
                console.error('Error fetching customers:', error);
                showAlert('Failed to fetch customers. Please try again later.');
                setCustomerSearchResults([]);
            });
    }, []);

    // Debounced customer search handler
    const debouncedCustomerSearch = useMemo(() => debounce(fetchCustomers, 300), [fetchCustomers]);

    // Fetch customers on search query change
    useEffect(() => {
        if (customerSearchQuery.trim()) {
            debouncedCustomerSearch(customerSearchQuery);
        } else {
            setCustomerSearchResults([]);
        }
    }, [customerSearchQuery, debouncedCustomerSearch]);


    const handleSubmit = (e) => {
        e.preventDefault();
    
        // Validate application form presence
        if (!data.applicationForm && !loan.application_form) {
            setApplicationFormError('Application Form is required.');
            return;
        }
        setApplicationFormError('');
    
        setIsSaving(true);    

        const formData = new FormData();
        for (const key in data) {
            formData.append(key, data[key]);
        }

        if (data.applicationForm) { // Check if a file has been selected
            formData.append('applicationForm', data.applicationForm);
        }   
                     
       
        axios.post(route('loan0.update', loan.id), formData)
        .then(response => {
           
            if (response.data?.success === true) {  // Explicit boolean check
              
                // Fetch updated loan data
                axios.get(route('loan0.edit', loan.id))
                    .then(response => {
                       
                        // Force re-render with the updated loan data
                        setData(prevData => ({ ...prevData, ...response.data.loan })); 

                        // Reset the form with updated loan data
                        resetForm(response.data.loan);
                        setIsSaving(false);
                    })
                    .catch(error => {
                        setIsSaving(false);
                        console.error("Error fetching updated loan data:", error);
                    });

            } else {
                console.error("Unexpected response format:", response.data);
            }
        })
        .catch(error => {
            setIsSaving(false);
            console.error("Update Error:", error.response?.data || error.message);
        });



    };
    

    const handleNext = async (e) => {
        //e.preventDefault();
        // Check if applicationForm is null
        if (!data.applicationForm && !loan.application_form) {
            setApplicationFormError('Application Form is required.');
            return;
        }
        setApplicationFormError('');

        setIsNexting(true);   
       
        const formData = new FormData();
        for (const key in data) {
            formData.append(key, data[key]);
        }
           
        // Use Inertia's put method directly
        post(route('loan0.next', loan.id), formData, {
            forceFormData: true, // Ensure Inertia uses FormData when files are present
            onSuccess: () => {
                setIsNexting(false);
                resetForm();
            },
            onError: (errors) => {
                setIsNexting(false);
                console.error('Submission errors:', errors);
            },
        });     
        
    };

    // Reset the form
    const resetForm = (updatedData) => {
        reset(updatedData); // Reset form with the updated data
        setCustomerIDError(null); 
        showAlert('Application updated successfully!');
    };    

    const handleCustomerSearchChange = (e) => {
        const query = e.target.value;
        setCustomerSearchQuery(query);
        setCustomerSearchResults([]); // Clear previous results
        setShowCustomerDropdown(!!query.trim());

        // Update appropriate fields based on customer type
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

    // Handle customer selection
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

        setCustomerSearchQuery('');
        setCustomerSearchResults([]);
        setShowCustomerDropdown(false);
    };

    // Function to handle new customer button click (Open the modal)
    const handleNewCustomerClick = () => {
        setNewCustomerModalOpen(true);
        setNewCustomerModalSuccess(false); //reset state in case open again
        setNewCustomer({
            customer_type: 'individual',
            first_name: '',
            other_names: '',
            surname: '',
            company_name: '',
            email: '',
            phone: '',
        });
    };
    // Function to close the modal
    const handleNewCustomerModalClose = () => {
        setNewCustomerModalOpen(false);
        setNewCustomerModalLoading(false);
        setNewCustomerModalSuccess(false);
    };

    // Function to confirm new customer (you should implement saving logic here)
    const handleNewCustomerModalConfirm = async () => {
        setNewCustomerModalLoading(true);
        try {
            const response = await axios.post(route('customer0.directstore'), newCustomer);

            if (response.data && response.data.id) {
                setData((prevData) => ({
                    ...prevData,
                    customer_type: response.data.customer_type,
                    first_name: response.data.first_name,
                    other_names: response.data.other_names,
                    surname: response.data.surname,
                    company_name: response.data.company_name,
                    email: response.data.email,
                    phone: response.data.phone,
                    customer_id: response.data.id,
                }));

                setNewCustomerModalSuccess(true);
            } else {
                showAlert('Error creating new customer!');
            }
        } catch (error) {
            console.error("Error creating new customer:", error);
            showAlert('Failed to create new customer. Please try again.');
        } finally {
            setNewCustomerModalLoading(false);
            setTimeout(() => {
                setNewCustomerModalOpen(false);
                setNewCustomerModalSuccess(false);
            }, 1000)

        }

    };
    
    const handleLoanAmountChange = (e) => {
        let loanAmount = parseFloat(e.target.value.replace(/,/g, '')) || 0;
        
        // Fix decimal precision to match Laravel's casting
        loanAmount = parseFloat(loanAmount.toFixed(2));
    
        setData(prevData => ({
            ...prevData,
            loanAmount: loanAmount
        }));
    };
    

    const handleLoanDurationChange = (e) => {
        const loanDuration = parseInt(e.target.value, 10) || 0;
        setData('loanDuration', loanDuration);
    };

    const roundUpToNearest = (value, roundingFactor) => {
        // Ensure that the value and roundingFactor are numbers
        if (isNaN(value) || isNaN(roundingFactor) || roundingFactor <= 0) {           
            return value; // Return original value in case of invalid input
        }
    
        // Round the value up to the nearest roundingFactor
        return Math.ceil(value / roundingFactor) * roundingFactor;
    };  

    const calculateLoanDetails = (loanAmount, loanDuration, interestRate) => {
       
        if (typeof loanAmount !== 'number' || typeof loanDuration !== 'number' || isNaN(loanAmount) || isNaN(loanDuration) || loanAmount <= 0 || loanDuration <= 0) {
            
            setData(prevData => ({
                ...prevData,
                interestAmount: 0,
                monthlyRepayment: 0,
                totalRepayment: 0,
            }));
            return;
        }

        // Simple interest calculation
        const interestRateDecimal = interestRate / 100;
        const interestAmount = loanAmount * interestRateDecimal * (loanDuration / 12);
        const totalRepayment = loanAmount + interestAmount;
        const monthlyRepayment = totalRepayment / loanDuration;

        const roundedMonthlyRepayment = roundUpToNearest(monthlyRepayment, facilityoption.rounding_factor);     

        setData(prevData => ({
            ...prevData,
            interestAmount: parseFloat(interestAmount.toFixed(2)),  // Ensure 2 decimal places
            monthlyRepayment: parseFloat(roundedMonthlyRepayment.toFixed(2)),
            totalRepayment: parseFloat(totalRepayment.toFixed(2)),
        }));
    };

 
    const showAlert = (message) => {
        setModalState({
            isOpen: true, // Change this to true to open the modal
            message: message,
            isAlert: true, // Set this if you want to distinguish between alert and confirmation
            itemToRemoveIndex: null,
        });
    };
    

    const handleNewCustomerInputChange = (e) => {
        const { id, value } = e.target;
        setNewCustomer(prevState => ({
            ...prevState,
            [id]: value,
        }));
    };

    const handleLoanTypeChange = (e) => {
        const selectedLoanType = loanTypes.find(type => type.id === parseInt(e.target.value)); // Find the selected loan type
        if (selectedLoanType) {
           
            setData(prevData => ({
                ...prevData,
                loanType: selectedLoanType.id, // Store the ID, not the object
                interestRate: parseFloat(selectedLoanType.interest_rate), // Use parseFloat for numbers
                loanDuration: selectedLoanType.duration, // Use the duration as default
            }));

            // calculateLoanDetails(data.loanAmount, selectedLoanType.duration, parseFloat(selectedLoanType.interest_rate)); // No direct call

        } else {
            setData(prevData => ({
                ...prevData,
                loanType: '',
                interestRate: 0,
                loanDuration: 0,
            }));
        }
    };

    const handleApplicationFormChange = (e) => {
        const file = e.target.files?.[0]; // Access the selected file
        if (!file) {
            setApplicationFormError('No file selected.'); // Handle no file case
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
            setApplicationFormError('File size exceeds 2MB limit.');
            return;
        }
    
        // Check if the file type is allowed
        if (!allowedTypes.includes(file.type)) {
            setApplicationFormError('Invalid file type. Please upload a PDF, DOC/DOCX, or image file (JPEG/PNG).');
            return;
        }
    
        // Store the valid file object and clear any previous error message
        setData('applicationForm', file);
        setApplicationFormError(''); // Clear error message
    };
    

    useEffect(() => {
       
        calculateLoanDetails(
            parseFloat(data.loanAmount), // Ensure number
            parseInt(data.loanDuration, 10), // Ensure integer
            parseFloat(data.interestRate)  // Ensure number
        );
    }, [data.loanAmount, data.loanDuration, data.interestRate]);

    useEffect(() => {
        // Generate preview when loan.application_form changes (initial load)
        if (loan.application_form) {
            setFilePreviewUrl(`/storage/${loan.application_form}`); // Assuming the URL is directly accessible
        }
    }, [loan.application_form]);

    const Unit = (loanTypeId) => {
        const durationUnit = loanTypes.find(type => type.id === loanTypeId)?.duration_unit || 'Months';
        return durationUnit.charAt(0).toUpperCase() + durationUnit.slice(1);
    };  
    
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Edit Application</h2>}
        >
            <Head title="Edit Application" />
            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow sm:rounded-lg">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Customer Search and New Customer Button */}
                            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                                <div className="relative flex-1" ref={customerDropdownRef}>
                                    <div className="flex items-center justify-between h-10">
                                        <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mr-2">
                                            Customer Name
                                        </label>
                                        {/* New Customer Button Added Here */}
                                        <button
                                            type="button"
                                            onClick={handleNewCustomerClick}
                                            className="bg-green-500 text-white rounded p-2 flex items-center space-x-2"
                                        >
                                            <FontAwesomeIcon icon={faPlus} />
                                        </button>
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
                                    {customerIDError && <p className="text-sm font-medium text-gray-700 mt-1">{customerIDError}</p>}
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
                                   
                                    {/* Display Customer Details After Selection */}
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
                                </div>
                            </div>

                            {/* Branch Section */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label htmlFor="facilitybranch" className="block text-sm font-medium text-gray-700">Branch</label>
                                        <select
                                            id="facilitybranch"
                                            value={data.facilitybranch_id}    
                                            onChange={(e) => setData('facilitybranch_id', e.target.value)}                                         
                                            className="w-full border p-2 rounded text-sm"
                                            required
                                        >
                                            <option value="" disabled>Select Branch</option>
                                            {facilityBranches.map(branch => (
                                                <option key={branch.id} value={branch.id}>{branch.name}</option>
                                            ))}
                                        </select>
                                        {errors.loanType && <p className="text-sm text-red-600">{errors.loanType}</p>}
                                    </div>                                  
                                    
                                </div>
                            </div>   
                            
                            {/* Loan Details Section */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label htmlFor="loanType" className="block text-sm font-medium text-gray-700">Loan Type</label>
                                        <select
                                            id="loanType"
                                            value={data.loanType}
                                            onChange={handleLoanTypeChange}
                                            className="w-full border p-2 rounded text-sm"
                                            required
                                        >
                                            <option value="" disabled>Select Loan Type</option>
                                            {loanTypes.map(type => (
                                                <option key={type.id} value={type.id}>{type.name}</option>
                                            ))}
                                        </select>
                                        {errors.loanType && <p className="text-sm text-red-600">{errors.loanType}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="loanAmount" className="block text-sm font-medium text-gray-700">Loan Amount (Tsh)</label>
                                        <input
                                            type="number"
                                            id="loanAmount"
                                            value={data.loanAmount}
                                            onChange={handleLoanAmountChange}
                                            className="w-full border p-2 rounded text-sm"
                                            required
                                        />
                                        {errors.loanAmount && <p className="text-sm text-red-600">{errors.loanAmount}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="loanDuration" className="block text-sm font-medium text-gray-700">Loan Duration ({Unit(data.loanType)})</label>
                                        <input
                                            type="number"
                                            id="loanDuration"
                                            value={data.loanDuration}
                                            onChange={handleLoanDurationChange}
                                            className="w-full border p-2 rounded text-sm"
                                            required
                                        />
                                        {errors.loanDuration && <p className="text-sm text-red-600">{errors.loanDuration}</p>}
                                    </div>
                                </div>
                            </div> 

                            {/* Loan Details Section */}
                            {data.loanType && (
                                <section className="border-b border-gray-200 pb-4">
                                    <h4 className="text-md font-semibold text-gray-700 mb-3">Loan Calculation Results</h4>
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
                                            <p className="mt-1 text-sm text-gray-500">{data.loanDuration || 'N/A'} {Unit(data.loanType)}</p>
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

                            {/* Application Form Display */}
                            <section className="border-b border-gray-200 pb-4">
                                <h4 className="text-md font-semibold text-gray-700 mb-3">Application Form</h4>
                                {data.application_form ? (
                                    <div className="mt-2">
                                        <a
                                            href={`/storage/${data.application_form}`}
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

                            {data.loanType && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">                                 
                                    {/* Upload Application Form */}
                                    <div className="relative flex-1">                                        
                                        <div className="mt-1 flex items-center">
                                            <label htmlFor="applicationForm" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                                <span>Upload</span>
                                                <FontAwesomeIcon icon={faFileUpload} className="ml-2" />
                                                <input
                                                    id="applicationForm"
                                                    name="applicationForm"
                                                    type="file"
                                                    className="sr-only"
                                                    onChange={handleApplicationFormChange}
                                                />
                                            </label>
                                            {data.applicationForm && (
                                                <span className="ml-3 text-gray-500 text-sm">
                                                    {data.applicationForm.name}
                                                </span>
                                            )}
                                            {applicationFormError && <p className="text-sm text-red-600 mt-1">{applicationFormError}</p>}
                                        </div>
                                    </div>                                                               
                                </div>
                            )}                

                            {/* Submit Button */}
                            <div className="flex justify-end space-x-4 mt-6">
                                <Link
                                    href={route('loan0.index')}  // Using the route for navigation
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

                                <button
                                    type="button"
                                    onClick={() => handleNext()} // Handle next action
                                    disabled={processing || isNexting}
                                    className="bg-green-600 text-white rounded p-2 flex items-center space-x-2"
                                >
                                    <FontAwesomeIcon icon={faArrowRight} /> {/* Right arrow icon */}
                                    <span>{isNexting ? 'Nexting...' : 'Next'}</span>
                                </button>

                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* New Customer Modal */}
            <Modal
                isOpen={newCustomerModalOpen}
                onClose={handleNewCustomerModalClose}
                onConfirm={handleNewCustomerModalConfirm}
                title="Create New Customer"
                confirmButtonText={newCustomerModalLoading ? 'Loading...' : (newCustomerModalSuccess ? "Success" : 'Confirm')}
                confirmButtonDisabled={newCustomerModalLoading || newCustomerModalSuccess}
            >
                <form className="space-y-4">
                    <div>
                        <label htmlFor="customer_type" className="block text-sm font-medium text-gray-700">Customer Type</label>
                        <select
                            id="customer_type"
                            value={newCustomer.customer_type}
                            onChange={(e) => {
                                const { id, value } = e.target;
                                setNewCustomer(prevState => ({
                                    ...prevState,
                                    [id]: value,
                                }));
                            }}
                            className="w-full border p-2 rounded text-sm"
                            disabled={newCustomerModalLoading || newCustomerModalSuccess}
                        >
                            <option value="individual">Individual</option>
                            <option value="company">Company</option>
                        </select>
                    </div>

                    {newCustomer.customer_type === 'individual' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">First Name</label>
                                <input
                                    type="text"
                                    id="first_name"
                                    value={newCustomer.first_name}
                                    onChange={(e) => {
                                        const { id, value } = e.target;
                                        setNewCustomer(prevState => ({
                                            ...prevState,
                                            [id]: value,
                                        }));
                                    }}
                                    className="w-full border p-2 rounded text-sm"
                                    disabled={newCustomerModalLoading || newCustomerModalSuccess}
                                />
                            </div>
                            <div>
                                <label htmlFor="other_names" className="block text-sm font-medium text-gray-700">Other Names</label>
                                <input
                                    type="text"
                                    id="other_names"
                                    value={newCustomer.other_names}
                                    onChange={(e) => {
                                        const { id, value } = e.target;
                                        setNewCustomer(prevState => ({
                                            ...prevState,
                                            [id]: value,
                                        }));
                                    }}
                                    className="w-full border p-2 rounded text-sm"
                                    disabled={newCustomerModalLoading || newCustomerModalSuccess}
                                />
                            </div>
                            <div>
                                <label htmlFor="surname" className="block text-sm font-medium text-gray-700">Surname</label>
                                <input
                                    type="text"
                                    id="surname"
                                    value={newCustomer.surname}
                                    onChange={(e) => {
                                        const { id, value } = e.target;
                                        setNewCustomer(prevState => ({
                                            ...prevState,
                                            [id]: value,
                                        }));
                                    }}
                                    className="w-full border p-2 rounded text-sm"
                                    disabled={newCustomerModalLoading || newCustomerModalSuccess}
                                />
                            </div>
                        </div>
                    )}

                    {newCustomer.customer_type === 'company' && (
                        <div>
                            <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">Company Name</label>
                            <input
                                type="text"
                                id="company_name"
                                value={newCustomer.company_name}
                                onChange={(e) => {
                                    const { id, value } = e.target;
                                    setNewCustomer(prevState => ({
                                        ...prevState,
                                        [id]: value,
                                    }));
                                }}
                                className="w-full border p-2 rounded text-sm"
                                disabled={newCustomerModalLoading || newCustomerModalSuccess}
                            />
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={newCustomer.email}
                            onChange={(e) => {
                                const { id, value } = e.target;
                                setNewCustomer(prevState => ({
                                    ...prevState,
                                    [id]: value,
                                }));
                            }}
                            className="w-full border p-2 rounded text-sm"
                            disabled={newCustomerModalLoading || newCustomerModalSuccess}
                        />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                        <input
                            type="text"
                            id="phone"
                            value={newCustomer.phone}
                            onChange={(e) => {
                                const { id, value } = e.target;
                                setNewCustomer(prevState => ({
                                    ...prevState,
                                    [id]: value,
                                }));
                            }}
                            className="w-full border p-2 rounded text-sm"
                            disabled={newCustomerModalLoading || newCustomerModalSuccess}
                        />
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ isOpen: false, message: '', isAlert: false, itemToRemoveIndex: null })}
                onConfirm={() => setModalState({ isOpen: false, message: '', isAlert: false, itemToRemoveIndex: null })}
                title={modalState.isAlert ? "Alert" : "Confirm Action"}
                message={modalState.message}
                isAlert={modalState.isAlert}
            />
            
        </AuthenticatedLayout>
    );
}