
import React from 'react';
const DirectionalControlValve: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    stroke="currentColor"
    fill="none"
    strokeWidth="2"
    strokeLinecap="round"
    {...props}
  >
    {/* 3 boxes */}
    <rect x="5" y="30" width="30" height="40" />
    <rect x="35" y="30" width="30" height="40" />
    <rect x="65" y="30" width="30" height="40" />
    {/* Center Box Content (Tandem) */}
    <path d="M40 30 v 40" />
    <path d="M60 30 v 40" />
    <path d="M40 50 h 20" />
    {/* Left Box Content (Cross) */}
    <path d="M10 30 l 20 40" />
    <path d="M30 30 l -20 40" />
    {/* Right Box Content (Parallel) */}
    <path d="M70 30 v 40" />
    <path d="M90 30 v 40" />
    {/* Ports */}
    <path d="M50 25 v 5 M50 70 v 5" />
    <path d="M40 25 v 5 M40 70 v 5" />
    <path d="M60 25 v 5 M60 70 v 5" />
  </svg>
);
export default DirectionalControlValve;
