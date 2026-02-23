import { google } from 'googleapis';
import { oauth2Client } from './google';

/**
 * Encodes a message to base64url format required by Gmail API
 */
function encodeMessage(message: string) {
    return Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

/**
 * Sends an email via Gmail API
 * @param to Recipient email address
 * @param subject Email subject
 * @param htmlBody HTML content of the email
 */
export async function sendInterviewEmail(to: string, name: string, interviewLink: string) {
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const subject = "Next Steps: Your AI Interview with Lifewood PH";
    const body = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; rounded: 8px;">
            <h2 style="color: #1a1a1a;">Congratulations, ${name}!</h2>
            <p>We've received your application and would like to invite you to the next stage: the <strong>AI Pre-screening Interview</strong>.</p>
            <p>This is a unique, one-time link prepared specifically for you. Please ensure you are in a quiet environment before starting.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${interviewLink}" 
                   style="background-color: #004d40; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                    Start Your Interview
                </a>
            </div>
            
            <p style="font-size: 14px; color: #666;">
                If the button above doesn't work, copy and paste this link into your browser:<br>
                <a href="${interviewLink}">${interviewLink}</a>
            </p>

            <p style="font-size: 14px; color: #e67e22; font-weight: bold; margin-top: 20px;">
                Important Retake Policy:
            </p>
            <p style="font-size: 13px; color: #666;">
                This is a one-time link. If you experience technical issues or need to retake the interview, please email 
                <a href="mailto:lifewoodph@gmail.com">lifewoodph@gmail.com</a> to request a link reset before you can access the interview again.
            </p>
            
            <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #999;">
                This email was sent by the Lifewood PH Recruitment Team. Please do not reply to this email.
            </p>
        </div>
    `;

    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
        `To: ${to}`,
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: ${utf8Subject}`,
        '',
        body,
    ];
    const message = messageParts.join('\n');

    try {
        const encodedMessage = encodeMessage(message);
        await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedMessage,
            },
        });
        console.log(`Email sent successfully to ${to}`);
        return true;
    } catch (error) {
        console.error('Error sending email via Gmail API:', error);
        throw error;
    }
}
