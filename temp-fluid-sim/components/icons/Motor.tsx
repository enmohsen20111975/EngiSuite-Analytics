import React from 'react';
const Motor: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <line x1="30" y1="0" x2="30" y2="22" />
    <line x1="50" y1="0" x2="50" y2="20" />
    <line x1="70" y1="0" x2="70" y2="22" />
    <text x="45" y="60" stroke="none" fill="currentColor" fontSize="24" textAnchor="middle">M</text>
  </svg>
);
export default Motor;