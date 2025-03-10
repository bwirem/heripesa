import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBars, faTimes, faUser, faSignOutAlt, faHome, faShoppingCart, faPlusSquare, faMoneyBill,faClipboardList,
    faMoneyBillAlt,faHistory, faBoxes, faFileInvoice, faCartPlus,    faBook, faChartBar, faFileAlt, faUsersCog,
    faCogs,faBuilding, faShieldAlt, faColumns, faFileInvoiceDollar, faUserFriends, faCalculator, faFileContract, 
    faUpload,faUserSlash, faMoneyCheckAlt, faCog, faUsers
} from "@fortawesome/free-solid-svg-icons";
import { faHistory as faSalesHistory } from '@fortawesome/free-solid-svg-icons';
import { faFileInvoice as faloanSetupIcon } from '@fortawesome/free-solid-svg-icons';
import { faMoneyBillWave as faExpensesSetupIcon } from '@fortawesome/free-solid-svg-icons';
import { faMapMarkerAlt as faLocationSetupIcon } from '@fortawesome/free-solid-svg-icons';
import "@fortawesome/fontawesome-svg-core/styles.css";

// Constants for CSS classes
const navLinkClasses = 'flex items-center p-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md';
const caretClasses = (isOpen) => `caret ${isOpen ? 'rotate-180' : ''}`;

// Optimized Icon Map (using only icons actively referenced and differentiating similar features)
const iconMap = {
    home: faHome,
    add_shopping_cart: faShoppingCart,
    post_add: faPlusSquare,
    paid: faMoneyBill,
    loan_reconciliation: faClipboardList, 
    sales_history: faSalesHistory,
    attach_money: faMoneyBillAlt,
    history: faHistory,
    inventory: faBoxes,
    request_quote: faFileInvoice,
    shopping_cart: faCartPlus,
    financial_accounting: faCalculator, // Distinct icon for Financial Accounting
    general_ledger: faBook,
    profit_loss: faColumns,
    reporting_analytics: faChartBar, // Distinct icon for Reporting/Analytics
    loan_reports: faFileContract,  //Use loan reports
    client_reports: faUserFriends,
    financial_analytics: faFileInvoiceDollar,
    manage_accounts: faUsersCog,
    loan_setup: faloanSetupIcon,
    expenses_setup: faExpensesSetupIcon,
    location_setup: faLocationSetupIcon,
    facility_setup: faBuilding,
    security_settings: faShieldAlt,
    system_config: faCogs,

    person: faUser, // For Employee Bio Data
    upload: faUpload, //For Import Employee Data
    person_outline: faUserSlash, // For Termination  (assuming you add faUserSlash to your imports)
    payroll: faMoneyCheckAlt, //  For Payroll (assuming you add faMoneyCheckAlt to imports)
    settings: faCog, //Or faCogs for setup
};

// SidebarNavLink Component
function SidebarNavLink({ href, icon, children }) {
    return (
        <li>
            <Link href={href} className={navLinkClasses}>
                {icon && <FontAwesomeIcon icon={icon} className="mr-2" />}
                <span className="sidebar-normal">{children}</span>
            </Link>
        </li>
    );
}

// SidebarItem Component
function SidebarItem({ icon, label, isOpen, toggleOpen, children, href }) {
    return (
        <li>
            {href ? (
                <Link href={href} className={navLinkClasses}>
                    {icon && <FontAwesomeIcon icon={icon} className="mr-2" />}
                    <p>{label}</p>
                </Link>
            ) : (
                <button
                    onClick={toggleOpen}
                    className="flex items-center p-2 text-gray-300 hover:bg-gray-700 hover:text-white w-full rounded-md focus:outline-none"
                    aria-expanded={isOpen}
                >
                    {icon && <FontAwesomeIcon icon={icon} className="mr-2" />}
                    <p>
                        {label}
                        <b className={caretClasses(isOpen)}></b>
                    </p>
                </button>
            )}
            {children && isOpen && (
                <div className="pl-6">
                    <ul className="nav">{children}</ul>
                </div>
            )}
        </li>
    );
}

// Menu Button Component
function MenuButton({ children, onClick, className }) {
    return (
        <button
            onClick={onClick}
            className={`inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none ${className}`}
        >
            {children}
        </button>
    );
}

