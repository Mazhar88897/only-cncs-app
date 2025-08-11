import React from "react";
import { X } from "lucide-react"; // Assuming you have lucide-react installed

interface WarningModalProps {
  open: boolean;
  onClose: () => void;
  onProceed: () => void; // Function to call when Proceed is clicked
  message: string;
  title: string;
}

export default function WarningModal({
  open,
  onClose,
  onProceed,
  message,
  title,
}: WarningModalProps) {
  if (!open) return null;

  const handleProceedClick = () => {
    onProceed(); // Call the parent's onProceed handler
    onClose(); // Close this modal
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center mt-6 m-4">
      <div className="bg-[#004851] border-4 border-[#03BFB5] rounded-lg p-6 w-full max-w-sm relative text-white text-center ">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300"
        >
          <X size={24} />
        </button>
        <h2 className="text-[#03BFB5] text-xl font-bold mb-4">{title}</h2>
        <p className="text-white text-lg mb-8 font-bold">{message}</p>
        <button
          onClick={handleProceedClick}
          className="w-full bg-[#03BFB5] text-[#004851] font-bold py-2 rounded-sm hover:bg-[#03BFB5]/80 transition-colors"
        >
          Proceed
        </button>
      </div>
    </div>
  );
}
