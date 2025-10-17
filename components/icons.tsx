
import React from 'react';

export const UploadIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className || "w-12 h-12 text-gray-400"}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM21 21H3"
    />
  </svg>
);

export const MeterIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m-9-9h18" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 21a2.25 2.25 0 01-2.25-2.25V5.25a2.25 2.25 0 012.25-2.25h4.5a2.25 2.25 0 012.25 2.25v13.5a2.25 2.25 0 01-2.25 2.25h-4.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9h7.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 12h7.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15h7.5" />
    </svg>
);
