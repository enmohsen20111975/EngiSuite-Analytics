
import React from 'react';
const Joystick: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M20 85 h 60 a 10 10 0 0 0 0 -20 h -60 a 10 10 0 0 0 0 20 Z" fill="currentColor" stroke="none" />
    <circle cx="50" cy="65" r="15" strokeWidth="2" />
    <line x1="50" y1="65" x2="50" y2="25" />
    <circle cx="50" cy="20" r="10" fill="currentColor" stroke="none" />
  </svg>
);
export default Joystick;
