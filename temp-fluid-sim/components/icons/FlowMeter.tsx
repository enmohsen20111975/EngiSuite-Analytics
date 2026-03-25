
import React from 'react';
const FlowMeter: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M20 50 h 60" />
    <path d="M30 40 l -10 10 l 10 10" />
    <path d="M50 30 C 50 10, 80 10, 80 30 S 50 50, 50 30 Z" fill="currentColor" />
  </svg>
);
export default FlowMeter;
