# Mentor Email Assistant

This is an automated email assistant for mentors, designed to fetch unread emails using the Gmail API, process them into a simple summary template, and send or draft the responses. It is designed to be run periodically via a system cron job or manual execution.

## Setup Instructions

1. Clone or download this repository.
2. Ensure you have Node.js installed.
3. Run `npm install` to install dependencies.
4. Copy `.env.example` to `.env` and fill in the required API keys and configuration.
5. Create a Google Cloud project to get your Gmail API credentials.

## Running the App

To run the application, use the following command:

```bash
npm start
```
(Or run `node index.js`)

This project provides the base functionality to read and format emails without relying on paid AI services. You can set it up to run periodically using your operating system's task scheduler (e.g., cron or Windows Task Scheduler).
