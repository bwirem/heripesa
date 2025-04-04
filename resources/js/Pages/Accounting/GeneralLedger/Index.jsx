import React from "react";
import { Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import dayjs from 'dayjs';

export default function GeneralLedger({ auth, entries }) {
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-gray-800">General Ledger</h2>}
        >
            <Head title="General Ledger" />

            <div className="container mx-auto p-4">
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300 shadow-md rounded">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-3 border-b text-left">Date</th>
                                <th className="p-3 border-b text-left">Reference</th>
                                <th className="p-3 border-b text-left">Description</th>
                                <th className="p-3 border-b text-left">Account</th>
                                <th className="p-3 border-b text-right">Debit</th>
                                <th className="p-3 border-b text-right">Credit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map((entry) => (
                                <React.Fragment key={entry.id}>
                                <tr className="bg-gray-100 font-semibold">
                                    <td className="p-3 border-b">{dayjs(entry.entry_date).format("MMMM D, YYYY")}</td>
                                    <td className="p-3 border-b" colSpan="3">{entry.description}</td>
                                </tr>
                                {entry.journal_entry_lines.map((line) => (
                                    <tr key={line.id}>
                                    <td className="p-3 border-b pl-6">
                                        {line.chart_of_account?.account_name || 'Unknown Account'}
                                    </td>
                                    <td className="p-3 border-b text-right">
                                        {Number(line.debit) > 0 ? Number(line.debit).toFixed(2) : ''}
                                    </td>
                                    <td className="p-3 border-b text-right">
                                        {Number(line.credit) > 0 ? Number(line.credit).toFixed(2) : ''}
                                    </td>
                                    <td className="p-3 border-b text-gray-500 text-sm">
                                        Ref: {entry.reference_number}
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
