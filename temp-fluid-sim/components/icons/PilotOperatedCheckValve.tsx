
import React from 'react';
const PilotOperatedCheckValve: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    {/* Check valve inside */}
    <circle cx="40" cy="50" r="8"/>
    <path d="M55 35 L 40 50 L 55 65" />
    {/* Pilot Line */}
    <path d="M50 80 V 90 H 30 V 55" strokeDasharray="4 4" />
  </svg>
);
export default PilotOperatedCheckValve;
