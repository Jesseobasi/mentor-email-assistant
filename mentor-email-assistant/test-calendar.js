import fs from 'fs';
import { getUpcomingEvents, formatCalendarOverviewHtml } from './src/calendarOverview.js';

// Test 1: Weekly (Mocking Aug 24, 2026 - A Monday)
const testDate1 = new Date('2026-08-24T00:00:00');
const upcomingWeekEvents = getUpcomingEvents(7, testDate1); 
const htmlWeek = formatCalendarOverviewHtml('Weekly Academic Reminder', upcomingWeekEvents);
fs.writeFileSync('./test-weekly.html', htmlWeek);
console.log('Generated test-weekly.html (Mocked Date: Aug 24, 2026)');

// Test 2: Monthly (Mocking Dec 1, 2026)
const testDate2 = new Date('2026-12-01T00:00:00');
const upcomingMonthEvents = getUpcomingEvents(30, testDate2);
const htmlMonth = formatCalendarOverviewHtml('Monthly Academic Overview', upcomingMonthEvents);
fs.writeFileSync('./test-monthly.html', htmlMonth);
console.log('Generated test-monthly.html (Mocked Date: Dec 1, 2026)');
