
import React from 'react';

interface PumpProps extends React.SVGProps<SVGSVGElement> {
    isPumpActive?: boolean;
}

const HydraulicPump: React.FC<PumpProps> = ({ isPumpActive, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    stroke="currentColor"
    fill="none"
    strokeWidth="3"
    {...props}
  >
    <circle cx="50" cy="50" r="30" />
    <path d="M50 20 L50 30" />
    <g className={isPumpActive ? 'pump-active' : ''}>
        <path d="M50 50 L 65 50 L 50 80 z" fill="currentColor" />
    </g>
  </svg>
);
export default HydraulicPump;