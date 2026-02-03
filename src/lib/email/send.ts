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

const getResend = () => new Resend(requireEnv('RESEND_API_KEY'));

export async function sendEmail(args: SendEmailArgs) {
  const from = requireEnv('RESEND_FROM');
  const resend = getResend();

  const result = await resend.emails.send({
    from,
    to: args.to,
    subject: args.subject,
    html: args.html,
    replyTo: args.replyTo,
  });

  // If Resend returns an error, surface it clearly
  // (Codex-friendly debugging)
  const resultWithError = result as { error?: { message?: string } } | undefined;
  if (resultWithError?.error) {
    throw new Error(`Resend error: ${resultWithError.error.message || JSON.stringify(resultWithError.error)}`);
  }

  return result;
}
