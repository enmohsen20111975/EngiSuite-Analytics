
import React from 'react';
const PressureReliefValve: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    stroke="currentColor"
    fill="none"
    strokeWidth="3"
    strokeLinecap="round"
    {...props}
  >
    <rect x="20" y="20" width="60" height="60" rx="5" />
    {/* Arrow */}
    <path d="M50 20 L 50 35 L 35 35" />
    <path d="M40 30 L 35 35 L 40 40" />
    {/* Spring */}
    <path d="M65 30 L 60 35 L 70 45 L 60 55 L 70 65 L 65 70" />
    {/* Pilot Line */}
    <path d="M50 80 L 50 85 L 30 85 L 30 50" strokeDasharray="4 4" />
  </svg>
);
export default PressureReliefValve;
