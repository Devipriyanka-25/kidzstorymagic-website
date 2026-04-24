'use client';

import React from 'react';

/**
 * WatermarkOverlay - CSS-based watermark overlay for unpaid previews
 * Creates diagonal watermark text across the entire preview area
 */
export default function WatermarkOverlay() {
  return (
    <>
      <style>{`
        @keyframes watermark-opacity {
          0%, 100% { opacity: 0.08; }
          50% { opacity: 0.12; }
        }

        .watermark-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 10;
          animation: watermark-opacity 3s ease-in-out infinite;
        }

        .watermark-text {
          position: absolute;
          width: 200%;
          height: 200%;
          top: -50%;
          left: -50%;
          transform: rotate(-45deg);
          font-size: 48px;
          font-weight: bold;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 3px;
          white-space: nowrap;
          line-height: 1.2;
        }

        .watermark-item {
          position: absolute;
          width: 100%;
          opacity: 0.1;
        }
      `}</style>

      <div className="watermark-overlay">
        <div className="watermark-text">
          {[...Array(10)].map((_, i) => (
            <div 
              key={i}
              className="watermark-item"
              style={{ top: `${i * 80}px` }}
            >
              Kidz Story Magic Preview • Kidz Story Magic Preview • Kidz Story Magic Preview • 
              Kidz Story Magic Preview • Kidz Story Magic Preview • Kidz Story Magic Preview
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
