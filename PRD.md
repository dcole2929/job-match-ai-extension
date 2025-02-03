# Cursor Prompt for Chrome Extension with LangChain, Vite, and pnpm

## **Project Overview**
This Chrome extension analyzes job descriptions using AI and compares them to a stored resume. It leverages **Vite** for fast development, **pnpm** for optimized dependency management, **React + Tailwind** for UI, and **LangChain** to support multiple AI models.

---

## **Prompt for Cursor - One Take**

> **Create a Chrome extension using Vite, React, Tailwind, LangChain, and pnpm** to analyze job descriptions. The extension should:
>
> 1. **Extract job descriptions** from the current tab.
> 2. **Compare the job description to a stored resume** using LangChain, allowing for **flexible model switching** (OpenAI GPT, Claude, LLaMA, etc.).
> 3. **Grade the match percentage** and display the score in the UI.
> 4. **Highlight missing skills/requirements** in the job description.
> 5. **Provide an autofill feature** for job applications.
> 6. Use **Vite** as the build tool for a **faster development environment**.
> 7. Use **pnpm** as the package manager for better dependency resolution and performance.
> 8. Use **React + Tailwind** for the frontend UI.
> 9. Use **Manifest V3** for Chrome extension compatibility.
>
> **Additional Requirements:**
> - Use LangChain’s **LLM abstraction** to allow **easy switching between OpenAI, Claude, or other models**.
> - Implement a **vector database (e.g., FAISS or Pinecone)** to store and retrieve job-related embeddings.
> - Ensure API calls **support different providers** (OpenAI, Anthropic, Hugging Face, etc.).
> - Leverage **Vite for hot module reloading and optimized builds**.
> - Utilize **pnpm** for optimized dependency management.
>
> **Folder Structure:**
> - `/` - Main extension folder
> - `/scripts` - Scripts for generating icons, etc.
> - `/public` - Stores `manifest.json`
> - `/src` - React UI components
> - `/src/background/worker.js` - Background script for tab content analysis
> - `/src/content/content.js` - Injects script into job pages
> - `/src/components/Popup.jsx` - Popup UI to show match analysis
> - `/src/autoFill.js` - Autofills application forms
> - `/src/services` - Handles LangChain-based API requests
> - `/src/options` - Handles extension settings
>
> The extension should **run when the user clicks the Chrome toolbar icon**, analyze the current job posting, and provide **AI-powered feedback on match strength** with an option to **autofill job applications**.

---

## **Setup Instructions**

### **1️⃣ Install Vite & Setup the Chrome Extension with pnpm**
```sh
# Install pnpm globally if not installed
npm install -g pnpm

# Create a new Vite project with React
pnpm create vite@latest job-match-ai-extension --template react
cd job-search-match-ai-extension
```

### **2️⃣ Create a Manifest V3 Chrome Extension**

> Create a Chrome Extension using Manifest V3 that includes:
> - A background script for handling AI processing.
> - A popup UI built with React and Tailwind.
> - A content script to extract job descriptions from the current webpage.
> - Necessary permissions for interacting with job boards and storing user data.
> - Ensure compatibility with Vite and pnpm as the build system and package manager.

### **3️⃣ Implement Resume & Job Description Matching Features**

> Implement AI-based job-resume matching using LangChain:
>
> - Extract job descriptions from the current webpage and clean/format them for AI processing.
> - Use LangChain to compare job descriptions with stored resumes, allowing for dynamic model switching (GPT-4, Claude, LLaMA, etc.).
> - Store resume embeddings using a vector database (FAISS or Pinecone).
> - Implement retrieval-augmented model (RAG) to analyze job descriptions vs. resumes.
> - Return structured feedback with keyword matches and missing qualifications.
> - Calculate a match percentage (0-100%) based on keyword and skill overlap.
> - Display the score visually (e.g., progress bar, color coding: red/yellow/green).
> - Highlight missing skills/requirements using color-coded overlays:
> - -  Green: Skills that match the resume.
> - -  Red: Requirements that are missing from the resume.
> - -  Allow users to click on missing skills to get suggestions for improvements.
> - Ensure that all UI updates occur instantly after analysis and can be toggled on/off.


### **4️⃣ Provide an Autofill Feature for Job Applications**

> Implement an autofill script that:
>
> - Detects common job application forms (Greenhouse, Workday, Lever, etc.).
> - Uses stored user data (name, email, resume, cover letter) to pre-fill fields.
> - Provides an edit option before submission.
> - Logs successful applications to prevent duplicate submissions.
> Ensure autofill works securely, storing data locally and requesting user confirmation before submitting forms.