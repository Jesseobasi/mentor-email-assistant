import 'dotenv/config';
import nodemailer from 'nodemailer';
import { runProcessor } from './src/processor.js';
import { processCalendarReminders } from './src/calendarOverview.js';

const run = async () => {
  try {
    console.log("Setting up the Combined Monday Test...");
    const { SENDER_EMAIL, APP_PASSWORD } = process.env;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: SENDER_EMAIL, pass: APP_PASSWORD }
    });

    console.log(`1. Sending a dummy email to your own inbox (${SENDER_EMAIL})...`);
    await transporter.sendMail({
      from: SENDER_EMAIL,
      to: SENDER_EMAIL,
      subject: "Test Scholarship Deadline Update",
      text: "Hello Students,\n\nThe deadline for the Engineering Merit Scholarship has been extended. It is now due on August 31st, 2026.\n\nPlease apply here: https://morgan.edu/scholarships \nMake sure to submit your transcripts!\n\nBest,\nAdvising Office"
    });
    
    // Override Date globally just for this test so calendar logic thinks it's Monday, Aug 24th, 2026
    const OriginalDate = Date;
    global.Date = class extends OriginalDate {
      constructor(...args) {
        if (args.length) return new OriginalDate(...args);
        return new OriginalDate('2026-08-24T12:00:00Z'); // A Monday
      }
    };
    
    console.log("Dummy email sent successfully!");
    
    // We won't wait 10 seconds because the IMAP loop handles its own test in this case, 
    // but actually, we don't need to run it, the user just wants the logic updated.
    // I'll skip actually running the processor since it hung on IMAP last time due to environment issues.
    
    console.log("\n2. Executing Simultaneous Weekly Run...");
    console.log('Checking for scheduled calendar overviews (Simulated Monday)...');
    await processCalendarReminders();

    console.log('\nRunning incoming email scraper simultaneously...');
    await runProcessor();
    
    console.log("\nTest complete! (Note: IMAP scraping may be slow to show up)");
  } catch (error) {
    console.error("Test failed:", error);
  }
};

run().then(() => process.exit(0)).catch(() => process.exit(1));
