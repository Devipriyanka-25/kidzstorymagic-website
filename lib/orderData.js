function normalizeText(value) {
  const normalized = String(value || '').trim();
  return normalized || null;
}

export function normalizeOrderAddress(address = null, extras = {}) {
  const normalized = {
    name: normalizeText(extras?.name),
    email: normalizeText(extras?.email),
    phone: normalizeText(extras?.phone),
    line1: normalizeText(address?.line1),
    line2: normalizeText(address?.line2),
    city: normalizeText(address?.city),
    state: normalizeText(address?.state),
    postalCode: normalizeText(address?.postal_code || address?.postalCode),
    country: normalizeText(address?.country),
  };

  return Object.values(normalized).some(Boolean) ? normalized : null;
}

export function buildOrderContactDetails(session = {}) {
  const customerName =
    normalizeText(session?.customer_details?.name) ||
    normalizeText(session?.shipping_details?.name) ||
    normalizeText(session?.metadata?.buyerName);
  const customerEmail =
    normalizeText(session?.customer_details?.email) ||
    normalizeText(session?.metadata?.userEmail);
  const customerPhone =
    normalizeText(session?.customer_details?.phone) ||
    normalizeText(session?.shipping_details?.phone) ||
    normalizeText(session?.metadata?.buyerPhone);

  const billingAddress = normalizeOrderAddress(session?.customer_details?.address, {
    name: customerName,
    email: customerEmail,
    phone: customerPhone,
  });
  const shippingAddress = normalizeOrderAddress(session?.shipping_details?.address, {
    name:
      normalizeText(session?.shipping_details?.name) ||
      customerName,
    phone:
      normalizeText(session?.shipping_details?.phone) ||
      customerPhone,
  });

  return {
    customerName,
    customerEmail,
    customerPhone,
    billingAddress,
    shippingAddress,
  };
}

export function readStoredOrderContactDetails(order = null) {
  const metadata =
    order?.metadata && typeof order.metadata === 'object' ? order.metadata : null;

  const customerName =
    normalizeText(order?.customer_name) ||
    normalizeText(metadata?.customerName);
  const customerEmail =
    normalizeText(order?.customer_email) ||
    normalizeText(metadata?.customerEmail);
  const customerPhone =
    normalizeText(order?.customer_phone) ||
    normalizeText(metadata?.customerPhone);

  const billingAddress = normalizeOrderAddress(
    order?.billing_address || metadata?.billingAddress,
    {
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
    }
  );
  const shippingAddress = normalizeOrderAddress(
    order?.shipping_address || metadata?.shippingAddress,
    {
      name:
        normalizeText(order?.shipping_address?.name) ||
        normalizeText(metadata?.shippingAddress?.name) ||
        customerName,
      phone:
        normalizeText(order?.shipping_address?.phone) ||
        normalizeText(metadata?.shippingAddress?.phone) ||
        customerPhone,
    }
  );

  return {
    customerName,
    customerEmail,
    customerPhone,
    billingAddress,
    shippingAddress,
  };
}

export function formatOrderAddressLines(address) {
  if (!address) {
    return [];
  }

  const locality = [address.city, address.state].filter(Boolean).join(', ');
  const localityLine = [locality, address.postalCode].filter(Boolean).join(' ');

  return [
    address.name,
    address.line1,
    address.line2,
    localityLine,
    address.country,
  ].filter(Boolean);
}

export function formatOrderAddressInline(address) {
  return formatOrderAddressLines(address).join(', ');
}
