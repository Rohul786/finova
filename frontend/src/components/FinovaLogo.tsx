import React from 'react';

interface FinovaLogoProps {
  size?: number | string;
  className?: string;
  showText?: boolean;
  withBackground?: boolean;
}

export const FinovaLogo: React.FC<FinovaLogoProps> = ({
  size = 36,
  className = '',
  showText = false,
  withBackground = true,
}) => {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={pixelSize}
        height={pixelSize}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200"
      >
        <defs>
          {/* Background Gradient */}
          <linearGradient id="finovaBgGrad" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="45%" stopColor="#0B0F19" />
            <stop offset="100%" stopColor="#1E1338" />
          </linearGradient>

          {/* Background Glow */}
          <radialGradient id="finovaGlow" cx="80%" cy="20%" r="70%">
            <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
          </radialGradient>

          {/* Leaf Gradient */}
          <linearGradient id="finovaLeafGrad" x1="90" y1="170" x2="160" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="40%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>

          {/* F Body Gradient */}
          <linearGradient id="finovaFGrad" x1="40" y1="40" x2="140" y2="170" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>

          {/* F Ribbon Shadow / Fold Gradient */}
          <linearGradient id="finovaFoldGrad" x1="45" y1="85" x2="80" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.1" />
          </linearGradient>

          {/* Rupee Coin Outer Disc */}
          <linearGradient id="coinGrad" x1="110" y1="110" x2="170" y2="175" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          {/* Coin Inner Glow */}
          <radialGradient id="coinInnerGlow" cx="138" cy="142" r="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="70%" stopColor="#059669" />
            <stop offset="100%" stopColor="#065F46" />
          </radialGradient>

          {/* Drop Shadows */}
          <filter id="finovaShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.4" />
          </filter>

          <filter id="coinGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#10B981" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* 1. Rounded App Container Badge */}
        {withBackground && (
          <>
            <rect width="200" height="200" rx="46" fill="url(#finovaBgGrad)" />
            <rect width="200" height="200" rx="46" fill="url(#finovaGlow)" />
            <rect
              x="1.5"
              y="1.5"
              width="197"
              height="197"
              rx="44.5"
              stroke="#374151"
              strokeOpacity="0.4"
              strokeWidth="2"
            />
          </>
        )}

        {/* 2. Green Leaf Swoosh rising behind the F bar */}
        <g filter="url(#finovaShadow)">
          <path
            d="M 88 168 C 85 140, 95 105, 122 75 C 135 60, 148 48, 155 42 C 156 58, 150 85, 138 108 C 124 135, 105 158, 88 168 Z"
            fill="url(#finovaLeafGrad)"
          />
        </g>

        {/* 3. The Stylized 'F' Iconography */}
        <g filter="url(#finovaShadow)">
          {/* Top Curved Bar and Vertical Stem */}
          <path
            d="M 75 42 C 105 42, 138 42, 142 42 C 142 54, 132 68, 114 68 C 88 68, 65 68, 55 76 C 45 84, 42 98, 42 120 L 42 165 C 42 169, 38 172, 34 172 L 40 172 C 55 172, 68 160, 68 145 L 68 112 C 68 102, 72 96, 82 92 L 115 84 C 118 83, 120 80, 120 76 L 120 68 C 120 54, 108 42, 75 42 Z"
            fill="url(#finovaFGrad)"
          />

          {/* Smooth Main 'F' Spine with Curved Ribbon Header */}
          <path
            d="M 78 42 C 110 42, 135 42, 140 42 C 144 42, 142 56, 130 66 C 118 76, 92 84, 76 84 C 68 84, 68 96, 68 108 L 68 152 C 68 162, 58 170, 48 170 C 43 170, 40 164, 40 156 L 40 98 C 40 68, 54 42, 78 42 Z"
            fill="#FFFFFF"
          />

          {/* 3D Fold Shading inside 'F' */}
          <path
            d="M 40 98 C 40 68, 54 42, 78 42 C 92 42, 112 42, 130 46 C 105 52, 72 64, 55 92 C 48 104, 44 118, 42 135 C 40 120, 40 108, 40 98 Z"
            fill="url(#finovaFoldGrad)"
          />

          {/* Middle Horizontal Bar of 'F' */}
          <path
            d="M 64 88 C 76 88, 102 84, 115 84 C 119 84, 120 88, 116 92 C 105 102, 85 110, 68 112 L 64 88 Z"
            fill="#F1F5F9"
          />
        </g>

        {/* 4. Glowing Indian Rupee (₹) Coin Medallion */}
        <g filter="url(#coinGlowFilter)">
          {/* Outer Border Ring */}
          <circle cx="138" cy="148" r="30" fill="#047857" />
          <circle cx="138" cy="148" r="28" fill="url(#coinInnerGlow)" stroke="#6EE7B7" strokeWidth="2.5" />
          <circle cx="138" cy="148" r="23" stroke="#A7F3D0" strokeOpacity="0.4" strokeWidth="1" fill="none" />

          {/* Rupee Symbol (₹) */}
          <text
            x="138"
            y="157"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="26"
            fontWeight="900"
            fill="#FFFFFF"
            textAnchor="middle"
            filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.3))"
          >
            ₹
          </text>
        </g>
      </svg>

      {showText && (
        <span className="flex flex-col">
          <span className="font-black text-sm tracking-tight text-zinc-100 uppercase">
            FINOVA
          </span>
          <span className="text-[10px] font-semibold text-emerald-400 -mt-1 tracking-wider uppercase">
            FINANCE
          </span>
        </span>
      )}
    </span>
  );
};
