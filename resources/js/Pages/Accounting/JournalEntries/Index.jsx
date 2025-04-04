import React, { useEffect, useState } from "react";
import { Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChevronDown, faChevronUp, faPlus, faHome
} from "@fortawesome/free-solid-svg-icons";
import dayjs from 'dayjs';


export default function Index({ auth, journalEntries }) {
    const [expandedEntries, setExpandedEntries] = useState({});

    const toggleEntry = (id) => {
        setExpandedEntries((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Journal Entries</h2>}>
            <Head title="Journal Entries" />

            <div className="container mx-auto p-4">
                {/* Actions */}
                <div className="flex justify-between items-center mb-4">
                    <Link
                        href={route("accounting0.create")}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm flex items-center"
                    >
                        <FontAwesomeIcon icon={faPlus} className="mr-1" /> Create Entry
                    </Link>
                    <Link
                        href={route("dashboard")}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm flex items-center"
                    >
                        <FontAwesomeIcon icon={faHome} className="mr-1" /> Home
                    </Link>
                </div>

                {/* Journal Entries */}
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300 shadow-md rounded">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-3 border-b">Date</th>
                                <th className="p-3 border-b">Reference</th>
                                <th className="p-3 border-b">Description</th>
                                <th className="p-3 border-b text-center">Lines</th>
                            </tr>
                        </thead>
                        <tbody>
                            {journalEntries.map((entry) => (
                                <React.Fragment key={entry.id}>
                                    <tr className="bg-white hover:bg-gray-50">
                                        <td className="p-3 border-b">
                                            {dayjs(entry.entry_date).format("MMMM D, YYYY")}
                                        </td>
                                        <td className="p-3 border-b">{entry.reference_number}</td>
                                        <td className="p-3 border-b">{entry.description}</td>
                                        <td className="p-3 border-b text-center">
                                            <button onClick={() => toggleEntry(entry.id)}>
                                                <FontAwesomeIcon icon={expandedEntries[entry.id] ? faChevronUp : faChevronDown} />
                                            </button>
                                        </td>
                                    </tr>

                                    {expandedEntries[entry.id] && entry.journal_entry_lines.map((line) => (
                                        <tr key={line.id} className="bg-gray-50 text-sm">
                                            <td colSpan="2" className="p-3 pl-8 border-b text-gray-700">
                                                <strong>Account:</strong> {line.chart_of_account?.account_name || 'N/A'}
                                            </td>
                                            <td className="p-3 border-b text-right">
                                                <strong>Debit:</strong> {line.debit}
                                            </td>
                                            <td className="p-3 border-b text-right">
                                                <strong>Credit:</strong> {line.credit}
                                            </td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
