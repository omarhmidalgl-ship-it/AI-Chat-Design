import nodemailer from "nodemailer";

/**
 * Simulated and Real notification service for ChatPadel.
 * Automatically switches to Nodemailer if SMTP credentials are provided in .env
 */

// Configure Nodemailer Transporter
const transporter = process.env.SMTP_HOST ? nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_PORT === "465",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
}) : null;

const fromEmail = process.env.FROM_EMAIL || "noreply@chatpadel.com";

export const notifications = {
    async sendEmail(to: string, subject: string, content: string) {
        if (transporter) {
            try {
                await transporter.sendMail({
                    from: `"ChatPadel" <${fromEmail}>`,
                    to,
                    subject,
                    text: content,
                    html: content.replace(/\n/g, '<br>'),
                });
                console.log(`[EMAIL SERVICE] ✅ Real email sent to: ${to}`);
                return true;
            } catch (error) {
                console.error(`[EMAIL SERVICE] ❌ Failed to send real email:`, error);
                // Fallback to console log on error
            }
        }

        // Console Fallback (Simulated)
        console.log(`\n[EMAIL SERVICE] 📧 (FALLBACK) Sending email to: ${to}`);
        console.log(`[EMAIL SERVICE] Subject: ${subject}`);
        console.log(`[EMAIL SERVICE] Content: ${content}\n`);

        await new Promise(resolve => setTimeout(resolve, 500));
        return true;
    },

    async sendMatchJoinedEmail(email: string, fullName: string, matchDetails: { location: string; date: string; time: string }) {
        const subject = `🎾 Match Confirmation - ${matchDetails.location}`;
        const content = `Hello ${fullName}, you have successfully joined the match at ${matchDetails.location} on ${matchDetails.date} at ${matchDetails.time}. See you there!`;

        return this.sendEmail(email, subject, content);
    },

    async sendMatchJoinedSMS(phoneNumber: string, matchDetails: { location: string; date: string; time: string }) {
        console.log(`\n[SMS SERVICE] 📱 Sending SMS to: ${phoneNumber}`);
        console.log(`[SMS SERVICE] Content: ChatPadel: You're in! Match confirmed @ ${matchDetails.location}, ${matchDetails.date} ${matchDetails.time}. 🎾\n`);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));
        return true;
    },

    async sendResetPasswordEmail(email: string, resetLink: string) {
        const subject = `ChatPadel - Reset Your Password`;
        const content = `You requested a password reset. Please use the following link to reset your password:\n\n${resetLink}\n\nIf you did not request this, please ignore this email.`;

        return this.sendEmail(email, subject, content);
    }
};
