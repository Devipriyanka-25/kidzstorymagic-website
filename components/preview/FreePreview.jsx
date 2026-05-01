'use client';

import { useMemo, useState } from 'react';

function getPageImage(page) {
  return (
    page?.illustrationUrl ||
    page?.faceSwappedUrl ||
    page?.imageUrl ||
    page?.image ||
    null
  );
}

function getPageText(page) {
  return page?.text || page?.content || '';
}

export default function FreePreview({
  pages = [],
  childName = 'your child',
  totalPages: totalPagesOverride,
  priceLabel = 'Unlock full story',
  onUnlock,
  unlockDisabled = false,
}) {
  const [currentPage, setCurrentPage] = useState(0);
  const freePages = useMemo(() => pages.slice(0, 3), [pages]);
  const totalPages = totalPagesOverride || pages.length;
  const remainingPages = Math.max(totalPages - freePages.length, 0);
  const currentPreviewPage = freePages[currentPage];
  const currentPreviewImage = getPageImage(currentPreviewPage);

  if (freePages.length === 0) {
    return null;
  }

  return (
    <div className="rounded-[32px] bg-[linear-gradient(135deg,#0f172a_0%,#1d2b64_52%,#0f172a_100%)] p-5 shadow-[0_28px_80px_rgba(15,23,42,0.35)] sm:p-7">
      <div className="mb-6 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.35em] text-sky-200">
          Free Sample
        </p>
        <h3 className="mt-3 text-3xl font-black text-white sm:text-4xl">
          3 pages ready to read
        </h3>
        <p className="mt-3 text-sm leading-7 text-sky-100/90 sm:text-base">
          Families can explore a real preview first, then unlock the full book
          once they love it.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_minmax(0,0.9fr)]">
        <div className="overflow-hidden rounded-[28px] bg-white shadow-2xl">
          <div className="relative h-[280px] bg-slate-100 sm:h-[360px]">
            {currentPreviewImage ? (
              <img
                src={currentPreviewImage}
                alt={currentPreviewPage?.title || `Preview page ${currentPage + 1}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#dbeafe_0%,#fce7f3_100%)] text-6xl">
                📖
              </div>
            )}
            <div className="absolute left-4 top-4 rounded-full bg-white/95 px-4 py-1.5 text-xs font-black uppercase tracking-[0.28em] text-slate-900 shadow-lg">
              Page {currentPage + 1} of 3
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <h4 className="text-2xl font-black text-slate-900">
              {currentPreviewPage?.title || `Page ${currentPage + 1}`}
            </h4>
            <p className="mt-4 text-base leading-8 text-slate-700">
              {getPageText(currentPreviewPage)}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-sky-200">
              Preview Pages
            </p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {freePages.map((page, index) => {
                const previewImage = getPageImage(page);
                const isActive = index === currentPage;

                return (
                  <button
                    key={`${page?.pageNumber || index}-${page?.title || 'preview'}`}
                    type="button"
                    onClick={() => setCurrentPage(index)}
                    className={`overflow-hidden rounded-2xl border transition-all ${
                      isActive
                        ? 'border-sky-300 ring-2 ring-sky-300'
                        : 'border-white/10 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="h-24 bg-white/10">
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt={`Preview page ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-2xl text-white/80">
                          {index + 1}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[28px] border border-amber-200/40 bg-[linear-gradient(180deg,rgba(245,158,11,0.18)_0%,rgba(15,23,42,0.45)_100%)] p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-300 text-2xl">
                🔒
              </div>
              <div>
                <p className="text-lg font-black text-white">
                  {remainingPages} more page{remainingPages === 1 ? '' : 's'} are
                  locked
                </p>
                <p className="mt-2 text-sm leading-6 text-amber-50/90">
                  The story continues after {childName} steps deeper into the
                  adventure. Unlock the complete book, PDF access, and the full
                  keepsake experience.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-white/15 px-4 py-4 text-sm italic leading-7 text-white/90 blur-[2px]">
              The next chapter opens as {childName} discovers an even more
              magical surprise waiting just ahead...
            </div>

            <button
              type="button"
              onClick={onUnlock}
              disabled={unlockDisabled}
              className="mt-5 w-full rounded-2xl bg-[linear-gradient(135deg,#f59e0b_0%,#ef4444_100%)] px-5 py-4 text-base font-black text-white shadow-[0_16px_35px_rgba(239,68,68,0.32)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {priceLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
