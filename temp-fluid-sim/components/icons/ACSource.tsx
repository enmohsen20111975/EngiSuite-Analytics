import React from 'react';
const ACSource: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    stroke="currentColor"
    fill="none"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="50" cy="50" r="30" />
    <path d="M38 62 Q 50 38, 62 62" />
    <line x1="20" y1="0" x2="35" y2="25" />
    <line x1="50" y1="0" x2="50" y2="20" />
    <line x1="80" y1="0" x2="65" y2="25" />
  </svg>
);
export default ACSource;