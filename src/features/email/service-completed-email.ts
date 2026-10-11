import { siteConfig } from "@/config/site";

export interface ServiceCompletedEmailInput {
  orderId: string;
  orderNumber: string;
  serviceName: string;
  recipientName: string;
  recipientEmail: string;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function serializeTrustpilotData(input: ServiceCompletedEmailInput) {
  return JSON.stringify({
    recipientName: input.recipientName,
    recipientEmail: input.recipientEmail,
    referenceId: input.orderNumber,
  })
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");
}

export function buildServiceCompletedEmail(input: ServiceCompletedEmailInput) {
  const orderUrl = `${siteConfig.url}/dashboard/orders/${encodeURIComponent(input.orderId)}`;
  const supportUrl = `${siteConfig.url}/contact`;
  const subject = `Your BoostingPedia order ${input.orderNumber} is complete`;
  const trustpilotData = serializeTrustpilotData(input);

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;background:#050807;color:#f4f7f5;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#050807;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#0b100e;border:1px solid #223029;border-radius:16px;overflow:hidden;">
            <tr><td style="height:4px;background:#39e56f;font-size:0;line-height:0;">&nbsp;</td></tr>
            <tr>
              <td style="padding:32px 32px 16px;">
                <p style="margin:0;color:#82f5a4;font-size:12px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;">BoostingPedia</p>
                <h1 style="margin:14px 0 0;color:#f4f7f5;font-size:28px;line-height:1.2;">Your service is complete</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 32px;">
                <p style="margin:0 0 16px;color:#c8d1cc;font-size:16px;line-height:1.6;">Hello ${escapeHtml(input.recipientName)},</p>
                <p style="margin:0 0 22px;color:#c8d1cc;font-size:16px;line-height:1.6;">Your BoostingPedia service has been marked as complete.</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;background:#07100b;border:1px solid #1d3426;border-radius:12px;">
                  <tr><td style="padding:18px 20px;border-bottom:1px solid #1d3426;color:#8d9992;font-size:13px;">Order</td><td align="right" style="padding:18px 20px;border-bottom:1px solid #1d3426;color:#f4f7f5;font-size:14px;font-weight:700;">${escapeHtml(input.orderNumber)}</td></tr>
                  <tr><td style="padding:18px 20px;color:#8d9992;font-size:13px;">Service</td><td align="right" style="padding:18px 20px;color:#f4f7f5;font-size:14px;font-weight:700;">${escapeHtml(input.serviceName)}</td></tr>
                </table>
                <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius:10px;background:#39e56f;"><a href="${escapeHtml(orderUrl)}" style="display:inline-block;padding:13px 20px;color:#071109;font-size:14px;font-weight:700;text-decoration:none;">View order details</a></td></tr></table>
                <p style="margin:24px 0 0;color:#8d9992;font-size:13px;line-height:1.6;">Need help? <a href="${escapeHtml(supportUrl)}" style="color:#82f5a4;text-decoration:underline;">Contact BoostingPedia Support</a>.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <script type="application/json+trustpilot">${trustpilotData}</script>
  </body>
</html>`;

  const text = [
    `Hello ${input.recipientName},`,
    "",
    "Your BoostingPedia service has been marked as complete.",
    `Order: ${input.orderNumber}`,
    `Service: ${input.serviceName}`,
    "",
    `View order details: ${orderUrl}`,
    `Support: ${supportUrl}`,
  ].join("\n");

  return { subject, html, text, orderUrl, supportUrl };
}
