
import React from 'react';
const DoubleActingCylinder: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    stroke="currentColor"
    fill="none"
    strokeWidth="3"
    strokeLinecap="round"
    {...props}
  >
    {/* Barrel */}
    <path d="M10 35 h 60 v 30 h -60 Z" />
    {/* Piston */}
    <path d="M30 35 v 30" />
    {/* Rod */}
    <path d="M30 50 h 60" strokeWidth="2" />
    {/* Ports */}
    <path d="M15 35 v -10" />
    <path d="M65 35 v -10" />
  </svg>
);
export default DoubleActingCylinder;
