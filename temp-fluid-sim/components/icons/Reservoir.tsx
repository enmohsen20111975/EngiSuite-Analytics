
import React from 'react';
const Reservoir: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    stroke="currentColor"
    fill="none"
    strokeWidth="3"
    strokeLinecap="round"
    {...props}
  >
    <path d="M20 20 L 80 20" />
    <path d="M20 20 L 20 60 C 20 80, 80 80, 80 60 L 80 20" />
    <path d="M35 20 L 35 10" />
  </svg>
);
export default Reservoir;
