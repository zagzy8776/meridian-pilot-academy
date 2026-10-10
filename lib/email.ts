import { Resend } from 'resend';

// Resend transactional email. When RESEND_API_KEY is set, real emails are sent.
// Without a key we log the message to the console instead of throwing, so local
// development and preview builds keep working — but production MUST set the key
// (see the guard below) or applicants will never receive confirmations.
const apiKey = process.env.RESEND_API_KEY ?? '';
const from =
  process.env.EMAIL_FROM ?? 'Meridian Aviation Academy <onboarding@resend.dev>';
const adminNotify = process.env.ADMIN_NOTIFY_EMAIL ?? '';
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const emailEnabled = Boolean(apiKey);

// Warn loudly (once per process) if email is unconfigured in production.
if (!apiKey && process.env.NODE_ENV === 'production') {
  console.warn(
    '[email] RESEND_API_KEY is not set. Transactional emails (payment received, ' +
      'approval, interview confirmation) will NOT be delivered. Set RESEND_API_KEY ' +
      'and EMAIL_FROM before going live.',
  );
}

let client: Resend | null = null;
function resend(): Resend | null {
  if (!apiKey) return null;
  if (!client) client = new Resend(apiKey);
  return client;
}

export type MailInput = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
};

// Returns true when the message was accepted by the provider.
export async function sendMail(input: MailInput): Promise<boolean> {
  const rc = resend();
  if (!rc) {
    console.log('[email:skipped] RESEND_API_KEY not set.', {
      to: input.to,
      subject: input.subject,
    });
    return false;
  }
  try {
    const { error } = await rc.emails.send({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      replyTo: input.replyTo,
    });
    if (error) {
      console.error('[email] provider rejected message:', error.message ?? error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('[email] send failed:', e);
    return false;
  }
}

// Notify the recruiter mailbox about a candidate event (payment, approval…).
export async function notifyAdmin(subject: string, html: string) {
  if (!adminNotify) return false;
  return sendMail({ to: adminNotify, subject, html });
}

function shell(title: string, body: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f4f7fb;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px">
    <div style="font-weight:800;font-size:20px;color:#0a2342;letter-spacing:.02em">MERIDIAN <span style="color:#c8962e">AVIATION ACADEMY</span></div>
    <div style="background:#fff;border:1px solid #e3ebf3;border-radius:14px;padding:28px;margin-top:18px;color:#22374d;font-size:15px;line-height:1.6">
      <h1 style="margin:0 0 14px;font-size:20px;color:#0a2342">${title}</h1>
      ${body}
    </div>
    <p style="color:#7b8ba0;font-size:12px;margin-top:16px">Meridian Aviation Academy · Confidential training &amp; recruitment</p>
  </div></body></html>`;
}

export function paymentReceivedEmail(name: string, amountLabel: string) {
  return {
    subject: 'Payment received — your application is with our team',
    html: shell(
      `Payment received, ${name}`,
      `<p>Thank you. We've received your <strong>${amountLabel}</strong> Third Party Compliance Fee.</p>
       <p>Your application is now with our recruitment team for final approval. We'll email you as soon as it's confirmed — no further action is needed from you right now.</p>`,
    ),
  };
}

export function approvalEmail(name: string) {
  return {
    subject: 'Application approved — interview scheduling opens now',
    html: shell(
      `You're approved, ${name}`,
      `<p>Great news — your application has been approved and your compliance checks are cleared.</p>
       <p>Our team will confirm your interview slot with you shortly. Look out for the confirmation email with your calendar invitation and NDA pack.</p>`,
    ),
  };
}

export function interviewConfirmedEmail(name: string, whenLabel: string, panel: string) {
  return {
    subject: 'Interview confirmed — calendar invitation & NDA pack to follow',
    html: shell(
      `Interview confirmed, ${name}`,
      `<p>Your partner interview has been confirmed for:</p>
       <p style="background:#f4f7fb;border-radius:10px;padding:14px 16px"><strong>${whenLabel}</strong><br/><span style="color:#7b8ba0">${panel}</span></p>
       <p>A calendar invitation and NDA pack will follow by email.</p>`,
    ),
  };
}

export { appUrl };