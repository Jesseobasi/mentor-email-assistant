import fs from 'fs/promises';
import path from 'path';
import process from 'process';

const PROCESSED_FILE_PATH = path.join(process.cwd(), 'processed.json');

export const getProcessedEmails = async () => {
  try {
    const data = await fs.readFile(PROCESSED_FILE_PATH, 'utf8');
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) {
      console.error(`Invalid processed email store format in ${PROCESSED_FILE_PATH}; expected array.`);
      return [];
    }
    return parsed;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    console.error('Failed to read processed emails:', error);
    throw error;
  }
};

export const markAsProcessed = async (emailId) => {
  try {
    const processed = await getProcessedEmails();
    if (!processed.includes(emailId)) {
      processed.push(emailId);
      await fs.writeFile(PROCESSED_FILE_PATH, JSON.stringify(processed, null, 2));
    }
  } catch (error) {
    console.error(`Failed to mark email as processed (${emailId}):`, error);
    throw error;
  }
};
