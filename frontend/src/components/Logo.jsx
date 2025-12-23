import React from 'react';

const Logo = ({ size = 48, className = "" }) => {
    return (
        <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
            <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full drop-shadow-2xl"
            >
                <circle cx="50" cy="50" r="45" className="stroke-emerald-500/10 stroke-[0.5] animate-[spin_10s_linear_infinite]" />
                <rect x="25" y="25" width="50" height="50" rx="12" className="stroke-slate-950 stroke-[3] fill-white" />
                <circle cx="25" cy="25" r="4" className="fill-slate-950" />
                <circle cx="75" cy="75" r="4" className="fill-slate-950" />
                <g className="animate-pulse">
                    <path
                        d="M50 35C50 35 35 45 35 55C35 63.2843 41.7157 70 50 70C58.2843 70 65 63.2843 65 55C65 45 50 35 50 35Z"
                        className="fill-emerald-500"
                    />
                    <path
                        d="M50 35V70"
                        className="stroke-white/20 stroke-[1.5]"
                    />
                </g>
                <line x1="25" y1="25" x2="75" y2="75" className="stroke-emerald-500/20 stroke-[8] blur-xl animate-pulse" />
            </svg>
        </div>
    );
};

export default Logo;
