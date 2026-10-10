import "server-only";

export type PayPalEnvironment = "sandbox" | "live";

export type PayPalOrder = {
  id: string;
  status: string;
  payer?: { payer_id?: string };
  purchase_units?: Array<{
    reference_id?: string;
    custom_id?: string;
    amount?: { currency_code?: string; value?: string };
    payments?: {
      captures?: Array<{
        id: string;
        status: string;
        amount?: { currency_code?: string; value?: string };
      }>;
    };
  }>;
  links?: Array<{ href: string; rel: string; method?: string }>;
};

type PayPalWebhookVerification = { verification_status?: string };

function configuredEnvironment(): PayPalEnvironment | null {
  const value = process.env.PAYPAL_ENVIRONMENT;
  return value === "sandbox" || value === "live" ? value : null;
}

export function hasPayPalConfiguration() {
  return Boolean(
    configuredEnvironment()
      && process.env.PAYPAL_CLIENT_ID
      && process.env.PAYPAL_CLIENT_SECRET,
  );
}

export function hasPayPalWebhookConfiguration() {
  return hasPayPalConfiguration() && Boolean(process.env.PAYPAL_WEBHOOK_ID);
}

export function getPayPalApiBaseUrl(environment = configuredEnvironment()) {
  if (!environment) throw new Error("PayPal environment is not configured.");
  return environment === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
}

function getPayPalCredentials() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!configuredEnvironment() || !clientId || !clientSecret) {
    throw new Error("PayPal is not configured.");
  }
  return { clientId, clientSecret };
}

async function getPayPalAccessToken() {
  const { clientId, clientSecret } = getPayPalCredentials();
  const response = await fetch(`${getPayPalApiBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Unable to authenticate with PayPal.");
  const payload = (await response.json()) as { access_token?: string };
  if (!payload.access_token) throw new Error("PayPal did not return an access token.");
  return payload.access_token;
}

async function paypalRequest<T>(
  path: string,
  init: { method: "GET" | "POST"; body?: unknown; requestId?: string },
): Promise<T> {
  const accessToken = await getPayPalAccessToken();
  const response = await fetch(`${getPayPalApiBaseUrl()}${path}`, {
    method: init.method,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(init.requestId ? { "PayPal-Request-Id": init.requestId } : {}),
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`PayPal request failed with status ${response.status}.`);
  return (await response.json()) as T;
}

export async function createPayPalOrder(input: {
  internalOrderId: string;
  orderNumber: string;
  amountCents: number;
  currency: string;
  description: string;
  returnUrl: string;
  cancelUrl: string;
}) {
  const order = await paypalRequest<PayPalOrder>("/v2/checkout/orders", {
    method: "POST",
    requestId: input.internalOrderId,
    body: {
      intent: "CAPTURE",
      purchase_units: [{
        reference_id: input.internalOrderId,
        custom_id: input.internalOrderId,
        invoice_id: input.orderNumber,
        description: input.description.slice(0, 127),
        amount: {
          currency_code: input.currency.toUpperCase(),
          value: (input.amountCents / 100).toFixed(2),
        },
      }],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: "BoostingPedia",
            shipping_preference: "NO_SHIPPING",
            user_action: "PAY_NOW",
            return_url: input.returnUrl,
            cancel_url: input.cancelUrl,
          },
        },
      },
    },
  });
  const approvalUrl = order.links?.find((link) => link.rel === "payer-action" || link.rel === "approve")?.href;
  if (!order.id || !approvalUrl) throw new Error("PayPal did not return an approval URL.");
  return { order, approvalUrl };
}

export function capturePayPalOrder(paypalOrderId: string) {
  return paypalRequest<PayPalOrder>(`/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, {
    method: "POST",
    requestId: `${paypalOrderId}-capture`,
    body: {},
  });
}

export function getPayPalOrder(paypalOrderId: string) {
  return paypalRequest<PayPalOrder>(`/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}`, { method: "GET" });
}

export async function verifyPayPalWebhookSignature(input: {
  transmissionId: string;
  transmissionTime: string;
  certUrl: string;
  authAlgo: string;
  transmissionSig: string;
  webhookEvent: unknown;
}) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) throw new Error("PayPal webhook is not configured.");
  const verification = await paypalRequest<PayPalWebhookVerification>(
    "/v1/notifications/verify-webhook-signature",
    {
      method: "POST",
      body: {
        transmission_id: input.transmissionId,
        transmission_time: input.transmissionTime,
        cert_url: input.certUrl,
        auth_algo: input.authAlgo,
        transmission_sig: input.transmissionSig,
        webhook_id: webhookId,
        webhook_event: input.webhookEvent,
      },
    },
  );
  return verification.verification_status === "SUCCESS";
}
