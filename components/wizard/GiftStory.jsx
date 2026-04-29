'use client';

import { useEffect, useState } from 'react';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function buildGiftState(currentState) {
  const recipientName = currentState.recipientName.trim();
  const recipientEmail = currentState.recipientEmail.trim();
  const isValidEmail = EMAIL_PATTERN.test(recipientEmail);
  const isComplete = !currentState.isGift || (recipientName && isValidEmail);

  return {
    ...currentState,
    recipientName,
    recipientEmail,
    isValidEmail,
    isComplete,
  };
}

export default function GiftStory({ value, onChange }) {
  const [giftState, setGiftState] = useState(
    buildGiftState({
      isGift: value?.isGift || false,
      recipientName: value?.recipientName || '',
      recipientEmail: value?.recipientEmail || '',
      giftMessage: value?.giftMessage || '',
    })
  );

  useEffect(() => {
    onChange?.(giftState);
  }, [giftState, onChange]);

  const updateGiftState = (updates) => {
    setGiftState((currentState) =>
      buildGiftState({
        ...currentState,
        ...updates,
      })
    );
  };

  return (
    <section className="rounded-[28px] border border-rose-200 bg-[linear-gradient(180deg,#fff8fb_0%,#fff1f6_100%)] p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
      <button
        type="button"
        onClick={() =>
          updateGiftState({
            isGift: !giftState.isGift,
            recipientName: !giftState.isGift ? giftState.recipientName : '',
            recipientEmail: !giftState.isGift ? giftState.recipientEmail : '',
            giftMessage: !giftState.isGift ? giftState.giftMessage : '',
          })
        }
        className={`flex w-full items-center gap-4 rounded-[22px] border px-5 py-5 text-left transition-all duration-300 ${
          giftState.isGift
            ? 'border-rose-300 bg-white shadow-[0_14px_30px_rgba(244,63,94,0.12)]'
            : 'border-white/80 bg-white/70 hover:border-rose-200 hover:bg-white'
        }`}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-3xl">
          🎁
        </div>
        <div className="flex-1">
          <p className="text-lg font-black text-slate-900">Gift this story</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Send the finished story to a grandparent, aunt, uncle, or family
            friend right after checkout.
          </p>
        </div>
        <div
          className={`relative h-8 w-14 rounded-full transition-colors ${
            giftState.isGift ? 'bg-rose-500' : 'bg-slate-300'
          }`}
        >
          <span
            className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-all ${
              giftState.isGift ? 'left-7' : 'left-1'
            }`}
          />
        </div>
      </button>

      {giftState.isGift ? (
        <div className="mt-5 grid gap-4 rounded-[22px] border border-rose-200 bg-white p-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Recipient name
            </span>
            <input
              type="text"
              value={giftState.recipientName}
              onChange={(event) =>
                updateGiftState({ recipientName: event.target.value })
              }
              placeholder="Grandma Lakshmi"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Recipient email
            </span>
            <input
              type="email"
              value={giftState.recipientEmail}
              onChange={(event) =>
                updateGiftState({ recipientEmail: event.target.value })
              }
              placeholder="family@example.com"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Personal message
            </span>
            <textarea
              rows={4}
              value={giftState.giftMessage}
              onChange={(event) =>
                updateGiftState({ giftMessage: event.target.value })
              }
              placeholder="We thought this would make you smile. Hope you love this magical surprise."
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
            />
          </label>

          <div className="md:col-span-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {giftState.isComplete ? (
              <span className="font-medium">
                The recipient will receive a branded gift email with a secure
                story link after payment succeeds.
              </span>
            ) : (
              <span className="font-medium">
                Add a valid recipient name and email to finish setting up the
                gift delivery.
              </span>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
