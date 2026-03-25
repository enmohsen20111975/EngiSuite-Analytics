import React from 'react';
const Resistor: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M0 50 H 20 L 28 65 L 44 35 L 56 65 L 72 35 L 80 50 H 100" />
  </svg>
);
export default Resistor;