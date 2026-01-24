import { Resend } from 'resend';

type SendEmailArgs = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

const resend = new Resend(requireEnv('RESEND_API_KEY'));

export async function sendEmail(args: SendEmailArgs) {
  const from = requireEnv('RESEND_FROM');

  const result = await resend.emails.send({
    from,
    to: args.to,
    subject: args.subject,
    html: args.html,
    replyTo: args.replyTo,
  });

  // If Resend returns an error, surface it clearly
  // (Codex-friendly debugging)
  // @ts-expect-error - Resend response typing varies by version
  if (result?.error) {
    // @ts-expect-error
    throw new Error(`Resend error: ${result.error.message || JSON.stringify(result.error)}`);
  }

  return result;
}
