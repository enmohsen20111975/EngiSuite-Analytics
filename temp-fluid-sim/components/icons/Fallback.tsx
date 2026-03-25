
import React from 'react';
const Fallback: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    stroke="currentColor"
    fill="none"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="10" y="10" width="80" height="80" rx="5" />
    <line x1="10" y1="10" x2="90" y2="90" />
    <line x1="90" y1="10" x2="10" y2="90" />
    <circle cx="50" cy="50" r="10" fill="currentColor" stroke="none"/>
  </svg>
);
export default Fallback;
