import React from 'react';

interface NovaLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export const NovaLogo: React.FC<NovaLogoProps> = ({
  size = 'md',
  showSubtitle = false,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const titleSizes = {
    sm: 'text-sm font-semibold tracking-[0.15em]',
    md: 'text-base font-bold tracking-[0.18em]',
    lg: 'text-xl font-bold tracking-[0.2em]',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Bespoke Geometric Nova Star Mark */}
      <div className={`relative ${iconSizes[size]} flex items-center justify-center shrink-0`}>
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_12px_rgba(20,184,166,0.3)]"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="nova-grad-primary" x1="2" y1="2" x2="34" y2="34" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2DD4BF" />
              <stop offset="0.5" stopColor="#0D9488" />
              <stop offset="1" stopColor="#1E3A8A" />
            </linearGradient>
            <linearGradient id="nova-grad-facet" x1="18" y1="2" x2="18" y2="34" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F8FAFC" stopOpacity="0.9" />
              <stop offset="1" stopColor="#0D9488" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Outer stellar diamond facets */}
          <polygon
            points="18,2 24,12 34,18 24,24 18,34 12,24 2,18 12,12"
            fill="url(#nova-grad-primary)"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="0.8"
          />

          {/* Inner luminous core facet */}
          <polygon
            points="18,7 21,15 29,18 21,21 18,29 15,21 7,18 15,15"
            fill="url(#nova-grad-facet)"
            fillOpacity="0.8"
          />

          {/* Center pinpoint intelligence dot */}
          <circle cx="18" cy="18" r="1.5" fill="#FFFFFF" />
        </svg>
      </div>

      {/* Brand Title */}
      <div className="flex flex-col">
        <span className={`${titleSizes[size]} text-[var(--color-text)] font-sans leading-none uppercase`}>
          Nova
        </span>
        {showSubtitle && (
          <span className="text-[10px] font-medium tracking-normal text-[var(--color-accent)] mt-0.5">
            Finanzas personales
          </span>
        )}
      </div>
    </div>
  );
};
