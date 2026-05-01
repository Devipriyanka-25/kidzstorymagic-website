import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { supabaseClient } from '../../../shared/supabaseClient.js';
import { resolveAuthenticatedStoryUser } from '../../../shared/storyProjects.js';
import { resolveUserRole } from '../../../shared/authRoles.js';
import { readStoredOrderContactDetails } from '@/lib/orderData';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getJwtSecret() {
  return (
    process.env.JWT_SECRET ||
    'kidz-story-magic-jwt-secret-key-2024-production-secure-random-12345'
  );
}

async function resolveAdminUser(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const token = authHeader.substring(7);
  let decoded;

  try {
    decoded = jwt.verify(token, getJwtSecret());
  } catch {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const authUser = await resolveAuthenticatedStoryUser(decoded);
  const role = resolveUserRole(authUser?.email || decoded?.email);

  if (!authUser?.id || role !== 'admin') {
    return {
      error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }

  return { authUser, role };
}

export async function GET(request) {
  try {
    const { error } = await resolveAdminUser(request);
    if (error) {
      return error;
    }

    if (!supabaseClient) {
      return NextResponse.json(
        {
          orders: [],
          stats: {
            totalOrders: 0,
            totalRevenue: 0,
            totalCustomers: 0,
            pendingOrders: 0,
          },
          source: 'unconfigured',
          message: 'Supabase client is not configured.',
        },
        { status: 200 }
      );
    }

    const { data: orders, error: ordersError } = await supabaseClient
      .from('orders')
      .select('*')
      .order('completed_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(200);

    if (ordersError) {
      throw ordersError;
    }

    const normalizedOrders = Array.isArray(orders) ? orders : [];
    const userIds = Array.from(
      new Set(
        normalizedOrders
          .map((order) => Number(order.user_id))
          .filter((value) => Number.isFinite(value))
      )
    );

    let usersById = new Map();
    if (userIds.length > 0) {
      const { data: users } = await supabaseClient
        .from('users')
        .select('id, name, email')
        .in('id', userIds);

      usersById = new Map(
        (users || []).map((user) => [Number(user.id), user])
      );
    }

    const formattedOrders = normalizedOrders.map((order) => {
      const user = usersById.get(Number(order.user_id));
      const storedContact = readStoredOrderContactDetails(order);
      return {
        id: order.id,
        project_id: order.project_id,
        user_id: order.user_id,
        amount: Number(order.amount || 0),
        currency: order.currency || 'USD',
        status: order.status || order.payment_status || 'pending',
        payment_method: order.payment_method || 'card',
        stripe_session_id: order.stripe_session_id || null,
        customer_name: storedContact.customerName || user?.name || 'Unknown',
        customer_email:
          storedContact.customerEmail || user?.email || '',
        customer_phone: storedContact.customerPhone || '',
        billing_address: storedContact.billingAddress,
        shipping_address: storedContact.shippingAddress,
        created_at: order.created_at || order.completed_at || null,
        completed_at: order.completed_at || null,
      };
    });

    const stats = {
      totalOrders: formattedOrders.length,
      totalRevenue: formattedOrders.reduce(
        (sum, order) => sum + Number(order.amount || 0),
        0
      ),
      totalCustomers: new Set(
        formattedOrders
          .map((order) => order.customer_email)
          .filter(Boolean)
      ).size,
      pendingOrders: formattedOrders.filter(
        (order) => String(order.status).toLowerCase() === 'pending'
      ).length,
    };

    return NextResponse.json(
      {
        orders: formattedOrders,
        stats,
        source: 'supabase',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[ADMIN_ORDERS] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch admin orders.',
        details: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
