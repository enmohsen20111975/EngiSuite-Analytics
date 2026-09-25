
import React from 'react';
const FootPedal: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M10 80 h 80 v 10 h -80 z" />
    <path d="M20 80 L 30 50 H 80 L 90 80" />
    <circle cx="25" cy="80" r="5" fill="currentColor" />
  </svg>
);
export default FootPedal;
