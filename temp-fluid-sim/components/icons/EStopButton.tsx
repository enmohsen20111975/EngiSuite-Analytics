
import React from 'react';

interface EStopProps extends React.SVGProps<SVGSVGElement> {
    isPressed?: boolean;
}

const EStopButton: React.FC<EStopProps> = ({ isPressed, ...props }) => (
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
    <path d="M20 90 h60 v10 h-60Z" fill="currentColor" stroke="none" />
    <path d="M35 90 v-20" />
    <path d="M65 90 v-20" />
    <rect x="30" y="55" width="40" height="15" rx="2" fill="hsl(48 96% 50%)" stroke="hsl(48 96% 30%)" />
    <g transform={isPressed ? 'translateY(10)' : 'translateY(0)'} style={{transition: 'transform 0.1s ease-in-out'}}>
        <circle cx="50" cy="30" r="30" fill="hsl(0 84% 60%)" stroke="hsl(0 84% 40%)" strokeWidth="4" />
        <circle cx="50" cy="30" r="20" fill="hsl(0 84% 50%)" stroke="none" />
    </g>
  </svg>
);
export default EStopButton;
