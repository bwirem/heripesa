import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head,Link, useForm } from '@inertiajs/react';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faTimesCircle, faEye, faPlus, faTrash, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { Inertia } from '@inertiajs/inertia';
import axios from 'axios';

import Modal from '../../Components/CustomModal.jsx';
import InputField from '../../Components/CustomInputField1.jsx';

// Utility function for debouncing
const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
};

export default function Documentation({ loan, loanTypes }) {
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
        guarantors: loan.loan_guarantors || [],  // Array of guarantor details
    });

    // Guarantor-related states
    const [guarantorSearchQuery, setGuarantorSearchQuery] = useState('');
    const [guarantorSearchResults, setGuarantorSearchResults] = useState([]);
    const [showGuarantorDropdown, setShowGuarantorDropdown] = useState(false);
    const guarantorDropdownRef = useRef(null);
    const guarantorSearchInputRef = useRef(null);

    const [newGuarantorModalOpen, setNewGuarantorModalOpen] = useState(false);
    const [newGuarantor, setNewGuarantor] = useState({
        guarantor_type: 'individual',
        first_name: '',
        other_names: '',
        surname: '',
        company_name: '',
        email: '',
        phone: '',
    });
    const [newGuarantorModalLoading, setNewGuarantorModalLoading] = useState(false);
    const [newGuarantorModalSuccess, setNewGuarantorModalSuccess] = useState(false);

    const [selectedGuarantorIndex, setSelectedGuarantorIndex] = useState(null); // Track index of selected guarantor

    const [existingGuarantorIds, setExistingGuarantorIds] = useState([]); // Track existing guarantor IDs


    // Modal state
    const [modalState, setModalState] = useState({
        isOpen: false,
        message: '',
        isAlert: false,
        itemToRemoveIndex: null,
    });

    // Saving state
    const [isSaving, setIsSaving] = useState(false);     

    const fetchGuarantors = useCallback((query) => {
        if (!query.trim()) {
            setGuarantorSearchResults([]);
            setShowGuarantorDropdown(false);
            return;
        }
    
        axios.get(route('customer2.search'), { params: { query } })
            .then((response) => {
                setGuarantorSearchResults(response.data.guarantors.slice(0, 5)); // Ensure it's accessing the correct data
                setShowGuarantorDropdown(true);
            })
            .catch((error) => {
                console.error('Error fetching guarantors:', error);
                showAlert('Failed to fetch guarantors. Please try again later.');
                setGuarantorSearchResults([]);
                setShowGuarantorDropdown(false);
            });
    }, []);

    const debouncedGuarantorSearch = useMemo(() => debounce(fetchGuarantors, 300), [fetchGuarantors]);

    useEffect(() => {
        debouncedGuarantorSearch(guarantorSearchQuery);
    }, [guarantorSearchQuery, debouncedGuarantorSearch]);

    useEffect(() => {
        // Initialize existingGuarantorIds when the component mounts
        setExistingGuarantorIds(loan.loan_guarantors.map(guarantor => guarantor.guarantor_id));
    }, [loan.loan_guarantors]);


    

    const showAlert = (message) => {
        setModalState({
            isOpen: true,
            message: message,
            isAlert: false,
            itemToRemoveIndex: null,
        });
    };
   
    //GUARANTOR FUNCTIONS START
    const handleGuarantorSearchChange = (e) => {
        const query = e.target.value;
        setGuarantorSearchQuery(query);
        setShowGuarantorDropdown(!!query.trim());
    };

    const handleClearGuarantorSearch = () => {
        setGuarantorSearchQuery('');
        setGuarantorSearchResults([]);
        setShowGuarantorDropdown(false);
        if (guarantorSearchInputRef.current) {
            guarantorSearchInputRef.current.focus();
        }
    };

    const selectGuarantor = (guarantor) => {        

        if (existingGuarantorIds.includes(guarantor.id) || data.guarantors.some(g => g.guarantor_id === guarantor.id)) {
            const guarantorName = guarantor.guarantor_type === 'company' ? guarantor.company_name : `${guarantor.first_name} ${guarantor.surname}`;
            showAlert(`The guarantor "${guarantorName}" has already been added.`); // Include the name
            return;
        }

        setData(prevData => ({
            ...prevData,
            guarantors: [...prevData.guarantors, {
                guarantor_id: guarantor.id,
                // Conditionally include name based on guarantor type
                ...(guarantor.guarantor_type === 'company'
                    ? { company_name: guarantor.company_name }
                    : { first_name: guarantor.first_name, surname: guarantor.surname }),
                guarantor_type: guarantor.guarantor_type, //Add the type
                collateral_doc: null,
                collateralDocName: ''
            }],
        }));

        setExistingGuarantorIds([...existingGuarantorIds, guarantor.id]); // Add to existing IDs

        setGuarantorSearchQuery('');
        setGuarantorSearchResults([]);
        setShowGuarantorDropdown(false);
    };
    
    const handleNewGuarantorClick = () => {
        setNewGuarantorModalOpen(true);
        setNewGuarantorModalSuccess(false);
        setNewGuarantor({
            guarantor_type: 'individual',
            first_name: '',
            other_names: '',
            surname: '',
            company_name: '',
            email: '',
            phone: '',
        });
    };
    
    const handleNewGuarantorModalClose = () => {
        setNewGuarantorModalOpen(false);
        setNewGuarantorModalLoading(false);
        setNewGuarantorModalSuccess(false);
    };
    
    const handleNewGuarantorInputChange = (e) => {
        const { id, value } = e.target;
        setNewGuarantor(prevState => ({ ...prevState, [id]: value }));
    };
    
    const handleNewGuarantorModalConfirm = async () => {
        setNewGuarantorModalLoading(true);
        try {
            const response = await axios.post(route('customer2.directstore'), newGuarantor);
    
            if (response.data && response.data.id) {

                if (existingGuarantorIds.includes(response.data.id) || data.guarantors.some(g => g.guarantor_id === response.data.id)) {
                    showAlert('This guarantor has already been added.');
                    setNewGuarantorModalLoading(false);
                    return;
                }

                setData(prevData => ({
                    ...prevData,
                    guarantors: [...prevData.guarantors, {
                        guarantor_id: response.data.id,
                        // Conditionally include name based on guarantor type
                        ...(response.data.guarantor_type === 'company'
                            ? { company_name: response.data.company_name }
                            : { first_name: response.data.first_name, surname: response.data.surname }),
                         guarantor_type: response.data.guarantor_type, //Add the type
                        collateral_doc: null,
                        collateralDocName: ''
                    }],
                }));

                setExistingGuarantorIds([...existingGuarantorIds, response.data.id]); // Add to existing IDs

                setNewGuarantorModalSuccess(true);
            } else {
                showAlert('Error creating new guarantor!');
            }
        } catch (error) {
            console.error("Error creating new guarantor:", error);
            showAlert('Failed to create new guarantor. Please try again.');
        } finally {
            setNewGuarantorModalLoading(false);
            setTimeout(() => {
                setNewGuarantorModalOpen(false);
                setNewGuarantorModalSuccess(false);
            }, 1000);
        }
    };

    const removeGuarantor = (index) => {
        setModalState({ isOpen: true, message: 'Are you sure you want to remove this guarantor?', isAlert: false, itemToRemoveIndex: index });
    };
 
    //Modal confirmations
    const handleModalConfirm = () => {
        if (modalState.itemToRemoveIndex !== null) {
            setData(prevData => {
                const indexToRemove = modalState.itemToRemoveIndex;
                const updatedGuarantors = [...prevData.guarantors];
                const removedGuarantorId = updatedGuarantors[indexToRemove].guarantor_id; // Get the ID of the removed guarantor
    
                //If item has an id, set to null.
                if (updatedGuarantors[indexToRemove].id != null) {
                    updatedGuarantors[indexToRemove] = { ...updatedGuarantors[indexToRemove], 'id': null }
                } else {
                    updatedGuarantors.splice(indexToRemove, 1); // Remove the item from the array
                }
    
                // Update existingGuarantorIds state
                setExistingGuarantorIds(prevIds => prevIds.filter(id => id !== removedGuarantorId));
    
                return { ...prevData, guarantors: updatedGuarantors };
            });
        }
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

        if (!data.guarantors || data.guarantors.length === 0) {
            showAlert('No guarantors provided.');
            setIsSaving(false);
            return;
        }        
    
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
    
        
        // Use Inertia's put method directly
        post(route('loan0.next', loan.id), formData, {
            forceFormData: true, // Ensure Inertia uses FormData when files are present
            onSuccess: () => {
                setIsSaving(false);
                resetForm();
            },
            onError: (errors) => {
                setIsSaving(false);
                console.error('Submission errors:', errors);
            },
        });     
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

    const handleFileSelect = (index, event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const MAX_SIZE = 2 * 1024 * 1024;
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png'
        ];

        if (file.size > MAX_SIZE) {
            showAlert('File size exceeds 2MB limit.');
            return;
        }

        if (!allowedTypes.includes(file.type)) {
            showAlert('Invalid file type. Please upload a PDF, DOC/DOCX, or image file (JPEG/PNG).');
            return;
        }
        
        setData(prevData => {
        
            const updatedGuarantors = prevData.guarantors.map((guarantorData, i) => {
                if (i === index) {               
                    return { ...guarantorData, collateral_doc: file, collateralDocName: file.name };
                }
            
                return guarantorData;
            });        
            return { ...prevData, guarantors: updatedGuarantors };
        });
    };

    const handleClearFile = (index) => {
        setData(prevData => {
            const updatedGuarantors = prevData.guarantors.map((guarantorData, i) =>
                i === index
                    ? { ...guarantorData, collateral_doc: null, collateralDocName: '' } // Set both to null/empty
                    : guarantorData
            );
            return { ...prevData, guarantors: updatedGuarantors };
        });
    };

    const Unit = (loanTypeId) => {
        const durationUnit = loanTypes.find(type => type.id === loanTypeId)?.duration_unit || 'Months';
        return durationUnit.charAt(0).toUpperCase() + durationUnit.slice(1);
    }; 

    
