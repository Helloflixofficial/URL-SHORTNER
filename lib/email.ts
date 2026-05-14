import { Resend } from 'resend';

// Provide a fallback or non-breaking default if API key is not yet set
const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder_123');

export async function sendPasswordResetEmail(email: string, resetToken: string, baseUrl: string) {
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

  try {
    const data = await resend.emails.send({
      from: 'Linksite <noreply@linksite.io>', // Update this to verified domain later
      to: email,
      subject: 'Reset Your Password - Linksite',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your password for your Linksite account.</p>
          <p>Click the button below to set a new password. This link will expire in 24 hours.</p>
          <div style="margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #999; font-size: 12px;">Linksite Team</p>
        </div>
      `,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}
