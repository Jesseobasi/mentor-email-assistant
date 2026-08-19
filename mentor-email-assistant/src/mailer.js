import nodemailer from 'nodemailer';
import 'dotenv/config';

export const sendToGroup = async (originalSubject, formattedContent) => {
  try {
    const groupEmail = process.env.GROUP_EMAIL;
    const senderEmail = process.env.SENDER_EMAIL;
    const appPassword = process.env.APP_PASSWORD;

    if (!groupEmail) throw new Error('GROUP_EMAIL is not defined in environment variables');
    if (!senderEmail) throw new Error('SENDER_EMAIL is not defined in environment variables');
    if (!appPassword) throw new Error('APP_PASSWORD is not defined in environment variables');

    const subject = `[Mentor Update] ${originalSubject}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: senderEmail,
        pass: appPassword
      }
    });

    const mailOptions = {
      from: senderEmail,
      to: groupEmail,
      subject: subject,
      html: formattedContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Failed to send update email to group:', error);
    throw error;
  }
};
