
import React from 'react';
const PressureReducingValve: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <rect x="20" y="20" width="60" height="60" rx="5" />
    {/* Arrow */}
    <path d="M35 20 L 35 80" />
    <path d="M25 70 L 35 80 L 45 70" />
    {/* Spring (opposing closing) */}
    <path d="M65 30 L 60 35 L 70 45 L 60 55 L 70 65 L 65 70" strokeWidth="2" />
    {/* Pilot line (downstream sense) */}
    <path d="M35 80 V 90 H 65 V 70" strokeDasharray="4 4" />
  </svg>
);
export default PressureReducingValve;
