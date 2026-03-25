import React from 'react';
const ContactNO: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <line x1="30" y1="35" x2="30" y2="65" />
    <line x1="70" y1="35" x2="70" y2="65" />
  </svg>
);
export default ContactNO;