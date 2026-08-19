import 'dotenv/config';
import { parse } from 'csv-parse/sync';

export const fetchAcademicCalendar = async () => {
  const url = process.env.CALENDAR_CSV_URL;
  if (!url) {
    console.log('No CALENDAR_CSV_URL provided in secrets. Calendar will be empty.');
    return [];
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error fetching calendar! status: ${response.status}`);
    }
    const text = await response.text();
    
    // Parse the CSV robustly
    const records = parse(text, {
      columns: true,     // Treat first row as headers
      skip_empty_lines: true,
      trim: true
    });

    const events = [];
    
    for (const record of records) {
      // Look for flexible column names
      const date = record['Date'] || record['date'] || record['DATE'] || record[Object.keys(record)[0]];
      const endDate = record['EndDate'] || record['End Date'] || record['enddate'] || record['endDate'] || '';
      const name = record['Name'] || record['name'] || record['Title'] || record['Event'] || record[Object.keys(record)[Object.keys(record).length - 1]];

      if (date && name) {
        const event = { date, name };
        if (endDate) {
          event.endDate = endDate;
        }
        events.push(event);
      }
    }
    
    console.log(`Successfully loaded ${events.length} dynamic calendar events.`);
    return events;
    
  } catch (error) {
    console.error('Failed to parse calendar CSV:', error);
    return []; // Return empty array so the app doesn't crash, just sends no events
  }
};
