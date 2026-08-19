import 'dotenv/config';
import { scrapeAndProcessEmails } from './src/processor.js';
import { processCalendarReminders } from './src/calendarOverview.js';

const run = async () => {
  try {
    console.log("Setting up ACTUAL inbox test...");
    
    // Reroute group email to the sender's own email so mentees don't get the test
    process.env.GROUP_EMAIL = process.env.SENDER_EMAIL;
    console.log(`Sending results directly to your inbox: ${process.env.SENDER_EMAIL}`);

    // Override Date globally just for this test so calendar logic thinks it's a Monday
    // We'll simulate Monday, Aug 24th, 2026 to guarantee a weekly calendar hit
    const OriginalDate = Date;
    global.Date = class extends OriginalDate {
      constructor(...args) {
        if (args.length) return new OriginalDate(...args);
        return new OriginalDate('2026-08-24T12:00:00Z'); 
      }
    };
    
    console.log("\n1. Scraping your ACTUAL unread emails via IMAP...");
    // This will fetch real unread emails from your inbox and process them into objects
    const scrapedEmails = await scrapeAndProcessEmails();

    console.log(`\n2. Running Weekly Calendar Overview and merging ${scrapedEmails.length} scraped emails...`);
    await processCalendarReminders(scrapedEmails);
    
    console.log("\nActual inbox test complete! Check your email.");
  } catch (error) {
    console.error("Test failed:", error);
  }
};

run().then(() => process.exit(0)).catch(() => process.exit(1));
