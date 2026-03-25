import React from 'react';
const PushButton: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <line x1="0" y1="50" x2="30" y2="50" />
    <line x1="70" y1="50" x2="100" y2="50" />
    <circle cx="30" cy="50" r="5" fill="currentColor" stroke="none" />
    <circle cx="70" cy="50" r="5" fill="currentColor" stroke="none" />
    <line x1="30" y1="50" x2="70" y2="50" />
    <line x1="50" y1="50" x2="50" y2="30" />
    <line x1="40" y1="30" x2="60" y2="30" />
  </svg>
);
export default PushButton;