import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { GoogleGenAI, Type } from '@google/genai';

const pdfPath = path.resolve('./calendar.pdf');
const dbPath = path.resolve('./src/data/calendar_database.json');

async function parseCalendar() {
  console.log('Starting PDF to Database parsing...');
  
  if (!fs.existsSync(pdfPath)) {
    console.log('No calendar.pdf found in the root directory. Skipping parsing.');
    return;
  }

  const ai = new GoogleGenAI({});

  const pdfBase64 = fs.readFileSync(pdfPath).toString('base64');

  const prompt = `You are an expert data extraction AI.
Read the attached academic calendar PDF and extract all the important academic events.
Return the events as a JSON array of objects.

Follow these rules:
1. Ignore purely administrative faculty deadlines unless it impacts students.
2. Ensure dates are formatted strictly as YYYY-MM-DD.
3. If an event spans multiple days (e.g. "Spring Break"), include an 'endDate'.
4. Event names should be concise and clear.`;

  console.log('Sending PDF to Gemini for parsing...');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            data: pdfBase64,
            mimeType: 'application/pdf'
          }
        },
        prompt
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING, description: "YYYY-MM-DD" },
              endDate: { type: Type.STRING, description: "YYYY-MM-DD (Optional, only if the event spans multiple days)" },
              name: { type: Type.STRING }
            },
            required: ["date", "name"]
          }
        }
      }
    });

    const jsonText = response.text;
    
    // Validate it's parseable
    const events = JSON.parse(jsonText);
    
    console.log(`Successfully extracted ${events.length} events from the PDF.`);
    
    // Save to the database file
    fs.writeFileSync(dbPath, JSON.stringify(events, null, 2));
    
    console.log(`Database updated successfully at ${dbPath}.`);
    
  } catch (error) {
    console.error('Failed to parse PDF using Gemini:', error);
    process.exit(1);
  }
}

parseCalendar();
