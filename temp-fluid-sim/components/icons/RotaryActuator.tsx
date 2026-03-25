
import React from 'react';
const RotaryActuator: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M30 70 A 40 40 0 0 1 70 70 Z" />
    <circle cx="50" cy="70" r="5" fill="currentColor" />
    <path d="M50 70 L 50 40" />
    <path d="M40 45 L 50 40 L 60 45" />
  </svg>
);
export default RotaryActuator;
