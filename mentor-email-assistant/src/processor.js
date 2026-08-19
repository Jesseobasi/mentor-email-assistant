import { summarizeEmail } from './ai.js';

import { getProcessedEmails, markAsProcessed } from './storage.js';
import { fetchUnreadEmails } from './imapReader.js';

export const scrapeAndProcessEmails = async () => {
  try {
    console.log('Starting incoming email scraper workflow...');

    const processedEmails = await getProcessedEmails();
    const processedEmailSet = new Set(processedEmails);
    const unreadEmails = await fetchUnreadEmails();
    const scrapedSummaries = [];

    console.log(`Found ${unreadEmails.length} unread emails.`);

    for (const email of unreadEmails) {
      if (processedEmailSet.has(email.id)) {
        console.log(`Skipping already processed email: ${email.id}`);
        continue;
      }

      if (!email.body || !email.body.trim()) {
        console.log(`Skipping email with missing/empty body: ${email.id}`);
        continue;
      }

      console.log(`Processing incoming email: ${email.id} - ${email.subject}`);

      try {
        const summaryJson = await summarizeEmail(email.body, email.subject);
        if (!summaryJson || !summaryJson.summary || !summaryJson.summary.trim()) {
          console.log(`Skipping email due to empty heuristic response: ${email.id}`);
          continue;
        }

        // Only aggregate 'important' emails (those with deadlines/High urgency)
        if (summaryJson.urgency === 'High') {
          scrapedSummaries.push(summaryJson);
          console.log(`Successfully extracted and aggregated HIGH priority email: ${email.id}`);
        } else if (summaryJson.urgency === 'Skip') {
          console.log(`Skipping highly sensitive or spam email: ${email.id}`);
        } else {
          console.log(`Skipping low/medium priority email: ${email.id}`);
        }
        
        // Still mark as processed so we don't scan it again
        await markAsProcessed(email.id);
        processedEmailSet.add(email.id);

        console.log(`Successfully extracted and aggregated email: ${email.id}`);
      } catch (error) {
        console.error(`Failed to process email ${email.id}:`, error);
      }
    }
    
    return scrapedSummaries;
  } catch (error) {
    console.error('Processor workflow failed:', error);
    return [];
  } finally {
    console.log('Finished email processor workflow.');
  }
};
