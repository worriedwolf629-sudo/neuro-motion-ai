import React from 'react';

/**
 * FlowingRibbon
 * "Flowing Intelligence" signature visual element for NeuroMotion AI,
 * matching the reference visual design.
 *
 * Layered, flowing silk ribbons combining:
 * Soft Teal (#75D5C7), Light Cyan (#A0DDEB), Pale Blue (#B9D5ED),
 * Muted Lavender (#B8A8E8), Soft Violet (#D0B5EA), and Golden Yellow (#F4D66D).
 *
 * Implemented with pure responsive vector SVGs, multi-stop linear gradients,
 * soft gaussian blur filters, and gentle ambient keyframe animation.
 */
export default function FlowingRibbon({
  position = 'full', // 'full' | 'top-right' | 'bottom-left' | 'hero'
  variant, // backward-compatibility alias: 'hero' | 'banner' | 'subtle'
  className = '',
  opacity = 0.85
}) {
  const activePosition = variant
    ? (variant === 'hero' ? 'hero' : variant === 'banner' ? 'top-right' : 'full')
    : position;

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none z-0 ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1600 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-cover scale-[1.02] origin-center animate-flowing-ribbon-slow"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Primary Multi-Colour Gradient (Teal -> Cyan -> Pale Blue -> Lavender -> Violet -> Subtle Gold) */}
          <linearGradient id="flowGradPrimary" x1="0%" y1="30%" x2="100%" y2="70%">
            <stop offset="0%" stopColor="#75D5C7" stopOpacity="0.85" />
            <stop offset="22%" stopColor="#A0DDEB" stopOpacity="0.9" />
            <stop offset="42%" stopColor="#B9D5ED" stopOpacity="0.85" />
            <stop offset="65%" stopColor="#B8A8E8" stopOpacity="0.9" />
            <stop offset="85%" stopColor="#D0B5EA" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#F4D66D" stopOpacity="0.7" />
          </linearGradient>

          {/* Secondary Violet -> Lavender -> Cyan -> Teal Counter-Gradient */}
          <linearGradient id="flowGradSecondary" x1="100%" y1="10%" x2="0%" y2="90%">
            <stop offset="0%" stopColor="#D0B5EA" stopOpacity="0.85" />
            <stop offset="28%" stopColor="#B8A8E8" stopOpacity="0.9" />
            <stop offset="55%" stopColor="#A0DDEB" stopOpacity="0.85" />
            <stop offset="80%" stopColor="#75D5C7" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#F4D66D" stopOpacity="0.4" />
          </linearGradient>

          {/* Accent Gold -> Lavender Ribbon Gradient */}
          <linearGradient id="flowGradAccent" x1="10%" y1="0%" x2="90%" y2="100%">
            <stop offset="0%" stopColor="#F4D66D" stopOpacity="0.85" />
            <stop offset="35%" stopColor="#E9BD4B" stopOpacity="0.75" />
            <stop offset="70%" stopColor="#B8A8E8" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#75D5C7" stopOpacity="0.75" />
          </linearGradient>

          {/* Soft luminous glow filter */}
          <filter id="ribbonGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Deeper diffuse atmospheric filter */}
          <filter id="ribbonAtmosphereFilter" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="26" />
          </filter>
        </defs>

        {/* 1. TOP-RIGHT FLOW (Present in 'full', 'top-right', and 'hero') */}
        {(activePosition === 'full' || activePosition === 'top-right' || activePosition === 'hero') && (
          <g>
            {/* Soft atmospheric underglow */}
            <path
              d="M 680 -40 C 960 120, 1280 40, 1680 180"
              stroke="url(#flowGradPrimary)"
              strokeWidth="140"
              strokeLinecap="round"
              filter="url(#ribbonAtmosphereFilter)"
              opacity="0.4"
            />
            <path
              d="M 850 140 C 1120 40, 1380 220, 1720 110"
              stroke="url(#flowGradSecondary)"
              strokeWidth="120"
              strokeLinecap="round"
              filter="url(#ribbonAtmosphereFilter)"
              opacity="0.35"
            />

            {/* Main wide silk wave sweeping across the top right */}
            <path
              d="M 620 -20 C 920 180, 1260 60, 1680 190"
              stroke="url(#flowGradPrimary)"
              strokeWidth="56"
              strokeLinecap="round"
              opacity="0.8"
              filter="url(#ribbonGlowFilter)"
            />

            {/* Counter-weaving lavender/violet strand */}
            <path
              d="M 740 60 C 1040 220, 1340 30, 1720 140"
              stroke="url(#flowGradSecondary)"
              strokeWidth="38"
              strokeLinecap="round"
              opacity="0.75"
              filter="url(#ribbonGlowFilter)"
            />

            {/* Luminous fine gold-teal filament */}
            <path
              d="M 690 -50 C 980 140, 1290 80, 1690 220"
              stroke="url(#flowGradAccent)"
              strokeWidth="16"
              strokeLinecap="round"
              opacity="0.85"
            />

            {/* Delicate upper curl */}
            <path
              d="M 880 20 C 1140 160, 1420 70, 1700 80"
              stroke="url(#flowGradPrimary)"
              strokeWidth="24"
              strokeLinecap="round"
              opacity="0.65"
            />
          </g>
        )}

        {/* 2. BOTTOM-LEFT / BOTTOM-RIGHT FLOW (Present in 'full', 'bottom-left', and 'hero') */}
        {(activePosition === 'full' || activePosition === 'bottom-left' || activePosition === 'hero') && (
          <g>
            {/* Atmospheric lower glow */}
            <path
              d="M -100 780 C 280 620, 680 880, 1140 740"
              stroke="url(#flowGradPrimary)"
              strokeWidth="150"
              strokeLinecap="round"
              filter="url(#ribbonAtmosphereFilter)"
              opacity="0.4"
            />

            {/* Main lower swirling silk ribbon */}
            <path
              d="M -80 760 C 260 600, 640 860, 1080 720"
              stroke="url(#flowGradPrimary)"
              strokeWidth="52"
              strokeLinecap="round"
              opacity="0.75"
              filter="url(#ribbonGlowFilter)"
            />

            {/* Counter-flow violet ribbon */}
            <path
              d="M -50 830 C 320 680, 720 900, 1160 770"
              stroke="url(#flowGradSecondary)"
              strokeWidth="36"
              strokeLinecap="round"
              opacity="0.7"
              filter="url(#ribbonGlowFilter)"
            />

            {/* Fine accent filament */}
            <path
              d="M -60 730 C 240 580, 610 830, 1040 690"
              stroke="url(#flowGradAccent)"
              strokeWidth="15"
              strokeLinecap="round"
              opacity="0.85"
            />

            {/* Subtle bottom-right trail */}
            <path
              d="M 1180 820 C 1340 760, 1480 840, 1650 780"
              stroke="url(#flowGradPrimary)"
              strokeWidth="28"
              strokeLinecap="round"
              opacity="0.55"
            />
          </g>
        )}

        {/* 3. HERO-SPECIFIC CENTER SWEEP (for Landing Page hero) */}
        {activePosition === 'hero' && (
          <g>
            {/* Center flowing bridge curving behind the floating card */}
            <path
              d="M 400 360 C 720 180, 1080 520, 1540 280"
              stroke="url(#flowGradPrimary)"
              strokeWidth="64"
              strokeLinecap="round"
              opacity="0.8"
              filter="url(#ribbonGlowFilter)"
            />
            <path
              d="M 460 420 C 780 240, 1140 560, 1580 320"
              stroke="url(#flowGradSecondary)"
              strokeWidth="42"
              strokeLinecap="round"
              opacity="0.75"
            />
            <path
              d="M 380 320 C 700 150, 1050 480, 1500 250"
              stroke="url(#flowGradAccent)"
              strokeWidth="18"
              strokeLinecap="round"
              opacity="0.85"
            />
          </g>
        )}
      </svg>
    </div>
  );
}
