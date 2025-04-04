import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Index({ auth, revenues = [], expenses = [] }) {
    const totalRevenue = revenues.reduce((sum, r) => sum + Number(r.total), 0);
    const totalExpense = expenses.reduce((sum, e) => sum + Number(e.total), 0);
    const netProfit = totalRevenue - totalExpense;

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800">Profit & Loss</h2>}>
            <Head title="Profit and Loss" />
            <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
                {/* Revenue Section */}
                <h3 className="text-lg font-bold text-green-700 mb-2">Revenues</h3>
                <table className="w-full mb-6">
                    <tbody>
                        {revenues.map((rev, index) => (
                            <tr key={index}>
                                <td className="py-1 text-gray-700">{rev.account_name}</td>
                                <td className="py-1 text-right text-green-700 font-medium">{Number(rev.total).toFixed(2)}</td>
                            </tr>
                        ))}
                        <tr className="font-bold border-t">
                            <td>Total Revenue</td>
                            <td className="text-right text-green-800">{totalRevenue.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>

                {/* Expense Section */}
                <h3 className="text-lg font-bold text-red-700 mb-2">Expenses</h3>
                <table className="w-full mb-6">
                    <tbody>
                        {expenses.map((exp, index) => (
                            <tr key={index}>
                                <td className="py-1 text-gray-700">{exp.account_name}</td>
                                <td className="py-1 text-right text-red-700 font-medium">{Number(exp.total).toFixed(2)}</td>
                            </tr>
                        ))}
                        <tr className="font-bold border-t">
                            <td>Total Expenses</td>
                            <td className="text-right text-red-800">{totalExpense.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>

                {/* Net Profit */}
                <div className={`text-xl font-bold text-right ${netProfit >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                    Net {netProfit >= 0 ? 'Profit' : 'Loss'}: {netProfit.toFixed(2)}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
