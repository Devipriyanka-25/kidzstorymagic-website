// components/MilestoneSelector.js
// Add this as Step 1 or Step 0 in your wizard before theme selection
// Usage: import MilestoneSelector from '../components/MilestoneSelector'

import { useState } from 'react';

const MILESTONES = [
  {
    id: 'birthday',
    emoji: '🎂',
    title: 'Birthday',
    subtitle: 'Celebrate their special day',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(239,68,68,0.1))',
    border: 'rgba(245,158,11,0.4)',
    promptHint: 'a magical birthday adventure where the hero discovers their special birthday powers',
    coverBadge: '🎉 Happy Birthday',
  },
  {
    id: 'first_day_school',
    emoji: '🎒',
    title: 'First Day of School',
    subtitle: 'A brave new adventure begins',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(99,102,241,0.1))',
    border: 'rgba(59,130,246,0.4)',
    promptHint: 'conquering first day jitters and making wonderful new friends at school',
    coverBadge: '📚 First Day Hero',
  },
  {
    id: 'new_sibling',
    emoji: '👶',
    title: 'New Baby Sibling',
    subtitle: 'Becoming a big brother/sister',
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, rgba(236,72,153,0.2), rgba(168,85,247,0.1))',
    border: 'rgba(236,72,153,0.4)',
    promptHint: 'becoming the best big sibling and welcoming a new baby into the family',
    coverBadge: '💕 Big Sibling',
  },
  {
    id: 'lost_tooth',
    emoji: '🦷',
    title: 'Lost First Tooth',
    subtitle: 'A visit from the Tooth Fairy',
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(59,130,246,0.1))',
    border: 'rgba(6,182,212,0.4)',
    promptHint: 'a magical encounter with the Tooth Fairy after losing their very first tooth',
    coverBadge: '✨ Tooth Fairy Visit',
  },
  {
    id: 'graduation',
    emoji: '🎓',
    title: 'Graduation / Moving Up',
    subtitle: 'Celebrating an achievement',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.1))',
    border: 'rgba(139,92,246,0.4)',
    promptHint: 'their incredible journey and the exciting adventures that lie ahead',
    coverBadge: '🌟 Graduate',
  },
  {
    id: 'potty_training',
    emoji: '🌈',
    title: 'Potty Training Win',
    subtitle: 'A big milestone accomplished!',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.1))',
    border: 'rgba(16,185,129,0.4)',
    promptHint: 'achieving a huge milestone and becoming a superstar big kid',
    coverBadge: '⭐ Big Kid Now',
  },
  {
    id: 'moving_home',
    emoji: '🏠',
    title: 'Moving to New Home',
    subtitle: 'A new chapter begins',
    color: '#f97316',
    gradient: 'linear-gradient(135deg, rgba(249,115,22,0.2), rgba(245,158,11,0.1))',
    border: 'rgba(249,115,22,0.4)',
    promptHint: 'an exciting adventure exploring their brand new home and neighbourhood',
    coverBadge: '🏡 New Home',
  },
  {
    id: 'custom',
    emoji: '✍️',
    title: 'My Own Reason',
    subtitle: 'Create a custom story',
    color: '#6b7280',
    gradient: 'linear-gradient(135deg, rgba(107,114,128,0.2), rgba(75,85,99,0.1))',
    border: 'rgba(107,114,128,0.4)',
    promptHint: '',
    coverBadge: '',
  },
];

export default function MilestoneSelector({ onSelect, selectedId }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{
      fontFamily: "'Nunito', sans-serif",
      padding: '8px 0',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: 800, margin: '0 0 8px' }}>
          What's the occasion? 🎉
        </h2>
        <p style={{ color: '#a78bfa', fontSize: '14px', margin: 0 }}>
          Pick a milestone for a truly special story
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
      }}>
        {MILESTONES.map(m => {
          const isSelected = selectedId === m.id;
          const isHovered = hovered === m.id;

          return (
            <div
              key={m.id}
              onClick={() => onSelect(m)}
              onMouseEnter={() => setHovered(m.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: isSelected ? m.gradient : 'rgba(255,255,255,0.05)',
                border: `2px solid ${isSelected ? m.border : isHovered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '16px',
                padding: '16px 14px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s',
                transform: isSelected ? 'scale(1.02)' : isHovered ? 'scale(1.01)' : 'scale(1)',
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>{m.emoji}</div>
              <p style={{
                color: isSelected ? '#fff' : '#e2e8f0',
                fontWeight: 700,
                margin: '0 0 4px',
                fontSize: '13px',
              }}>
                {m.title}
              </p>
              <p style={{
                color: isSelected ? '#c4b5fd' : '#6b7280',
                margin: 0,
                fontSize: '11px',
                lineHeight: 1.4,
              }}>
                {m.subtitle}
              </p>
              {isSelected && m.coverBadge && (
                <div style={{
                  marginTop: '8px',
                  display: 'inline-block',
                  background: m.color,
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '20px',
                }}>
                  {m.coverBadge}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedId && selectedId !== 'custom' && (
        <div style={{
          marginTop: '16px',
          background: 'rgba(147,51,234,0.15)',
          borderRadius: '12px',
          padding: '12px 16px',
          border: '1px solid rgba(147,51,234,0.3)',
        }}>
          <p style={{ color: '#c4b5fd', fontSize: '13px', margin: 0 }}>
            ✨ Your story will be about{' '}
            <span style={{ color: '#fff', fontWeight: 700 }}>
              {MILESTONES.find(m => m.id === selectedId)?.promptHint}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

// Export milestone data for use in AI prompt generation
export { MILESTONES };
