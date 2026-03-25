
import React from 'react';
const CheckValve: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <circle cx="40" cy="50" r="10"/>
    <path d="M60 30 L 40 50 L 60 70" />
    <path d="M20 50 H 40" />
    <path d="M60 50 H 80" />
  </svg>
);
export default CheckValve;