// Main Component
export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [sidebarVisible, setSidebarVisible] = useState(window.innerWidth >= 640);
    const [sidebarState, setSidebarState] = useState({
        loan: false,
        repaymentsSavings: false,
        expenses: false,
        humanresurces: false,
        accounting: false,
        reporting: false,
        systemConfig: false,
        userManagement: false,
        security: false,
    });

    useEffect(() => {
        const handleResize = () => setSidebarVisible(window.innerWidth >= 640);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebarSection = (section) => {
        setSidebarState((prevState) => ({
            ...prevState,
            [section]: !prevState[section],
        }));
    };

    const sidebarMenuItems = [
        {
            label: 'Home',
            icon: iconMap.home,
            isOpen: true,
            toggleOpen: () => { },
            href: '/dashboard',
        },
        {
            label: 'Loan Management',
            icon: iconMap.add_shopping_cart,
            isOpen: sidebarState.loan,
            toggleOpen: () => toggleSidebarSection('loan'),
            children: (
                <>
                    <SidebarNavLink href="/loan0" icon={iconMap.add_shopping_cart}>
                        Application
                    </SidebarNavLink>
                    <SidebarNavLink href="/loan1" icon={iconMap.post_add}>
                        Approval Workflow
                    </SidebarNavLink>
                    <SidebarNavLink href="/loan2" icon={iconMap.paid}>
                        Disbursement
                    </SidebarNavLink>
                    <SidebarNavLink href="/loan3" icon={iconMap.loan_reconciliation}>
                        Reconciliation
                    </SidebarNavLink>
                    <SidebarNavLink href="/loan4" icon={iconMap.sales_history}>
                        History
                    </SidebarNavLink>
                </>
            ),
        },
        {
            label: 'Repayments & Savings',
            icon: iconMap.inventory,
            isOpen: sidebarState.repaymentsSavings,
            toggleOpen: () => toggleSidebarSection('repaymentsSavings'),
            children: (
                <>
                    <SidebarNavLink href="/repaymentsavings0" icon={iconMap.request_quote}>
                        Repayments
                    </SidebarNavLink>
                    <SidebarNavLink href="/repaymentsavings1" icon={iconMap.shopping_cart}>
                        Savings
                    </SidebarNavLink>
                    <SidebarNavLink href="/repaymentsavings2" icon={iconMap.request_quote}>
                        Collections
                    </SidebarNavLink>
                </>
            ),
        },
        {
            label: 'Expenses',
            icon: iconMap.attach_money,
            isOpen: sidebarState.expenses,
            toggleOpen: () => toggleSidebarSection('expenses'),
            children: (
                <>
                    <SidebarNavLink href="/expenses0" icon={iconMap.post_add}>
                        Post Expenses
                    </SidebarNavLink>
                    <SidebarNavLink href="/expenses1" icon={iconMap.history}>
                        Expenses History
                    </SidebarNavLink>
                </>
            ),
        },
        {
            label: 'Human Resource',
            icon: faUsers, // More appropriate icon for HRM
            isOpen: sidebarState.humanresurces,
            toggleOpen: () => toggleSidebarSection('humanresurces'),
            children: (
                <>
                    <SidebarNavLink href="/humanresurces0" icon={iconMap.person}> {/* Updated icon */}
                        Employee Bio Data
                    </SidebarNavLink>
                    <SidebarNavLink href="/humanresurces1" icon={iconMap.upload}> {/* Updated icon */}
                        Import Employee Data
                    </SidebarNavLink>
                    <SidebarNavLink href="/humanresurces2" icon={iconMap.person_outline}> {/* Updated icon */}
                        Termination
                    </SidebarNavLink>
                    <SidebarNavLink href="/humanresurces3" icon={iconMap.payroll}> {/* Updated icon */}
                        Payroll
                    </SidebarNavLink>
                </>
            ),
        },

        {
            label: 'Financial Accounting',
            icon: iconMap.financial_accounting,  // Use the distinct icon
            isOpen: sidebarState.accounting,
            toggleOpen: () => toggleSidebarSection('accounting'),
            children: (
                <>
                    <SidebarNavLink href="/accounting0" icon={iconMap.general_ledger}>
                        General Ledger
                    </SidebarNavLink>
                    <SidebarNavLink href="/accounting1" icon={iconMap.profit_loss}>
                        Profit & Loss Statements
                    </SidebarNavLink>
                </>
            ),
        },
        {
            label: 'Reporting/Analytics',
            icon: iconMap.reporting_analytics,  // Use the distinct icon
            isOpen: sidebarState.reporting,
            toggleOpen: () => toggleSidebarSection('reporting'),
            children: (
                <>
                    <SidebarNavLink href="/reportingAnalytics0" icon={iconMap.loan_reports}>
                        Loan Portfolio Reports
                    </SidebarNavLink>
                    <SidebarNavLink href="/reportingAnalytics1" icon={iconMap.client_reports}>
                        Client Activity Reports
                    </SidebarNavLink>
                    <SidebarNavLink href="/reportingAnalytics2" icon={iconMap.financial_analytics}>
                        Financial Performance Analytics
                    </SidebarNavLink>
                </>
            ),
        },
        {
            label: 'System Configuration',
            icon: iconMap.system_config,
            isOpen: sidebarState.systemConfig,
            toggleOpen: () => toggleSidebarSection('systemConfig'),
            children: (
                <>
                    <SidebarNavLink href="/systemconfiguration0" icon={iconMap.loan_setup}>Loan Setup</SidebarNavLink>
                    <SidebarNavLink href="/systemconfiguration1" icon={iconMap.expenses_setup}>Expenses Setup</SidebarNavLink>
                    <SidebarNavLink href="/systemconfiguration2" icon={iconMap.manage_accounts}>  
                        Human Resource Setup
                    </SidebarNavLink>
                    <SidebarNavLink href="/systemconfiguration3" icon={iconMap.financial_accounting}>  
                        Accounting Setup
                    </SidebarNavLink>
                    <SidebarNavLink href="/systemconfiguration4" icon={iconMap.location_setup}>Location Setup</SidebarNavLink>
                    <SidebarNavLink href="/systemconfiguration5" icon={iconMap.facility_setup}>Facility Setup</SidebarNavLink>
                </>
            ),
        },
        {
            label: 'User Management',
            icon: iconMap.manage_accounts,
            isOpen: sidebarState.userManagement,
            toggleOpen: () => toggleSidebarSection('userManagement'),
            href: "/usermanagement",
        },
        {
            label: 'Security',
            icon: iconMap.security_settings,
            isOpen: sidebarState.security,
            toggleOpen: () => toggleSidebarSection('security'),
            href: "/security",
        },
    ];

    return (
        <div className="min-h-screen flex bg-gray-100">
            {/* Sidebar */}
            <div
                className={`sidebar transition-all duration-300 ease-in-out ${sidebarVisible ? 'block' : 'hidden'} sm:block bg-gray-800 text-white border-r border-gray-700 overflow-y-auto`}
                style={{ maxHeight: '100vh' }}
            >
                <div className="flex items-center justify-center p-4">
                    <Link href="/">
                        <div className="flex items-center">
                            <img
                                src="/img/logobw.png"
                                alt="Application Logo"
                                className="w-8 h-8 mr-2"
                            />
                            <h1 className="text-xl font-bold">HeriPesa</h1>
                        </div>
                    </Link>
                </div>

                <nav className="mt-6">
                    <ul className="nav">
                        {sidebarMenuItems.map((item) => (
                            <SidebarItem
                                key={item.label}
                                icon={item.icon}
                                label={item.label}
                                isOpen={item.isOpen}
                                toggleOpen={item.toggleOpen}
                                children={item.children}
                                href={item.href}
                            />
                        ))}
                    </ul>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden"> {/* Changed to h-screen and overflow-hidden for container*/}
                <nav className="border-b border-gray-200 bg-white">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 justify-between">
                            <div className="flex items-center">
                                <MenuButton onClick={() => setSidebarVisible(!sidebarVisible)} className="sm:hidden">
                                    <FontAwesomeIcon icon={faBars} className="h-6 w-6" />
                                </MenuButton>

                                {header && (
                                    <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                        {header}
                                    </div>
                                )}
                            </div>

                            <div className="hidden sm:ms-6 sm:flex sm:items-center">
                                <div className="relative ms-3">
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <span className="inline-flex rounded-md">
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                                                >
                                                    {user.name}
                                                    <svg
                                                        className="-me-0.5 ms-2 h-4 w-4"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </button>
                                            </span>
                                        </Dropdown.Trigger>

                                        <Dropdown.Content>
                                            <Dropdown.Link href={route('profile.edit')}>
                                                <FontAwesomeIcon icon={faUser} className="mr-2" /> Profile
                                            </Dropdown.Link>
                                            <Dropdown.Link
                                                href={route('logout')}
                                                method="post"
                                                as="button"
                                            >
                                                <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" /> Log Out
                                            </Dropdown.Link>
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>
                            </div>

                            <div className="-me-2 flex items-center sm:hidden">
                                <MenuButton
                                    onClick={() =>
                                        setShowingNavigationDropdown(
                                            (previousState) => !previousState
                                        )
                                    }
                                >
                                    <FontAwesomeIcon icon={showingNavigationDropdown ? faTimes : faBars} className="h-6 w-6" />
                                </MenuButton>
                            </div>
                        </div>
                    </div>

                    <div
                        className={`${showingNavigationDropdown ? 'block' : 'hidden'} sm:hidden`}
                    >
                        <div className="border-t border-gray-200 pb-1 pt-4">
                            <div className="px-4">
                                <div className="text-base font-medium text-gray-800">
                                    {user.name}
                                </div>
                                <div className="text-sm font-medium text-gray-500">
                                    {user.email}
                                </div>
                            </div>

                            <div className="mt-3 space-y-1">
                                <SidebarNavLink href={route('profile.edit')}>
                                    <FontAwesomeIcon icon={faUser} className="mr-2" /> Profile
                                </SidebarNavLink>
                                <SidebarNavLink
                                    method="post"
                                    href={route('logout')}
                                    as="button"
                                >
                                    <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" /> Log Out
                                </SidebarNavLink>
                            </div>
                        </div>
                    </div>
                </nav>

                <main className="flex-1 h-full overflow-y-auto"> {/* Changed to h-full and overflow-y-auto for content area */}
                    <div className="p-4 h-full">
                        {children}
                    </div>
                </main>        
                
            </div>
        </div>
    );
}