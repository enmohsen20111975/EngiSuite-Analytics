import React from 'react';
const DCSource: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <circle cx="50" cy="50" r="25" />
    <line x1="50" y1="25" x2="50" y2="0" />
    <line x1="50" y1="75" x2="50" y2="100" />
    <line x1="35" y1="38" x2="65" y2="38" />
    <line x1="50" y1="32" x2="50" y2="44" />
    <line x1="35" y1="62" x2="65" y2="62" />
  </svg>
);
export default DCSource;