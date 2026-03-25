
import React from 'react';
const ConnectionTee: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    stroke="currentColor"
    fill="currentColor"
    {...props}
  >
    <circle cx="50" cy="50" r="5" />
    <path d="M50 10 V 50 H 10" strokeWidth="3" fill="none" />
    <path d="M50 50 H 90" strokeWidth="3" fill="none" />
  </svg>
);
export default ConnectionTee;
