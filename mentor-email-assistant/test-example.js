import fs from 'fs';
import { summarizeEmail } from './src/ai.js';
import { formatEmailContent } from './src/processor.js';

const runTest = async () => {
  const dummySubject = "Important: Scholarship Application Deadline Extended!";
  const dummyBody = `Dear Students,

We are writing to let you know that the deadline for the Fall 2026 Merit Scholarship has been extended. The new deadline is August 31st, 2026. Please make sure to submit all your documents, including your transcript and the recommendation letters, before this date. 

This is a great opportunity to get up to $5,000 for your tuition. You can apply directly through the university portal. 

Best regards,
Financial Aid Office`;

  console.log("Mocking an incoming email:");
  console.log("Subject:", dummySubject);
  console.log("Body length:", dummyBody.length, "characters\\n");

  // Summarize the email
  const summaryJson = await summarizeEmail(dummyBody, dummySubject);
  console.log("Generated Summary Object:");
  console.log(JSON.stringify(summaryJson, null, 2));

  // Format into HTML
  const htmlOutput = formatEmailContent(summaryJson);
  
  // Write to a file so we can view it
  const outputPath = './test-output.html';
  fs.writeFileSync(outputPath, htmlOutput);
  
  console.log(`\\nSuccess! HTML output written to: ${outputPath}`);
  console.log("Open this file in your browser to see what the email looks like!");
};

runTest().catch(console.error);
