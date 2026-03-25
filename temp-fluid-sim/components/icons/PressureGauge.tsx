
import React from 'react';
const PressureGauge: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    stroke="currentColor"
    fill="none"
    strokeWidth="3"
    strokeLinecap="round"
    {...props}
  >
    <circle cx="50" cy="50" r="30" />
    <path d="M50 80 v -10" />
    <path d="M50 50 L 30 40" strokeWidth="2" />
  </svg>
);
export default PressureGauge;
