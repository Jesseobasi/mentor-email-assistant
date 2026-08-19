import fs from 'fs';
import path from 'path';

export const fetchAcademicCalendar = async () => {
  try {
    const dbPath = path.resolve('./src/data/calendar_database.json');
    if (!fs.existsSync(dbPath)) {
      console.log('No calendar_database.json found. Calendar will be empty.');
      return [];
    }
    
    const dbContent = fs.readFileSync(dbPath, 'utf8');
    const events = JSON.parse(dbContent);
    return events;
  } catch (error) {
    console.error('Failed to read calendar database:', error);
    return [];
  }
};
