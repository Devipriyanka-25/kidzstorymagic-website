// components/GiftStory.js
// Add this inside your existing checkout page
// Usage: import GiftStory from '../components/GiftStory'
// Then: <GiftStory onGiftDataChange={(data) => setGiftData(data)} />

import { useState } from 'react';

export default function GiftStory({ onGiftDataChange }) {
  const [isGift, setIsGift] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [giftMessage, setGiftMessage] = useState('');

  const handleToggle = () => {
    const newVal = !isGift;
    setIsGift(newVal);
    if (!newVal) {
      onGiftDataChange(null);
    }
  };

  const handleChange = (field, value) => {
    const updates = { recipientName, recipientEmail, giftMessage, [field]: value };
    if (field === 'recipientName') updates.recipientName = value;
    if (field === 'recipientEmail') updates.recipientEmail = value;
    if (field === 'giftMessage') updates.giftMessage = value;

    if (updates.recipientName && updates.recipientEmail) {
      onGiftDataChange(updates);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: "'Nunito', sans-serif",
  };

  const labelStyle = {
    color: '#c4b5fd',
    fontSize: '13px',
    fontWeight: 600,
    display: 'block',
    marginBottom: '6px',
  };

  return (
    <div style={{
      fontFamily: "'Nunito', sans-serif",
      marginBottom: '20px',
    }}>
      {/* Toggle */}
      <div
        onClick={handleToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '16px 18px',
          background: isGift
            ? 'rgba(236,72,153,0.15)'
            : 'rgba(255,255,255,0.05)',
          border: isGift
            ? '2px solid #ec4899'
            : '2px solid rgba(255,255,255,0.1)',
          borderRadius: '14px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          marginBottom: isGift ? '16px' : '0',
        }}
      >
        <span style={{ fontSize: '28px' }}>🎁</span>
        <div style={{ flex: 1 }}>
          <p style={{ color: '#fff', fontWeight: 700, margin: 0, fontSize: '15px' }}>
            This is a gift
          </p>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '12px' }}>
            Send directly to someone special
          </p>
        </div>
        {/* Toggle Switch */}
        <div style={{
          width: '46px', height: '26px',
          background: isGift ? '#ec4899' : '#374151',
          borderRadius: '13px',
          position: 'relative',
          transition: 'background 0.2s',
          flexShrink: 0,
        }}>
          <div style={{
            position: 'absolute',
            top: '3px',
            left: isGift ? '23px' : '3px',
            width: '20px', height: '20px',
            background: 'white',
            borderRadius: '50%',
            transition: 'left 0.2s',
            boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
          }} />
        </div>
      </div>

      {/* Gift Form */}
      {isGift && (
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '14px',
          padding: '20px',
          border: '1px solid rgba(236,72,153,0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}>
          <div>
            <label style={labelStyle}>Recipient's Name *</label>
            <input
              type="text"
              placeholder="e.g. Grandma Lakshmi"
              value={recipientName}
              onChange={e => {
                setRecipientName(e.target.value);
                handleChange('recipientName', e.target.value);
              }}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Recipient's Email *</label>
            <input
              type="email"
              placeholder="they'll receive the story here"
              value={recipientEmail}
              onChange={e => {
                setRecipientEmail(e.target.value);
                handleChange('recipientEmail', e.target.value);
              }}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Personal Gift Message (optional)</label>
            <textarea
              placeholder="Write a sweet message that will appear on the gift delivery email..."
              value={giftMessage}
              onChange={e => {
                setGiftMessage(e.target.value);
                handleChange('giftMessage', e.target.value);
              }}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.5' }}
            />
          </div>

          <div style={{
            background: 'rgba(236,72,153,0.1)',
            borderRadius: '10px',
            padding: '12px 14px',
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: '16px' }}>💌</span>
            <p style={{ color: '#f9a8d4', fontSize: '12px', margin: 0, lineHeight: 1.5 }}>
              They'll receive a beautiful gift email with a download link. You'll get a copy too!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
