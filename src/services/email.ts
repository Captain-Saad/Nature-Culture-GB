import nodemailer from "nodemailer";

interface NotificationEmail {
  subject: string;
  text: string;
}

let transporter: ReturnType<typeof nodemailer.createTransport> | null | undefined;

/**
 * Lazily builds (and caches) an SMTP transporter from env vars. Returns
 * null when SMTP isn't configured, so callers can fall back to a dev-mode
 * console log instead of crashing — this project doesn't fabricate a
 * "sent" result it can't back up, same as the honesty rule elsewhere
 * (weather/flights availability).
 */
function getTransporter() {
  if (transporter !== undefined) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
    transporter = null;
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT ?? 587),
    secure: Number(SMTP_PORT ?? 587) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  });
  return transporter;
}

/**
 * Sends a business notification email (new trip lead, new contact
 * message). Never throws — a failed or unconfigured send is logged and
 * reported back via the return value, but it must not lose the lead/
 * message, which is already safely stored in the DB by the time this
 * is called.
 */
export async function sendNotificationEmail({
  subject,
  text,
}: NotificationEmail): Promise<{ sent: boolean; reason?: string }> {
  const to = process.env.NOTIFICATION_EMAIL_TO;
  const client = getTransporter();

  if (!client || !to) {
    console.log(`[email:dev] SMTP not configured — would send "${subject}":\n${text}`);
    return { sent: false, reason: "SMTP not configured" };
  }

  try {
    await client.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      text,
    });
    return { sent: true };
  } catch (err) {
    console.error("Failed to send notification email:", err);
    return { sent: false, reason: "send failed" };
  }
}
