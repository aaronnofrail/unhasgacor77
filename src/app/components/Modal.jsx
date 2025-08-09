"use client";
import React from "react";
import { CloseCircle } from "iconsax-react";

const Modal = ({ show, title, message, icon, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-[95%] max-w-sm text-center relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute text-gray-500 transition top-3 right-3 hover:text-gray-700"
        >
          <CloseCircle size="28" color="#333" />
        </button>

        {icon && (
          <div className="flex items-center justify-center w-full mb-4">
            {icon}
          </div>
        )}

        {title && <h3 className="mb-2 text-lg font-bold">{title}</h3>}

        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
};

export default Modal;
