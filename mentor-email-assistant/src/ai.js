import { GoogleGenAI, Type } from '@google/genai';
import 'dotenv/config';

// Initialize the API client. It automatically uses process.env.GEMINI_API_KEY
const ai = new GoogleGenAI();

export const summarizeEmail = async (emailText, emailSubject) => {
  try {
    const prompt = `You are a mentor assistant analyzing an email from Morgan State University.
The email subject is: "${emailSubject}"
The email body is:
"""
${emailText}
"""

Instructions:
1. Summarize the announcement for a group of mentees.
2. STRICTLY REDACT and remove any Personally Identifiable Information (PII) including student names, ID numbers, grades, GPA, or personal academic/disciplinary situations.
3. If the email contains highly sensitive personal information that cannot be generalized safely, set urgency to "Skip" to drop the email.
4. Extract any important links and deadlines into the notes array.
5. Provide urgency as either "High" (important deadlines/opportunities), "Medium" (general info), or "Skip" (highly sensitive or irrelevant spam).
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A short, engaging title for the summary" },
            type: { type: Type.STRING, description: "Type of email e.g., Announcement, Event, Deadline" },
            urgency: { type: Type.STRING, description: "Either 'High', 'Medium', or 'Skip'" },
            summary: { type: Type.STRING, description: "A concise summary of the email with all PII completely redacted." },
            notes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Array of extracted links or deadlines" }
          },
          required: ["title", "type", "urgency", "summary", "notes"]
        }
      }
    });

    const parsedResponse = JSON.parse(response.text);
    return parsedResponse;
  } catch (error) {
    console.error('Failed to summarize email using Gemini:', error);
    // Fallback to safe skip if AI fails
    return { urgency: 'Skip' };
  }
};

export const generateReply = async (emailContent) => {
  // Not used or supported in the free tier
  return 'Thank you for your email.';
};
