// components/StorySeries.js
// Show this on the success/dashboard page after a story is purchased
// Usage: import StorySeries from '../components/StorySeries'

import { useState } from 'react';
import { useRouter } from 'next/router';

const SERIES_THEMES = [
  { id: 'space', emoji: '🚀', title: 'Space Adventure', desc: 'Chapter 2: Journey to the Stars' },
  { id: 'ocean', emoji: '🌊', title: 'Ocean Quest', desc: 'Chapter 2: The Deep Sea Mystery' },
  { id: 'magic', emoji: '🧙', title: 'Magic Kingdom', desc: 'Chapter 2: The Enchanted Forest' },
  { id: 'dino', emoji: '🦕', title: 'Dino Land', desc: 'Chapter 2: The Lost Valley' },
];

export default function StorySeries({ childName, childAge, originalTheme, storyNumber = 1 }) {
  const router = useRouter();
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [bundle, setBundle] = useState(false);

  const handleContinue = () => {
    if (!selectedTheme) return;
    // Pass pre-filled child data into wizard
    const params = new URLSearchParams({
      childName,
      childAge,
      theme: selectedTheme,
      isSeries: 'true',
      chapterNumber: storyNumber + 1,
      bundle: bundle ? 'true' : 'false',
    });
    router.push('/wizard?' + params.toString());
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
      borderRadius: '24px',
      padding: '32px 24px',
      maxWidth: '480px',
      margin: '24px auto',
      fontFamily: "'Nunito', sans-serif",
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ fontSize: '48px', marginBottom: '8px' }}>📚</div>
        <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: 800, margin: 0 }}>
          Continue the Adventure!
        </h2>
        <p style={{ color: '#a78bfa', fontSize: '14px', marginTop: '8px' }}>
          {childName} has completed Story #{storyNumber}. Ready for Chapter {storyNumber + 1}?
        </p>
      </div>

      {/* Bundle Offer */}
      <div
        onClick={() => setBundle(!bundle)}
        style={{
          background: bundle
            ? 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(239,68,68,0.2))'
            : 'rgba(255,255,255,0.05)',
          border: bundle ? '2px solid #f59e0b' : '2px solid rgba(255,255,255,0.1)',
          borderRadius: '14px',
          padding: '14px 18px',
          cursor: 'pointer',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          transition: 'all 0.2s',
        }}
      >
        <span style={{ fontSize: '28px' }}>🎁</span>
        <div style={{ flex: 1 }}>
          <p style={{ color: '#fbbf24', fontWeight: 700, margin: 0, fontSize: '14px' }}>
            Bundle Deal — Save 22%!
          </p>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '12px' }}>
            3 stories for $34.99 instead of $44.97
          </p>
        </div>
        <div style={{
          width: '22px', height: '22px',
          borderRadius: '50%',
          background: bundle ? '#f59e0b' : 'transparent',
          border: bundle ? 'none' : '2px solid #4b5563',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {bundle && <span style={{ color: 'white', fontSize: '12px', fontWeight: 800 }}>✓</span>}
        </div>
      </div>

      {/* Theme Selection */}
      <p style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '14px', marginBottom: '12px' }}>
        Pick {childName}'s next adventure:
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        {SERIES_THEMES.map(theme => (
          <div
            key={theme.id}
            onClick={() => setSelectedTheme(theme.id)}
            style={{
              background: selectedTheme === theme.id
                ? 'rgba(147,51,234,0.3)'
                : 'rgba(255,255,255,0.05)',
              border: selectedTheme === theme.id
                ? '2px solid #9333ea'
                : '2px solid rgba(255,255,255,0.1)',
              borderRadius: '14px',
              padding: '14px',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ fontSize: '28px', marginBottom: '6px' }}>{theme.emoji}</div>
            <p style={{ color: '#fff', fontWeight: 700, margin: 0, fontSize: '13px' }}>
              {theme.title}
            </p>
            <p style={{ color: '#94a3b8', margin: '4px 0 0', fontSize: '11px' }}>
              {theme.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Price Display */}
      <div style={{
        textAlign: 'center',
        marginBottom: '16px',
        color: '#94a3b8',
        fontSize: '14px',
      }}>
        {bundle ? (
          <span>
            <span style={{ textDecoration: 'line-through', color: '#6b7280' }}>$44.97</span>
            {' '}→{' '}
            <span style={{ color: '#fbbf24', fontWeight: 800, fontSize: '18px' }}>$34.99</span>
            {' '}for 3 stories
          </span>
        ) : (
          <span>
            Single story from{' '}
            <span style={{ color: '#c084fc', fontWeight: 800, fontSize: '18px' }}>$9.99</span>
          </span>
        )}
      </div>

      {/* CTA */}
      <button
        onClick={handleContinue}
        disabled={!selectedTheme}
        style={{
          width: '100%',
          padding: '16px',
          background: selectedTheme
            ? 'linear-gradient(135deg, #9333ea, #6366f1)'
            : '#374151',
          color: 'white',
          border: 'none',
          borderRadius: '14px',
          fontWeight: 800,
          fontSize: '16px',
          cursor: selectedTheme ? 'pointer' : 'not-allowed',
          opacity: selectedTheme ? 1 : 0.6,
          transition: 'all 0.2s',
        }}
      >
        {selectedTheme ? `✨ Start Chapter ${storyNumber + 1} →` : 'Pick a theme above'}
      </button>

      <p style={{ color: '#4b5563', textAlign: 'center', fontSize: '11px', marginTop: '12px' }}>
        Child details are pre-filled — create in 2 minutes!
      </p>
    </div>
  );
}
