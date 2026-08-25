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
  const apiKey = functions.config().resend?.api_key;
  const fromEmail = functions.config().resend?.from_email || 'noreply@unior.edu.bo';
  const fromName = functions.config().resend?.from_name || 'UNIOR Auditorio';

  if (!apiKey) {
    throw new Error('Resend API key not configured. Run: firebase functions:config:set resend.api_key="YOUR_KEY"');
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
    console.error('Resend API error:', error);
    throw new Error(`Failed to send email: ${error}`);
  }

  const result = await response.json();
  console.log('Email sent successfully:', result.id);
}
