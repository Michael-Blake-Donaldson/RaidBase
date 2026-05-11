/**
 * Email service — thin wrapper around Resend.
 * In development / when RESEND_API_KEY is not configured, emails are logged to console instead.
 */

import { getAppBaseUrl, getEmailEnv } from "@/lib/env";

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail(payload: EmailPayload): Promise<void> {
  const { apiKey, from } = getEmailEnv();

  if (!apiKey) {
    // Dev fallback — log to console so developers can copy the link
    console.info("[email:dev]", {
      to: payload.to,
      subject: payload.subject,
      snippet: payload.html.replace(/<[^>]+>/g, "").slice(0, 200),
    });
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "(unreadable)");
    throw new Error(`Resend API error ${response.status}: ${body}`);
  }
}

export async function sendEmailVerification(opts: { to: string; token: string }): Promise<void> {
  const url = `${getAppBaseUrl()}/auth/verify-email?token=${opts.token}`;
  await sendEmail({
    to: opts.to,
    subject: "Verify your RaidBase email",
    html: `
      <p>Thanks for joining RaidBase! Verify your email to activate your account.</p>
      <p><a href="${url}" style="font-weight:bold">Verify email address</a></p>
      <p>This link expires in 24 hours.</p>
      <p>If you didn't create a RaidBase account, you can safely ignore this email.</p>
      <hr/>
      <p style="font-size:12px;color:#666">Or copy this URL: ${url}</p>
    `,
  });
}

export async function sendPasswordReset(opts: { to: string; token: string }): Promise<void> {
  const url = `${getAppBaseUrl()}/auth/reset-password?token=${opts.token}`;
  await sendEmail({
    to: opts.to,
    subject: "Reset your RaidBase password",
    html: `
      <p>We received a request to reset your RaidBase password.</p>
      <p><a href="${url}" style="font-weight:bold">Reset password</a></p>
      <p>This link expires in 1 hour. If you didn't request a reset, you can safely ignore this email.</p>
      <hr/>
      <p style="font-size:12px;color:#666">Or copy this URL: ${url}</p>
    `,
  });
}
