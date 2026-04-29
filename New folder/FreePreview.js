// components/FreePreview.js
// Drop this into your frontend/components/ folder
// Usage: import FreePreview from '../components/FreePreview'

import { useState } from 'react';
import { useRouter } from 'next/router';

export default function FreePreview({ pages = [], storyData }) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const freePages = pages.slice(0, 3);
  const totalPages = pages.length;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a0533 0%, #2d1b4e 50%, #1a0533 100%)',
      fontFamily: "'Nunito', sans-serif",
      padding: '20px',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: 800, margin: 0 }}>
          ✨ Your Story Preview
        </h1>
        <p style={{ color: '#c084fc', marginTop: '8px', fontSize: '15px' }}>
          Reading page {currentPage + 1} of 3 (free preview)
        </p>
      </div>

      {/* Page Viewer */}
      <div style={{
        maxWidth: '480px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        position: 'relative',
      }}>
        {/* Page Content */}
        <div style={{ padding: '32px 28px', minHeight: '300px' }}>
          {freePages[currentPage] ? (
            <>
              <div style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#9333ea',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '16px',
              }}>
                Page {currentPage + 1}
              </div>
              <p style={{
                fontSize: '17px',
                lineHeight: '1.75',
                color: '#1e1b4b',
                margin: 0,
              }}>
                {freePages[currentPage].content || freePages[currentPage]}
              </p>
            </>
          ) : (
            <div style={{ color: '#6b7280', textAlign: 'center', paddingTop: '60px' }}>
              Loading your story...
            </div>
          )}
        </div>

        {/* Blurred Lock for pages beyond 3 */}
        {currentPage === 2 && (
          <div style={{
            background: 'linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            height: '80px',
          }} />
        )}

        {/* Page Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 28px',
          borderTop: '1px solid #f3f4f6',
          background: '#fafafa',
        }}>
          <button
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            style={{
              background: currentPage === 0 ? '#e5e7eb' : '#9333ea',
              color: currentPage === 0 ? '#9ca3af' : 'white',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 20px',
              fontWeight: 700,
              cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
            }}
          >
            ← Prev
          </button>

          {/* Dots */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {freePages.map((_, i) => (
              <div key={i} onClick={() => setCurrentPage(i)} style={{
                width: '10px', height: '10px',
                borderRadius: '50%',
                background: i === currentPage ? '#9333ea' : '#d1d5db',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }} />
            ))}
          </div>

          <button
            onClick={() => {
              if (currentPage < 2) setCurrentPage(p => p + 1);
            }}
            disabled={currentPage === 2}
            style={{
              background: currentPage === 2 ? '#e5e7eb' : '#9333ea',
              color: currentPage === 2 ? '#9ca3af' : 'white',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 20px',
              fontWeight: 700,
              cursor: currentPage === 2 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
            }}
          >
            Next →
          </button>
        </div>
      </div>

      {/* Locked Pages Preview */}
      <div style={{
        maxWidth: '480px',
        margin: '16px auto 0',
        background: 'rgba(255,255,255,0.07)',
        borderRadius: '16px',
        padding: '20px 24px',
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <span style={{ fontSize: '24px' }}>🔒</span>
          <div>
            <p style={{ color: '#fff', fontWeight: 700, margin: 0, fontSize: '15px' }}>
              {totalPages - 3} more pages waiting!
            </p>
            <p style={{ color: '#a78bfa', margin: 0, fontSize: '13px' }}>
              Unlock the full {totalPages}-page story
            </p>
          </div>
        </div>

        {/* Blurred locked pages hint */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '10px',
          padding: '12px 16px',
          filter: 'blur(3px)',
          userSelect: 'none',
          marginBottom: '16px',
        }}>
          <p style={{ color: '#e2e8f0', fontSize: '14px', margin: 0, lineHeight: 1.6 }}>
            The adventure continues as {storyData?.childName || 'your child'} discovers something magical...
          </p>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => router.push('/checkout?story=' + (storyData?.projectId || ''))}
          style={{
            width: '100%',
            padding: '16px',
            background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
            color: 'white',
            border: 'none',
            borderRadius: '14px',
            fontWeight: 800,
            fontSize: '17px',
            cursor: 'pointer',
            letterSpacing: '0.3px',
          }}
        >
          🚀 Unlock Full Story — From $9.99
        </button>
        <p style={{ color: '#94a3b8', textAlign: 'center', fontSize: '12px', marginTop: '10px' }}>
          PDF delivered instantly after payment ⚡
        </p>
      </div>
    </div>
  );
}
