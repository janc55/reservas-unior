import * as functions from 'firebase-functions';

interface ResendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: string;
    encoding?: string;
  }>;
}

export async function sendEmail(options: ResendEmailOptions): Promise<void> {
  // Read API Key from process.env (functions/.env) or functions.config()
  let apiKey = process.env.RESEND_API_KEY;
  try {
    if (!apiKey) {
      apiKey = functions.config().resend?.api_key || functions.config().resend?.key;
    }
  } catch (e) {
    // functions.config() fallback
  }

  // Read From Email
  let fromEmail = process.env.RESEND_FROM_EMAIL;
  try {
    if (!fromEmail) {
      fromEmail = functions.config().resend?.from_email || functions.config().resend?.from;
    }
  } catch (e) {}

  if (!fromEmail) {
    fromEmail = 'onboarding@resend.dev';
  }

  // Read From Name
  let fromName = process.env.RESEND_FROM_NAME;
  try {
    if (!fromName) {
      fromName = functions.config().resend?.from_name || 'UNIOR Auditorio';
    }
  } catch (e) {}

  if (!fromName) {
    fromName = 'UNIOR Auditorio';
  }

  if (!apiKey) {
    throw new Error(
      'Resend API key not configured. Set RESEND_API_KEY in functions/.env or run: firebase functions:config:set resend.api_key="re_..." and re-deploy.'
    );
  }

  const to = Array.isArray(options.to) ? options.to : [options.to];

  const emailData: Record<string, unknown> = {
    from: `${fromName} <${fromEmail}>`,
    to,
    subject: options.subject,
    html: options.html,
  };

  if (options.attachments && options.attachments.length > 0) {
    emailData.attachments = options.attachments;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(emailData),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Resend API error response:', error);
    throw new Error(`Failed to send email via Resend API (${response.status}): ${error}`);
  }

  const result = await response.json();
  console.log('Email sent successfully via Resend API, id:', result.id);
}
