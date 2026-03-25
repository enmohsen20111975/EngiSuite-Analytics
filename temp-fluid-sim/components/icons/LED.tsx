import React from 'react';
const LED: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    {/* Diode body */}
    <line x1="50" y1="0" x2="50" y2="40" />
    <path d="M25 40 L 50 65 L 75 40 Z" fill="currentColor" />
    <line x1="25" y1="65" x2="75" y2="65" />
    <line x1="50" y1="65" x2="50" y2="100" />
    {/* Arrows for light */}
    <line x1="20" y1="20" x2="35" y2="5" />
    <polyline points="25,5 35,5 35,15" />
    <line x1="10" y1="40" x2="25" y2="25" />
    <polyline points="15,25 25,25 25,35" />
  </svg>
);
export default LED;