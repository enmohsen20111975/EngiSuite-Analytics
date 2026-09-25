import React from 'react';
const RelayCoil: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <line x1="50" y1="0" x2="50" y2="20" />
    <line x1="50" y1="80" x2="50" y2="100" />
    <rect x="25" y="20" width="50" height="60" />
  </svg>
);
export default RelayCoil;