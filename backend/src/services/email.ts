import crypto from "node:crypto";
import nodemailer from "nodemailer";
import { appsScriptConfigured, callAppsScript } from "./appsScript";

interface NotificationEmail {
  subject: string;
  text: string;
  /** Optional rich version; mail clients show this and fall back to `text`. */
  html?: string;
  /** e.g. the client's email, so "Reply" in Gmail goes straight to them. */
  replyTo?: string;
}

type SendResult = { sent: boolean; reason?: string };

const SENDER_NAME = "Nature & Culture GB Website";

let transporter: ReturnType<typeof nodemailer.createTransport> | null | undefined;

/**
 * Lazily builds (and caches) an SMTP transporter from env vars, or null when
 * SMTP isn't configured. Short timeouts: where outbound SMTP is blocked
 * (Render's free tier) a connect otherwise hangs for two minutes.
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
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  return transporter;
}

/**
 * Sends a business notification email (new trip lead, closed booking, new
 * contact message) to NOTIFICATION_EMAIL_TO. Never throws — a failed or
 * unconfigured send is logged and reported via the return value; the lead/
 * message is already safely stored in the DB by the time this is called.
 *
 * Preferred route: the Google Apps Script web app, which sends from the
 * client's own Gmail over HTTPS (works on Render, whose free tier blocks
 * SMTP). SMTP (e.g. Gmail with an App Password) is the fallback when the
 * web app isn't configured.
 */
export async function sendNotificationEmail({ subject, text, html, replyTo }: NotificationEmail): Promise<SendResult> {
  const to = process.env.NOTIFICATION_EMAIL_TO;
  if (!to) {
    console.log(`[email:dev] NOTIFICATION_EMAIL_TO not set — would send "${subject}":\n${text}`);
    return { sent: false, reason: "NOTIFICATION_EMAIL_TO not set" };
  }

  if (appsScriptConfigured()) {
    // The id lets the script drop a repeat if a retry follows a send whose reply timed out.
    const result = await callAppsScript("email", {
      id: crypto.randomUUID(),
      to,
      subject,
      text,
      html,
      replyTo,
      name: SENDER_NAME,
    });
    return result.ok ? { sent: true } : { sent: false, reason: result.reason };
  }

  const client = getTransporter();
  if (!client) {
    console.log(`[email:dev] Email not configured — would send "${subject}":\n${text}`);
    return { sent: false, reason: "email not configured" };
  }

  try {
    await client.sendMail({ from: `"${SENDER_NAME}" <${process.env.SMTP_USER}>`, to, subject, text, html, replyTo });
    return { sent: true };
  } catch (err) {
    console.error("Failed to send notification email:", err);
    return { sent: false, reason: "send failed" };
  }
}

/**
 * For public form handlers: respond to the visitor immediately and send in
 * the background, so a slow or unavailable mail route never makes a client
 * wait on "Submitting…".
 */
export function sendNotificationEmailInBackground(email: NotificationEmail): void {
  void sendNotificationEmail(email);
}
