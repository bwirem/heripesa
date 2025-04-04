// resources/js/Components/FlashBanner.jsx
import React from "react";

export default function FlashBanner({ flash }) {
    if (!flash) return null;

    const message = flash.success || flash.info || flash.error;
    const type = flash.success
        ? "success"
        : flash.info
        ? "info"
        : flash.error
        ? "error"
        : null;

    if (!message) return null;

    const bgColor = {
        success: "bg-green-100 text-green-800",
        info: "bg-blue-100 text-blue-800",
        error: "bg-red-100 text-red-800",
    };

    return (
        <div className={`p-3 mb-4 rounded ${bgColor[type]}`}>
            <p className="text-sm">{message}</p>
        </div>
    );
}
