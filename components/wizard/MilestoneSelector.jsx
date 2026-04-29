'use client';

import { getMilestoneById, getMilestonesForAgeGroup } from '@/utils/milestones';

export default function MilestoneSelector({ ageGroup, selectedId, onSelect }) {
  const milestones = getMilestonesForAgeGroup(ageGroup);
  const selectedMilestone = getMilestoneById(selectedId);

  return (
    <section className="rounded-[28px] border border-amber-200 bg-white/95 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-amber-600">
            Milestone Stories
          </p>
          <h3 className="mt-2 text-3xl font-black text-slate-900">
            Pick a life moment to celebrate
          </h3>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
            These themed story starters help parents turn big little moments
            into keepsake books that feel extra personal.
          </p>
        </div>
        {selectedId ? (
          <div className="rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-amber-800">
            Occasion selected
          </div>
        ) : null}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {milestones.map((milestone) => {
          const isSelected = milestone.id === selectedId;

          return (
            <button
              key={milestone.id}
              type="button"
              onClick={() => onSelect?.(milestone)}
              className={`rounded-[24px] border px-5 py-5 text-left transition-all duration-300 ${
                isSelected
                  ? 'border-amber-400 bg-[linear-gradient(180deg,#fff9ed_0%,#fff3d4_100%)] shadow-[0_18px_35px_rgba(245,158,11,0.18)] ring-2 ring-amber-200'
                  : 'border-slate-200 bg-slate-50 hover:-translate-y-1 hover:border-amber-300 hover:bg-white hover:shadow-[0_16px_32px_rgba(15,23,42,0.10)]'
              }`}
            >
              <div className="text-3xl">{milestone.emoji}</div>
              <h4 className="mt-4 text-xl font-black text-slate-900">
                {milestone.title}
              </h4>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {milestone.subtitle}
              </p>
              <div className="mt-4 inline-flex rounded-full bg-slate-900/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-700">
                {milestone.coverBadge}
              </div>
            </button>
          );
        })}
      </div>

      {selectedId ? (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          <span className="font-black">Story prompt boost:</span>{' '}
          {selectedMilestone?.promptHint}
        </div>
      ) : null}
    </section>
  );
}
