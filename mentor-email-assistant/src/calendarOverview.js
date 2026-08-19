import { academicCalendar } from './data/calendarData.js';
import { sendToGroup } from './mailer.js';

function isDateInRange(dateStr, startDate, endDate) {
  const date = new Date(dateStr);
  const start = new Date(startDate);
  const end = new Date(endDate);
  // zero out times to compare just dates
  date.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return date >= start && date <= end;
}

export function getUpcomingEvents(days, targetDate = new Date()) {
  const today = new Date(targetDate);
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + days);

  return academicCalendar.filter(event => {
    const eventStart = new Date(event.date);
    // If it has an end date, check if any part of the range falls within our window
    if (event.endDate) {
      const eventEnd = new Date(event.endDate);
      return (eventStart <= endDate && eventEnd >= today);
    }
    // Otherwise, check if the start date falls within our window
    return (eventStart >= today && eventStart <= endDate);
  });
}

export function formatCalendarOverviewHtml(title, events, scrapedEmails = []) {
  const safeStr = (str) => (str ? str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '');

  let html = `<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: 'Inter', sans-serif; background-color: #2b2b2b; color: #e2e8f0; padding: 20px; line-height: 1.6; }
  .container { max-width: 600px; margin: 0 auto; background-color: #3d3d3d; border-radius: 12px; overflow: hidden; }
  .header { background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); padding: 24px; text-align: center; }
  .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; }
  .content { padding: 32px; }
  .section-title { font-size: 18px; color: #cbd5e1; border-bottom: 1px solid #4a4a4a; padding-bottom: 8px; margin-top: 0; margin-bottom: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
  .event-list { list-style: none; padding: 0; margin: 0; margin-bottom: 32px; }
  .event-item { background-color: #4a4a4a; padding: 16px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #1e3a8a; }
  .event-date { font-size: 13px; color: #cbd5e1; font-weight: 600; text-transform: uppercase; margin-bottom: 4px; }
  .event-name { font-size: 16px; font-weight: 600; color: #f8fafc; margin: 0; margin-bottom: 8px; }
  .event-desc { font-size: 14px; color: #e2e8f0; margin: 0; }
  .notes { margin-top: 12px; padding-left: 20px; font-size: 14px; color: #cbd5e1; }
  .footer { background-color: #2b2b2b; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📅 ${safeStr(title)}</h1>
    </div>
    <div class="content">`;

  // Calendar Section
  html += `<h2 class="section-title">Academic Calendar</h2>`;
  if (events.length === 0) {
    html += `<p style="text-align: center; color: #94a3b8; margin-bottom: 32px;">No upcoming academic events in this period.</p>`;
  } else {
    html += `<ul class="event-list">`;
    events.forEach(event => {
      const dateDisplay = event.endDate 
        ? `${event.date} to ${event.endDate}` 
        : event.date;
      
      html += `
        <li class="event-item">
          <div class="event-date">${safeStr(dateDisplay)}</div>
          <h3 class="event-name">${safeStr(event.name)}</h3>
        </li>`;
    });
    html += `</ul>`;
  }

  // Scraped Emails Section
  if (scrapedEmails && scrapedEmails.length > 0) {
    html += `<h2 class="section-title">📨 Scraped Inbox Updates</h2>`;
    html += `<ul class="event-list">`;
    scrapedEmails.forEach(summaryJson => {
      html += `
        <li class="event-item">
          <div class="event-date">${safeStr(summaryJson.urgency)} Priority</div>
          <h3 class="event-name">${safeStr(summaryJson.title)}</h3>
          <p class="event-desc">${safeStr(summaryJson.summary).replace(/\\n/g, '<br>')}</p>`;
      
      if (summaryJson.notes && summaryJson.notes.length > 0) {
        html += `
          <ul class="notes">
            ${summaryJson.notes.map(note => `<li>${safeStr(note)}</li>`).join('')}
          </ul>`;
      }
      
      html += `
        </li>`;
    });
    html += `</ul>`;
  }

  html += `
    </div>
    <div class="footer">
      Automated Mentor Email Assistant
    </div>
  </div>
</body>
</html>`;

  return html;
}

export async function processCalendarReminders(scrapedEmails = []) {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday
  const dayOfMonth = today.getDate(); // 1-31

  // 1. Monthly Overview (Trigger on the 1st of the month)
  if (dayOfMonth === 1 || process.env.FORCE_RUN === 'true') {
    console.log("Triggering Overview (Monthly/Forced)...");
    const upcomingEvents = getUpcomingEvents(30);
    const html = formatCalendarOverviewHtml('Monthly Academic Overview', upcomingEvents, scrapedEmails);
    await sendToGroup('Monthly Academic Overview', html);
  }

  // 2. Weekly Reminder (Trigger every Monday)
  // We skip sending a weekly reminder if we just sent the monthly overview today (unless forced)
  else if (dayOfWeek === 1 && process.env.FORCE_RUN !== 'true') {
    console.log("Triggering Weekly Reminder...");
    const upcomingEvents = getUpcomingEvents(7);
    if (upcomingEvents.length > 0 || scrapedEmails.length > 0) {
      const html = formatCalendarOverviewHtml('Weekly Academic Reminder', upcomingEvents, scrapedEmails);
      await sendToGroup('Weekly Academic Reminder', html);
    } else {
      console.log("No upcoming events or scraped emails this week. Skipping email.");
    }
  } else if (process.env.FORCE_RUN !== 'true') {
    console.log("No calendar overview scheduled for today.");
  }
}
