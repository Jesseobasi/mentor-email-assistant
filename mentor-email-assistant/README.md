# Mentor Email Assistant 🎓

An automated, AI-powered email assistant designed for mentors at Morgan State University. 

This assistant automatically fetches unread emails, uses **Google Gemini AI** to generate concise summaries while strictly redacting sensitive personal information (PII), and sends a beautifully formatted digest email (along with upcoming calendar events) to a designated group list.

It is designed to run completely automatically in the cloud using **GitHub Actions**, costing absolutely $0 in server hosting fees.

---

## ☁️ Option 1: The Cloud Setup (Recommended)
This is the easiest way to deploy the assistant. It will run automatically in the background on GitHub's servers every Monday and on the 1st of the month.

### Step 1: Fork this Repository
Click the **Fork** button at the top right of this page to create your own copy of this repository on your GitHub account.

### Step 2: Get your API Keys
You will need three things:
1. **Google Gemini API Key**: Go to [Google AI Studio](https://aistudio.google.com/) and generate a free API key.
2. **Gmail App Password**: You cannot use your normal Gmail password. Go to your Google Account Security settings, enable 2-Step Verification, and generate an **App Password**.
3. **Your Email Addresses**: You need the email address you want to send *from*, and the group list email you want to send *to*.

### Step 3: Add Secrets to GitHub
To keep your passwords safe, you must add them to GitHub Secrets.
1. In your forked repository, go to **Settings** > **Secrets and variables** > **Actions**.
2. Click **New repository secret** and add the following 4 secrets exactly as written:
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
   - `SENDER_EMAIL`: The email address you generated the App Password for (e.g., `you@morgan.edu`).
   - `APP_PASSWORD`: The 16-character App Password you generated.
   - `GROUP_EMAIL`: The email address of your mentee group (e.g., `my-mentees@morgan.edu`).

### Step 4: Turn on the Automation!
1. Go to the **Actions** tab in your repository.
2. Click on **Mentor Email Assistant Schedule** on the left.
3. Click the **Run workflow** dropdown and run it!
From now on, GitHub will automatically run the assistant for you every Monday at 8:00 AM UTC and on the 1st of the month.

---

## 💻 Option 2: The Local Setup (For Developers)
If you want to run the assistant locally on your own computer or test changes to the code:

### Prerequisites
- [Node.js](https://nodejs.org/) (Version 18 or higher)
- Git

### Installation
1. Clone your repository to your computer:
   ```bash
   git clone https://github.com/YOUR_USERNAME/mentor-email-assistant.git
   cd mentor-email-assistant/mentor-email-assistant
   ```
2. Install the required packages:
   ```bash
   npm install
   ```

### Configuration
1. Rename the `.env.example` file to `.env`:
   ```bash
   mv .env.example .env
   ```
2. Open the `.env` file and fill in your credentials (do NOT commit this file to GitHub!):
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   SENDER_EMAIL=your_email@morgan.edu
   APP_PASSWORD=your_app_password
   GROUP_EMAIL=your_mentee_group@morgan.edu
   ```

### Running the App
To run the assistant manually:
```bash
npm start
```
*Note: The script is designed to only process emails on Mondays. If you want to force it to run on any other day for testing, run it like this:*
```bash
FORCE_RUN=true npm start
```

## Security Features Built-in 🛡️
- **Morgan State Filter**: The IMAP reader strictly verifies the sender's address. Any email that does not originate from an `@morgan.edu` address is immediately discarded.
- **AI-Powered PII Redaction**: The Gemini AI is strictly instructed to scrub all Personally Identifiable Information (Names, IDs, Grades, etc.) from the summaries.
- **Auto-Skip**: If an email is deemed too highly sensitive to be safely generalized, the AI flags it as `Skip` and it is completely dropped from the digest.
