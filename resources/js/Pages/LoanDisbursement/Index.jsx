import React, { useEffect, useState } from "react";
import { Head, Link, useForm, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faEdit } from "@fortawesome/free-solid-svg-icons";
import "@fortawesome/fontawesome-svg-core/styles.css";

export default function Index({ auth, loans, filters }) {
  const { data, setData, get, errors } = useForm({
    search: filters.search || "",
    stage: filters.stage || "6",
  });
  
  useEffect(() => {
    get(route("loan2.index"), { preserveState: true });
  }, [data.search, data.stage]); // Remove `get` from dependencies

  const handleSearchChange = (e) => {
    setData("search", e.target.value);
  };

  const handleStageChange = (stage) => {
    setData("stage", stage);
    get(route("loan2.index"), { preserveState: true }); // Manually fetch updated loans
  };

  const renderStageLabel = (stage) => {
    switch (stage) {     
      case 6:
        return "Pending";
      case 7:
        return "Disbursed";
      case 8:
        return "Rejected";
      default:
        return "Unknown";
    }
  };

  return (
    <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Disbursement List</h2>}>
      <Head title="Disbursement List" />
      <div className="container mx-auto p-4">
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="relative flex items-center">
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 text-gray-500" />
              <input
                type="text"
                name="search"
                placeholder="Search by customer name"
                value={data.search}
                onChange={handleSearchChange}
                className={`pl-10 border px-2 py-1 rounded text-sm ${errors.search ? "border-red-500" : ""}`}
              />
            </div>
          </div>

          <ul className="flex space-x-2 mt-2">
           
            <li
              key="pending"
              className={`cursor-pointer px-2 py-1 rounded text-sm flex items-center ${
                data.stage === "6" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
              }`}
              onClick={() => handleStageChange("6")}
            >
              Pending
            </li>            

            <li
              key="disbursed"
              className={`cursor-pointer px-2 py-1 rounded text-sm flex items-center ${
                data.stage === "7" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
              }`}
              onClick={() => handleStageChange("7")}
            >
              Disbursed
            </li>
           
            <li
              key="rejected"
              className={`cursor-pointer px-2 py-1 rounded text-sm flex items-center ${
                data.stage === "8" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
              }`}
              onClick={() => handleStageChange("8")}
            >
              Rejected
            </li>

            <li
              className={`cursor-pointer px-2 py-1 rounded text-sm flex items-center ${
                data.stage === "" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
              }`}
              onClick={() => handleStageChange("")}
            >
              All
            </li>
          </ul>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 shadow-md rounded">
            <thead className="bg-gray-50">
              <tr>
                <th className="border-b p-3 text-left font-medium text-gray-700">Customer Name</th>
                <th className="border-b p-3 text-left font-medium text-gray-700">Loan Amount</th>
                <th className="border-b p-3 text-left font-medium text-gray-700">Interest Rate</th>
                <th className="border-b p-3 text-left font-medium text-gray-700">Total</th>
                <th className="border-b p-3 text-center font-medium text-gray-700">Stage</th>
                <th className="border-b p-3 text-center font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loans.data
                .filter((loan) => {
                  if (!data.stage || data.stage === "") return true;
                  const selectedStages = data.stage.split(",").map(Number);
                  return selectedStages.includes(Number(loan.stage)); // Ensure correct type comparison
                })
                .map((loan, index) => (
                  <tr key={loan.id} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                    <td className="border-b p-3 text-gray-700">{loan.first_name || loan.company_name}</td>
                    <td className="border-b p-3 text-gray-700 text-right">
                      {parseFloat(loan.loan_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="border-b p-3 text-gray-700 text-right">
                      {parseFloat(loan.interest_rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="border-b p-3 text-gray-700 text-right">
                      {parseFloat(loan.total_repayment).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="border-b p-3 text-center text-gray-700">{renderStageLabel(loan.stage)}</td>
                    <td className="border-b p-3 flex space-x-2 justify-center">
                      <Link href={route("loan2.edit", loan.id)} className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs flex items-center">
                        <FontAwesomeIcon icon={faEdit} className="mr-1" />
                         Disburse
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
