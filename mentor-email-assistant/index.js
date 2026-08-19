// index.js - Main entry point
// Loads environment variables and runs/schedules the email processor.

import 'dotenv/config';
import { scrapeAndProcessEmails } from './src/processor.js';
import { processCalendarReminders } from './src/calendarOverview.js';

const today = new Date();
const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday

console.log('Mentor Email Assistant started.');

let isProcessing = false;

const processEmailsAndCalendar = async () => {
  if (isProcessing) {
    console.log('Previous run still in progress. Skipping this cycle.');
    return;
  }

  isProcessing = true;

  try {
    let scrapedEmails = [];
    
    // 1. Incoming email scraper (Runs on Mondays, gathers emails)
    if (dayOfWeek === 1) {
      console.log('Today is Monday. Scraping unread emails first...');
      scrapedEmails = await scrapeAndProcessEmails();
    } else {
      console.log('Incoming email scraping is skipped (only runs on Mondays).');
    }

    // 2. Calendar overviews (Handles both Monthly on 1st, and Weekly on Mondays)
    // We pass the scrapedEmails array into the reminder so it gets attached to the bottom
    console.log('Checking for scheduled calendar overviews...');
    await processCalendarReminders(scrapedEmails);

  } catch (error) {
    console.error('Run failed:', error);
  } finally {
    isProcessing = false;
  }
};

await processEmailsAndCalendar();

console.log('Mentor Email Assistant finished.');