return (
    <AuthenticatedLayout
        header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Documentation</h2>}
    >
        <Head title="Documentation" />
        <div className="py-12">
            <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                <div className="bg-white p-6 shadow sm:rounded-lg">
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
                            <div className="flex items-center space-x-4 mb-2 py-1">
                                <div className="relative flex-1" ref={guarantorDropdownRef}>
                                    <input
                                        type="text"
                                        placeholder="Search guarantor..."
                                        value={guarantorSearchQuery}
                                        onChange={handleGuarantorSearchChange}
                                        onFocus={() => setShowGuarantorDropdown(!!guarantorSearchQuery.trim())}
                                        className="w-full border p-2 rounded text-sm pr-10"
                                        ref={guarantorSearchInputRef}
                                        autoComplete="off"
                                    />
                                    {guarantorSearchQuery && (
                                        <button
                                            type="button"
                                            onClick={handleClearGuarantorSearch}
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
                                            <FontAwesomeIcon icon={faTimesCircle} />
                                        </button>
                                    )}
                                    {showGuarantorDropdown && (
                                        <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-md max-h-48 overflow-y-auto">
                                            {guarantorSearchResults.length > 0 ? (
                                                guarantorSearchResults.map((guarantor) => (
                                                    <li
                                                        key={guarantor.id}
                                                        className="p-2 hover:bg-gray-100 cursor-pointer"
                                                        onClick={() => selectGuarantor(guarantor)}
                                                    >
                                                        {guarantor.guarantor_type === 'company' ? guarantor.company_name : `${guarantor.first_name} ${guarantor.surname}`}
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="p-2 text-gray-500">No guarantors found.</li>
                                            )}
                                        </ul>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={handleNewGuarantorClick}
                                    className="bg-green-500 text-white rounded p-2 flex items-center space-x-2"
                                >
                                    <FontAwesomeIcon icon={faPlus} />
                                    <span>New</span>
                                </button>
                            </div>                    

                            {/* Guarantor Table */}
                            <div className="overflow-x-auto bg-white border border-gray-300 rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Collateral Document
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Preview
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {data.guarantors.map((guarantorData, index) => {
                                            return (
                                                <tr key={index}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {guarantorData.guarantor_type === 'company' ? guarantorData.company_name : `${guarantorData.first_name} ${guarantorData.surname}`}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                                        <div className="flex items-center">
                                                            <InputField
                                                                id={`quotation-file-${index}`} // Unique ID for the HIDDEN input
                                                                type="file"
                                                                placeholder="Attach File"
                                                                value={guarantorData.collateralDocName} // Display filename in the LABEL (not url)
                                                                onChange={(e) => handleFileSelect(index, e)} // Handle file selection
                                                                htmlFor={`quotation-file-${index}`} // Associate label with input
                                                            />
                                                            {guarantorData.collateral_doc && ( // Display filename if it exists
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleClearFile(index)}
                                                                    className="ml-2 text-red-600 hover:text-red-800"
                                                                    title="Clear File"
                                                                >
                                                                    <FontAwesomeIcon icon={faTimes} />
                                                                </button>
                                                            )}
                                                        </div>
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
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeGuarantor(index)}
                                                            className="ml-2 text-red-600 hover:text-red-800"
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </section>                         

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

                            <Link
                                href={route('loan0.back', loan.id)}  // Using the route for navigation
                                method="get"  // Optional, if you want to define the HTTP method (GET is default)
                                preserveState={true}  // Keep the page state (similar to `preserveState: true` in the button)
                                className="bg-blue-300 text-blue-700 rounded p-2 flex items-center space-x-2"
                            >
                                <FontAwesomeIcon icon={faArrowLeft} /> {/* Left arrow icon */}
                                <span>Back</span>
                            </Link>
                            
                            <button
                                type="submit"
                                disabled={processing || isSaving}
                                className="bg-green-600 text-white rounded p-2 flex items-center space-x-2"
                            >
                                <FontAwesomeIcon icon={faArrowRight} /> {/* Right arrow icon */}
                                <span>{isSaving ? 'Saving...' : 'Next'}</span>
                            </button>  

                        </div>
                    </form>
                </div>
            </div>
        </div>

        {/* New Guarantor Modal */}
        <Modal
            isOpen={newGuarantorModalOpen}
            onClose={handleNewGuarantorModalClose}
            onConfirm={handleNewGuarantorModalConfirm}
            title="Create New Guarantor"
            confirmButtonText={newGuarantorModalLoading ? 'Loading...' : (newGuarantorModalSuccess ? "Success" : 'Confirm')}
            confirmButtonDisabled={newGuarantorModalLoading || newGuarantorModalSuccess}
        >
            <form className="space-y-4">
                <div>
                    <label htmlFor="guarantor_type" className="block text-sm font-medium text-gray-700">Guarantor Type</label>
                    <select
                        id="guarantor_type"
                        value={newGuarantor.guarantor_type}
                        onChange={(e) => handleNewGuarantorInputChange(e)}
                        className="w-full border p-2 rounded text-sm"
                        disabled={newGuarantorModalLoading || newGuarantorModalSuccess}
                    >
                        <option value="individual">Individual</option>
                        <option value="company">Company</option>
                    </select>
                </div>

                {newGuarantor.guarantor_type === 'individual' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">First Name</label>
                            <input
                                type="text"
                                id="first_name"
                                value={newGuarantor.first_name}
                                onChange={(e) => handleNewGuarantorInputChange(e)}
                                className="w-full border p-2 rounded text-sm"
                                disabled={newGuarantorModalLoading || newGuarantorModalSuccess}
                            />
                        </div>
                        <div>
                            <label htmlFor="other_names" className="block text-sm font-medium text-gray-700">Other Names</label>
                            <input
                                type="text"
                                id="other_names"
                                value={newGuarantor.other_names}
                                onChange={(e) => handleNewGuarantorInputChange(e)}
                                className="w-full border p-2 rounded text-sm"
                                disabled={newGuarantorModalLoading || newGuarantorModalSuccess}
                            />
                        </div>
                        <div>
                            <label htmlFor="surname" className="block text-sm font-medium text-gray-700">Surname</label>
                            <input
                                type="text"
                                id="surname"
                                value={newGuarantor.surname}
                                onChange={(e) => handleNewGuarantorInputChange(e)}
                                className="w-full border p-2 rounded text-sm"
                                disabled={newGuarantorModalLoading || newGuarantorModalSuccess}
                            />
                        </div>
                    </div>
                )}

                {newGuarantor.guarantor_type === 'company' && (
                    <div>
                        <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">Company Name</label>
                        <input
                            type="text"
                            id="company_name"
                            value={newGuarantor.company_name}
                            onChange={(e) => handleNewGuarantorInputChange(e)}
                            className="w-full border p-2 rounded text-sm"
                            disabled={newGuarantorModalLoading || newGuarantorModalSuccess}
                        />
                    </div>
                )}

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={newGuarantor.email}
                        onChange={(e) => handleNewGuarantorInputChange(e)}
                        className="w-full border p-2 rounded text-sm"
                        disabled={newGuarantorModalLoading || newGuarantorModalSuccess}
                    />
                </div>
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                        type="text"
                        id="phone"
                        value={newGuarantor.phone}
                        onChange={(e) => handleNewGuarantorInputChange(e)}
                        className="w-full border p-2 rounded text-sm"
                        disabled={newGuarantorModalLoading || newGuarantorModalSuccess}
                    />
                </div>
            </form>
        </Modal>

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
