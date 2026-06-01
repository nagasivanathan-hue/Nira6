import crypto from 'crypto';
import { Resend } from 'resend';

/* ═══════════════════════════════════════════════════════════
   NIRA6 — OTP Service Layer
   Generates codes and sends via Email (Resend) or SMS (Twilio)
   ═══════════════════════════════════════════════════════════ */

// ── Generate a cryptographically secure 6-digit code ──
export function generateOTP(): string {
  const code = crypto.randomInt(100000, 999999).toString();
  if (process.env.NODE_ENV !== 'production') {
    console.log(`\n[OTP DEBUG] Generated OTP Code: ${code}\n`);
  }
  return code;
}

// ── Send OTP via Email (Resend) ──
export async function sendEmailOTP(email: string, code: string, userName: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('[OTP] RESEND_API_KEY is not configured.');
    return false;
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: 'NIRA6 <onboarding@resend.dev>',
      to: email,
      subject: `${code} — Your NIRA6 Login Code`,
      html: `
        <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0A0A0A; border-radius: 16px; padding: 40px; color: #fff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #FFDA03; font-size: 28px; margin: 0; letter-spacing: 4px; font-weight: 900;">NIRA6</h1>
            <p style="color: #888; font-size: 12px; margin-top: 6px; text-transform: uppercase; letter-spacing: 2px;">Creator Marketplace</p>
          </div>
          
          <p style="color: #ccc; font-size: 14px; line-height: 1.6;">Hey ${userName},</p>
          <p style="color: #ccc; font-size: 14px; line-height: 1.6;">Use this verification code to complete your sign-in:</p>
          
          <div style="background: #1a1a1a; border: 2px solid #FFDA03; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
            <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #FFDA03; font-family: monospace;">${code}</span>
          </div>
          
          <p style="color: #888; font-size: 12px; line-height: 1.6;">This code expires in <strong style="color: #FFDA03;">5 minutes</strong>. Do not share this code with anyone.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #222; text-align: center;">
            <p style="color: #555; font-size: 10px; text-transform: uppercase; letter-spacing: 2px;">Secure login powered by NIRA6</p>
          </div>
        </div>
      `,
    });
    console.log(`[OTP] Email sent to ${email}`);
    return true;
  } catch (err) {
    console.error('[OTP] Failed to send email:', err);
    return false;
  }
}

// ── Send OTP via SMS (Twilio) ──
export async function sendSmsOTP(phone: string, code: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || authToken === 'your_twilio_auth_token_here' || !fromNumber) {
    console.warn('[OTP] Twilio is not fully configured. SMS OTP skipped.');
    return false;
  }

  try {
    // Dynamic import to avoid build issues if twilio isn't configured
    const twilio = (await import('twilio')).default;
    const client = twilio(accountSid, authToken);
    
    await client.messages.create({
      body: `Your NIRA6 login code is: ${code}. Valid for 5 minutes. Do not share this code.`,
      from: fromNumber,
      to: phone,
    });
    console.log(`[OTP] SMS sent to ${phone}`);
    return true;
  } catch (err) {
    console.error('[OTP] Failed to send SMS:', err);
    return false;
  }
}
