import React from 'react';
const Lamp: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <circle cx="50" cy="50" r="25" />
    <line x1="35" y1="35" x2="65" y2="65" />
    <line x1="65" y1="35" x2="35" y2="65" />
    <line x1="30" y1="100" x2="30" y2="75" />
    <line x1="70" y1="100" x2="70" y2="75" />
  </svg>
);
export default Lamp;