import React from 'react';
const Contactor: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <line x1="50" y1="0" x2="50" y2="25" />
    <line x1="50" y1="75" x2="50" y2="100" />
    <path d="M25 25 A 25 25 0 0 1 75 25" />
    <path d="M25 75 A 25 25 0 0 0 75 75" />
  </svg>
);
export default Contactor;