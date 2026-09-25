
import React from 'react';
const FlowControlValve: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    {/* Orifice */}
    <path d="M35 50 C 45 35, 55 65, 65 50" />
    {/* Adjustability Arrow */}
    <path d="M30 70 L 70 30" strokeWidth="2" />
    <path d="M60 25 L 70 30 L 65 40" />
    {/* Pressure Compensation Arrow */}
    <path d="M50 20 V 10 L 45 15 M 50 10 L 55 15" strokeWidth="2"/>
  </svg>
);
export default FlowControlValve;
