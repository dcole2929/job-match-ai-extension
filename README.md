# Job Match AI Chrome Extension

A Chrome extension that helps job seekers analyze job postings and streamline their application process. Built as a proof of concept for a talk on building AI-powered Chrome extensions.

## Features

- **Job Analysis**: Compares job descriptions to your resume and performs gap analysis
- **Match Scoring**: Provides a numerical score indicating how well your resume matches the job requirements
- **Skill Development**: Offers suggestions on how to acquire missing skills
- **Form Autofill**: Automatically fills out job application forms (currently supports Greenhouse)

## Demo

<div>
    <a href="https://www.loom.com/share/55fd790f092049a48189ca0a6ed888ab">
      <p>Job Match AI - Chrome Extension - Watch Video</p>
    </a>
    <a href="https://www.loom.com/share/55fd790f092049a48189ca0a6ed888ab">
      <img style="max-width:300px;" src="https://cdn.loom.com/sessions/thumbnails/55fd790f092049a48189ca0a6ed888ab-ecf17dd665ff607b-full-play.gif">
    </a>
</div>

## Tech Stack

- Vite
- React
- Tailwind CSS
- Langchain
- pnpm

## Development Setup

1. Clone the repository
```
git clone [repository-url]
cd job-match-ai-extension
```

2. Install dependencies
```
pnpm install
```

3. Build the extension
```
pnpm run build
```

4. Load the extension in Chrome
- Open Chrome and navigate to `chrome://extensions/`
- Enable "Developer mode" in the top right
- Click "Load unpacked" and select the `dist` folder from the project

## Usage Instructions

### Initial Setup

1. **OpenAI API Key**
   - Get an API key from [OpenAI](https://platform.openai.com/api-keys)
   - Open the extension's popup and click the settings icon
   - Enter your OpenAI API key in the settings page

2. **Resume Upload**
   - In the extension settings, upload your resume (PDF format)
   - This will be stored locally in your browser and used for job analysis

3. **User Data for Autofill**
   - Fill out your personal information in the settings page
   - This data will be used to autofill job applications
   - All information is stored locally in your browser's storage
   - You can update this information at any time

### Using the Extension

1. **Job Analysis**
   - Navigate to a supported job posting (LinkedIn, Indeed, Glassdoor, or Greenhouse)
   - Click the extension icon to open the popup
   - Click "Analyze Current Job" to see your match score and skill analysis

2. **Form Autofill**
   - When on a supported application form (currently Greenhouse)
   - The extension will detect the form automatically
   - Click "Autofill Form" in the popup
   - Review the filled information before submitting

### Privacy Note

All your data (resume, personal information, and API key) is stored locally in your browser. No data is sent to external servers except when making API calls to OpenAI for job analysis.

## Important Note

This is a proof of concept implementation created for a technical talk. While functional, it is not feature-complete and is meant to demonstrate the possibilities of AI-powered Chrome extensions.

## Full Version Coming Soon

We are developing a full-featured version of this tool that will be integrated with our career coaching platform at [www.evalx.dev](https://www.evalx.dev). The complete version will include:

## Contributing

This is a demonstration project and is not actively maintained. However, you're welcome to fork it and build upon it for your own purposes.

## License

MIT License

Copyright (c) 2024 EvalX

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
