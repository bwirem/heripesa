import React, { useEffect, useState } from "react";
import { Head, Link, useForm, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import "@fortawesome/fontawesome-svg-core/styles.css";

import Modal from '@/Components/CustomModal';

export default function Index({ auth, usergroups, modules, moduleitems, functionaccess, filters }) {
    const [modalState, setModalState] = useState({
        isOpen: false,
        message: '',
        isAlert: false,
    });

    const handleModalClose = () => {
        setModalState({ isOpen: false, message: '', isAlert: false });
    };

    const handleModalConfirm = async () => {
        setModalState({ isOpen: false, message: '', isAlert: false });
    };

    // Show alert modal
    const showAlert = (message) => {
        setModalState({
            isOpen: true,
            message: message,
            isAlert: true,
        });
    };

    const [selectedModule, setSelectedModule] = useState(null);

    // Initialize functionAccess state with the value from the backend
    const [functionAccess, setFunctionAccess] = useState(functionaccess); //Use the backend values as the initial value


    const handleModuleSelect = (moduleKey) => {
        setSelectedModule(moduleKey);
        // Reset function access when module changes using the backend values
        setFunctionAccess(functionaccess);
    };

    const handleFunctionAccessChange = (accessType) => {
        setFunctionAccess(prevState => ({
            ...prevState,
            [accessType]: !prevState[accessType]
        }));
    };

    const filteredModuleItems = selectedModule ? moduleitems[selectedModule] || [] : [];

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-gray-800">Permission</h2>}
        >
            <Head title="Permission" />
            <div className="container mx-auto p-4 flex space-x-4">

                {/* Usergroups Table */}
                <div className="flex-1 overflow-x-auto">
                    <table className="min-w-full border border-gray-300 shadow-md rounded">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="border-b p-3 text-center font-medium text-gray-700">Usergroups</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usergroups.data.length > 0 ? (
                                usergroups.data.map((usergroup, index) => (
                                    <tr key={usergroup.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                                        <td className="border-b p-3 text-gray-700">{usergroup.name ? usergroup.name : "n/a"}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="1" className="border-b p-3 text-center text-gray-700">No usergroups found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Modules Table */}
                <div className="flex-1 overflow-x-auto">
                    <table className="min-w-full border border-gray-300 shadow-md rounded">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="border-b p-3 text-center font-medium text-gray-700"></th>
                                <th className="border-b p-3 text-center font-medium text-gray-700">Modules</th>
                            </tr>
                        </thead>
                        <tbody>
                            {modules.map((module, index) => (
                                <tr
                                    key={index}
                                    className={index % 2 === 0 ? 'bg-gray-50' : ''}
                                    onClick={() => handleModuleSelect(module.modulekey)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <td className="border-b p-3 text-gray-700 text-center">
                                        <input type="checkbox" checked={selectedModule === module.modulekey} readOnly />
                                    </td>
                                    <td className="border-b p-3 text-gray-700">{module.moduletext ? module.moduletext : "n/a"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ModuleItems Table */}
                <div className="flex-1 overflow-x-auto">
                    <table className="min-w-full border border-gray-300 shadow-md rounded">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="border-b p-3 text-center font-medium text-gray-700"></th>
                                <th className="border-b p-3 text-center font-medium text-gray-700">Module Items</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredModuleItems.length > 0 ? (
                                filteredModuleItems.map((moduleitem, index) => (
                                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                                        <td className="border-b p-3 text-gray-700 text-center">
                                            <input type="checkbox" />
                                        </td>
                                        <td className="border-b p-3 text-gray-700">{moduleitem.text ? moduleitem.text : "n/a"}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="2" className="border-b p-3 text-center text-gray-700">
                                        {selectedModule ? "No module items found for this module." : "Select a module to view its items."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Function Access Table */}
                {selectedModule && (
                    <div className="flex-1 overflow-x-auto">
                        <table className="min-w-full border border-gray-300 shadow-md rounded">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="border-b p-3 text-center font-medium text-gray-700">Function Access</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border-b p-3 text-gray-700 text-center">
                                        <label>
                                            Create:
                                            <input
                                                type="checkbox"
                                                checked={functionAccess.create}
                                                onChange={() => handleFunctionAccessChange("create")}
                                            />
                                        </label>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-b p-3 text-gray-700 text-center">
                                        <label>
                                            Read:
                                            <input
                                                type="checkbox"
                                                checked={functionAccess.read}
                                                onChange={() => handleFunctionAccessChange("read")}
                                            />
                                        </label>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-b p-3 text-gray-700 text-center">
                                        <label>
                                            Update:
                                            <input
                                                type="checkbox"
                                                checked={functionAccess.update}
                                                onChange={() => handleFunctionAccessChange("update")}
                                            />
                                        </label>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border-b p-3 text-gray-700 text-center">
                                        <label>
                                            Delete:
                                            <input
                                                type="checkbox"
                                                checked={functionAccess.delete}
                                                onChange={() => handleFunctionAccessChange("delete")}
                                            />
                                        </label>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
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