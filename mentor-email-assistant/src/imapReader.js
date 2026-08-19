import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import 'dotenv/config';

export const fetchUnreadEmails = async () => {
  const { SENDER_EMAIL, APP_PASSWORD } = process.env;
  if (!SENDER_EMAIL || !APP_PASSWORD) {
    throw new Error('SENDER_EMAIL or APP_PASSWORD not defined in environment variables');
  }

  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: {
      user: SENDER_EMAIL,
      pass: APP_PASSWORD
    },
    logger: false
  });

  // Handle connection errors gracefully without crashing the app
  client.on('error', err => {
    console.error('IMAP Connection error (ignoring):', err.message);
  });

  const unreadEmails = [];

  try {
    await client.connect();

    // Select the inbox
    const lock = await client.getMailboxLock('INBOX');
    try {
      // Calculate date 7 days ago
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      // Find all unread emails from the last 7 days
      const messages = client.fetch({ seen: false, since: oneWeekAgo }, { source: true, uid: true });
      
      for await (let message of messages) {
        if (!message.source) continue;
        
        // Parse the raw email source into usable text/html
        const parsed = await simpleParser(message.source);
        
        unreadEmails.push({
          id: message.uid.toString(),
          subject: parsed.subject || '(No Subject)',
          body: parsed.text || ''
        });
      }
    } finally {
      lock.release();
    }
  } catch (error) {
    console.error('IMAP fetch error:', error);
    throw error;
  } finally {
    await client.logout();
  }

  return unreadEmails;
};
