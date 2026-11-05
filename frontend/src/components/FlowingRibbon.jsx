import React from 'react';

/**
 * FlowingRibbon
 * "Flowing Intelligence" signature visual element for NeuroMotion AI.
 * Elegant, layered multi-colour gradient ribbons combining:
 * Soft Teal (#75D5C7), Light Cyan (#A0DDEB), Pale Blue (#B9D5ED),
 * Muted Lavender (#B8A8E8), Soft Violet (#D0B5EA), and subtle Golden Yellow (#F4D66D).
 *
 * Implemented using pure responsive SVG with gradient strokes, translucent
 * overlapping curves, soft gaussian blur, and optional gentle CSS float animations.
 */
export default function FlowingRibbon({
  variant = 'hero', // 'hero' | 'banner' | 'subtle' | 'card'
  className = '',
  opacity = 0.85
}) {
  if (variant === 'hero') {
    return (
      <div
        className={`pointer-events-none absolute inset-0 overflow-hidden select-none ${className}`}
        style={{ opacity }}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1440 680"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-cover scale-105 origin-center animate-flowing-ribbon-slow"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Primary Multi-Colour Gradient (Teal -> Cyan -> Lavender -> Violet -> Subtle Gold) */}
            <linearGradient id="ribbonGradHero1" x1="0%" y1="20%" x2="100%" y2="80%">
              <stop offset="0%" stopColor="#75D5C7" stopOpacity="0.8" />
              <stop offset="25%" stopColor="#A0DDEB" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#B9D5ED" stopOpacity="0.8" />
              <stop offset="72%" stopColor="#B8A8E8" stopOpacity="0.85" />
              <stop offset="88%" stopColor="#D0B5EA" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#F4D66D" stopOpacity="0.5" />
            </linearGradient>

            {/* Secondary Violet -> Lavender -> Cyan Wave */}
            <linearGradient id="ribbonGradHero2" x1="100%" y1="10%" x2="0%" y2="90%">
              <stop offset="0%" stopColor="#D0B5EA" stopOpacity="0.75" />
              <stop offset="30%" stopColor="#B8A8E8" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#A0DDEB" stopOpacity="0.7" />
              <stop offset="85%" stopColor="#75D5C7" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#FAF9F4" stopOpacity="0" />
            </linearGradient>

            {/* Accent Gold -> Lavender Ribbon */}
            <linearGradient id="ribbonGradHero3" x1="10%" y1="0%" x2="90%" y2="100%">
              <stop offset="0%" stopColor="#F4D66D" stopOpacity="0.6" />
              <stop offset="35%" stopColor="#E9BD4B" stopOpacity="0.4" />
              <stop offset="65%" stopColor="#B8A8E8" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#75D5C7" stopOpacity="0.5" />
            </linearGradient>

            {/* Soft luminous glow filter */}
            <filter id="ribbonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Deeper diffuse atmospheric filter */}
            <filter id="ribbonDiffuse" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="24" />
            </filter>
          </defs>

          {/* Atmospheric background color cloud */}
          <g filter="url(#ribbonDiffuse)" opacity="0.35">
            <path
              d="M -100 240 C 300 120, 800 480, 1540 220"
              stroke="url(#ribbonGradHero1)"
              strokeWidth="160"
              strokeLinecap="round"
            />
            <path
              d="M 1540 180 C 1100 420, 450 180, -100 380"
              stroke="url(#ribbonGradHero2)"
              strokeWidth="140"
              strokeLinecap="round"
            />
          </g>

          {/* Ribbon 1: Deep wide swooping main silk ribbon */}
          <path
            d="M -80 280 C 260 110, 620 540, 1120 260 C 1280 180, 1420 290, 1540 250"
            stroke="url(#ribbonGradHero1)"
            strokeWidth="56"
            strokeLinecap="round"
            opacity="0.65"
            filter="url(#ribbonGlow)"
          />

          {/* Ribbon 2: Counter-flow luminous ribbon weaving through */}
          <path
            d="M -60 410 C 380 490, 780 160, 1240 380 C 1380 450, 1480 370, 1560 320"
            stroke="url(#ribbonGradHero2)"
            strokeWidth="42"
            strokeLinecap="round"
            opacity="0.6"
            filter="url(#ribbonGlow)"
          />

          {/* Ribbon 3: Fine, high-precision silky filament */}
          <path
            d="M -40 220 C 320 80, 710 460, 1180 200 C 1340 110, 1460 210, 1540 180"
            stroke="url(#ribbonGradHero3)"
            strokeWidth="18"
            strokeLinecap="round"
            opacity="0.75"
          />

          {/* Ribbon 4: Elegant lower curl with butter yellow accent */}
          <path
            d="M 120 560 C 490 620, 890 340, 1360 490 C 1480 530, 1550 480, 1600 440"
            stroke="url(#ribbonGradHero1)"
            strokeWidth="28"
            strokeLinecap="round"
            opacity="0.5"
          />

          {/* Ribbon 5: Whispering upper accent */}
          <path
            d="M -20 140 C 440 220, 820 40, 1300 130 C 1420 160, 1500 120, 1560 100"
            stroke="url(#ribbonGradHero2)"
            strokeWidth="14"
            strokeLinecap="round"
            opacity="0.45"
          />
        </svg>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div
        className={`pointer-events-none absolute inset-0 overflow-hidden select-none ${className}`}
        style={{ opacity }}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1000 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-cover"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="ribbonBannerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#75D5C7" stopOpacity="0.45" />
              <stop offset="30%" stopColor="#A0DDEB" stopOpacity="0.55" />
              <stop offset="60%" stopColor="#B8A8E8" stopOpacity="0.5" />
              <stop offset="85%" stopColor="#D0B5EA" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#F4D66D" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="ribbonBannerGrad2" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#D0B5EA" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#B8A8E8" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#75D5C7" stopOpacity="0.35" />
            </linearGradient>
            <filter id="bannerBlur" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>

          {/* Gentle background silk flow */}
          <path
            d="M -50 80 C 220 10, 520 220, 840 90 C 940 50, 1020 110, 1080 80"
            stroke="url(#ribbonBannerGrad)"
            strokeWidth="38"
            strokeLinecap="round"
            filter="url(#bannerBlur)"
            opacity="0.6"
          />
          <path
            d="M -30 140 C 260 210, 600 60, 920 160 C 1000 190, 1050 150, 1100 130"
            stroke="url(#ribbonBannerGrad2)"
            strokeWidth="24"
            strokeLinecap="round"
            opacity="0.55"
          />
          <path
            d="M 50 60 C 340 20, 680 180, 980 60"
            stroke="url(#ribbonBannerGrad)"
            strokeWidth="8"
            strokeLinecap="round"
            opacity="0.7"
          />
        </svg>
      </div>
    );
  }

  // 'subtle' or 'card' variant for headers and section backgrounds
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 600 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-cover"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="ribbonSubtleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#75D5C7" stopOpacity="0.35" />
            <stop offset="40%" stopColor="#A0DDEB" stopOpacity="0.4" />
            <stop offset="70%" stopColor="#B8A8E8" stopOpacity="0.38" />
            <stop offset="100%" stopColor="#D0B5EA" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <path
          d="M -20 60 C 140 10, 320 140, 500 60 C 560 30, 600 70, 640 50"
          stroke="url(#ribbonSubtleGrad)"
          strokeWidth="22"
          strokeLinecap="round"
          opacity="0.5"
        />
        <path
          d="M 0 100 C 180 140, 380 40, 580 110"
          stroke="url(#ribbonSubtleGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          opacity="0.4"
        />
      </svg>
    </div>
  );
}
