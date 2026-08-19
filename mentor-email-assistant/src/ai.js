export const summarizeEmail = async (emailText, emailSubject) => {
  // Simple heuristic/template approach without using AI
  try {
    const summary = emailText && emailText.trim() ? emailText.substring(0, 300) + (emailText.length > 300 ? '...' : '') : 'No content available.';
    
    const notes = [];
    
    // Extract Links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const links = emailText ? emailText.match(urlRegex) || [] : [];
    const uniqueLinks = [...new Set(links)];
    if (uniqueLinks.length > 0) {
      notes.push(`Links: ${uniqueLinks.slice(0, 3).join(', ')}`);
    }

    // Extract Deadlines
    const lines = emailText ? emailText.split('\n') : [];
    const deadlines = lines.filter(line => 
      line.toLowerCase().includes('deadline') || 
      line.toLowerCase().includes('due by') || 
      line.toLowerCase().includes('due on')
    );
    if (deadlines.length > 0) {
      notes.push(`Important Deadline Info: ${deadlines[0].trim().substring(0, 100)}`);
    }

    return {
      title: emailSubject || 'New Announcement',
      type: 'Announcement',
      urgency: deadlines.length > 0 ? 'High' : 'Medium',
      date: 'Not specified',
      time: 'Not specified',
      location: 'Not specified',
      summary: summary,
      notes: notes
    };
  } catch (error) {
    console.error('Failed to summarize email:', error);
    throw error;
  }
};

export const generateReply = async (emailContent) => {
  // Not used or supported in the free tier
  return 'Thank you for your email.';
};
