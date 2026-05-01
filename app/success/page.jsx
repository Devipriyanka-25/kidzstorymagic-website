'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { paymentAPI } from '@/utils/api';
import StorySeries from '@/components/story/StorySeries';
import { formatOrderAddressLines } from '@/lib/orderData';

function OrderAddressCard({ title, address }) {
  const lines = formatOrderAddressLines(address);

  if (lines.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl bg-slate-50 p-5">
      <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
        {title}
      </p>
      <div className="mt-3 space-y-1 text-sm font-medium leading-6 text-slate-700">
        {lines.map((line) => (
          <p key={`${title}-${line}`}>{line}</p>
        ))}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const projectId = searchParams.get('project_id');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setError('No checkout session was provided.');
      setLoading(false);
      return;
    }

    const verifyPayment = async () => {
      try {
        setLoading(true);
        const response = await paymentAPI.verifyPayment(sessionId, projectId);
        setOrder(response.data?.data || response.data);
        setError('');
      } catch (err) {
        console.error('[SUCCESS PAGE] Verification error:', err);
        setError(err.response?.data?.error || err.message || 'Failed to verify payment.');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [projectId, sessionId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#ecfdf5_0%,#eff6ff_100%)] px-4">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">
            ✓
          </div>
          <h1 className="text-3xl font-black text-slate-900">
            Confirming your purchase
          </h1>
          <p className="mt-3 text-slate-600">
            We are loading the story details and post-purchase perks now.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#fef2f2_0%,#fff7ed_100%)] px-4">
        <div className="w-full max-w-xl rounded-[28px] bg-white p-8 text-center shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-4xl">
            !
          </div>
          <h1 className="text-3xl font-black text-slate-900">
            Payment verification failed
          </h1>
          <p className="mt-3 text-slate-600">{error}</p>
          <div className="mt-8 grid gap-3 md:grid-cols-2">
            <Link
              href="/wizard"
              className="rounded-2xl bg-blue-600 px-6 py-4 text-center font-bold text-white transition hover:bg-blue-700"
            >
              Return to Wizard
            </Link>
            <Link
              href="/dashboard"
              className="rounded-2xl bg-slate-200 px-6 py-4 text-center font-bold text-slate-900 transition hover:bg-slate-300"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f0fdf4_0%,#eff6ff_30%,#ffffff_100%)] px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-5xl shadow-lg">
            ✓
          </div>
          <h1 className="text-4xl font-black text-slate-900 sm:text-5xl">
            Purchase confirmed
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            The storybook order is complete and ready for the next step.
          </p>
        </div>

        <div className="rounded-[32px] bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
                Order
              </p>
              <p className="mt-3 text-lg font-black text-slate-900">
                {order?.id}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
                Child
              </p>
              <p className="mt-3 text-lg font-black text-slate-900">
                {order?.child_name || 'Story Child'}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
                Theme
              </p>
              <p className="mt-3 text-lg font-black capitalize text-slate-900">
                {order?.theme || 'Story Theme'}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
                Amount
              </p>
              <p className="mt-3 text-lg font-black text-slate-900">
                {order?.currency} {Number(order?.amount || 0).toFixed(2)}
              </p>
            </div>
          </div>

          {(order?.customer_email ||
            order?.customer_phone ||
            order?.billing_address ||
            order?.shipping_address) && (
            <div className="mt-8 rounded-[28px] border border-blue-200 bg-blue-50 p-6">
              <h2 className="text-2xl font-black text-slate-900">
                Contact and fulfillment details
              </h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {order?.customer_email ? (
                  <div className="rounded-2xl bg-white p-5">
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
                      Email
                    </p>
                    <p className="mt-3 break-all text-sm font-semibold text-slate-900">
                      {order.customer_email}
                    </p>
                  </div>
                ) : null}
                {order?.customer_phone ? (
                  <div className="rounded-2xl bg-white p-5">
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
                      Mobile
                    </p>
                    <p className="mt-3 text-sm font-semibold text-slate-900">
                      {order.customer_phone}
                    </p>
                  </div>
                ) : null}
                <OrderAddressCard
                  title="Billing Address"
                  address={order?.billing_address}
                />
                <OrderAddressCard
                  title="Shipping Address"
                  address={order?.shipping_address}
                />
              </div>
            </div>
          )}

          <div className="mt-8 rounded-[28px] border border-green-200 bg-green-50 p-6">
            <h2 className="text-2xl font-black text-green-950">
              Privacy and delivery summary
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-white px-5 py-4 text-sm leading-7 text-slate-700">
                Uploaded child photos stay protected in the purchase flow and
                are not shared or sold.
              </div>
              <div className="rounded-2xl bg-white px-5 py-4 text-sm leading-7 text-slate-700">
                Your story can now move into the post-purchase reading and
                fulfillment experience.
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-2">
            <Link
              href="/dashboard"
              className="rounded-2xl bg-blue-600 px-6 py-4 text-center font-bold text-white transition hover:bg-blue-700"
            >
              View Dashboard
            </Link>
            <Link
              href="/"
              className="rounded-2xl bg-slate-200 px-6 py-4 text-center font-bold text-slate-900 transition hover:bg-slate-300"
            >
              Return Home
            </Link>
          </div>
        </div>

        <div className="mt-8">
          <StorySeries
            childName={order?.child_name}
            childAge={order?.child_age}
            ageGroup={order?.age_group}
            originalTheme={order?.theme}
            storyNumber={order?.storyNumber || 1}
          />
        </div>
      </div>
    </div>
  );
}
