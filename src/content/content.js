/*global chrome */
import { fillForm } from '../services/autofill';
import { detectJobForm } from '../services/formDetector';

// Job board selectors for different platforms
const SELECTORS = {
  linkedin: {
    title: '.job-details-jobs-unified-top-card__job-title',
    company: '.job-details-jobs-unified-top-card__company-name',
    description: '.jobs-description__content',
    requirements: '.jobs-box__list li',
  },
  indeed: {
    title: '.jobsearch-JobInfoHeader-title',
    company: '.jobsearch-InlineCompanyRating div',
    description: '#jobDescriptionText',
    requirements: '.jobsearch-JobDescriptionSection-sectionItem',
  },
  glassdoor: {
    title: '.job-title',
    company: '.employer-name',
    description: '.jobDescriptionContent',
    requirements: '.jobDescriptionContent li',
  },
  greenhouse: {
    title: '.app-title',
    company: '.company-name',
    description: '#content',
    requirements: '#content ul li, #content .requirements-content li, #content .list-disc li',
    // Multiple selectors for requirements as Greenhouse allows custom formatting
  },
};

function extractJobData() {
  const url = window.location.href;
  let platform = '';

  if (url.includes('linkedin.com')) platform = 'linkedin';
  else if (url.includes('indeed.com')) platform = 'indeed';
  else if (url.includes('glassdoor.com')) platform = 'glassdoor';
  else if (url.includes('greenhouse.io')) platform = 'greenhouse';
  else return null;

  const selectors = SELECTORS[platform];

  // Special handling for Greenhouse company name
  let company = '';
  if (platform === 'greenhouse') {
    // Extract company name from URL (e.g., company-name.greenhouse.io)
    const match = url.match(/\/\/(.*?)\.greenhouse\.io/);
    if (match && match[1]) {
      company = match[1].split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    } else {
      company = document.querySelector(selectors.company)?.textContent?.trim();
    }
  } else {
    company = document.querySelector(selectors.company)?.textContent?.trim();
  }

  // Extract requirements as structured data
  const requirementElements = document.querySelectorAll(selectors.requirements);
  const requirements = Array.from(requirementElements)
    .map(el => el.textContent.trim())
    .filter(text =>
      // Filter out empty items and common list items that aren't requirements
      text &&
      !text.toLowerCase().includes('apply now') &&
      !text.toLowerCase().includes('click here')
    );

  const jobData = {
    title: document.querySelector(selectors.title)?.textContent?.trim(),
    company,
    description: document.querySelector(selectors.description)?.textContent?.trim(),
    requirements,
    url: window.location.href,
    platform,
    timestamp: new Date().toISOString(),
  };

  return jobData;
}

const autofillForm = async (sendResponse) => {
  try {
    const result = await fillForm();
    if (result.errors) {
      console.error('Form fill errors:', result.errors);
    }
    sendResponse({ success: result.filled, errors: result.errors });
  } catch (error) {
    console.error('Error filling form:', error);
    sendResponse({ success: false, errors: [error.message] });
  }
};

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'EXTRACT_JOB_DATA') {
    try {
      const jobData = extractJobData();

      if (!jobData) {
        sendResponse({
          success: false,
          error: 'Unable to extract job data from this page. Please make sure you are on a supported job board.'
        });
        return false;
      }

      // Validate required fields
      if (!jobData.title && !jobData.description) {
        sendResponse({
          success: false,
          error: 'Could not find job title or description. Please make sure you are on a job posting page.'
        });
        return false;
      }

      // Send successful response with the extracted data
      sendResponse({
        success: true,
        data: jobData
      });
    } catch (error) {
      console.error('Error extracting job data:', error);
      sendResponse({
        success: false,
        error: 'Error extracting job data: ' + error.message
      });
    }
    return false;
  }

  if (request.type === 'CHECK_FORM_COMPATIBILITY') {
    try {
      const formInfo = detectJobForm();
      sendResponse({ hasForm: !!formInfo });
    } catch (error) {
      console.error('Error checking form:', error);
      sendResponse({ hasForm: false });
    }
    return false;
  }

  if (request.type === 'AUTOFILL_FORM') {
    autofillForm(sendResponse);
    return true;
  }

  return true; // Keep message channel open for async response
});
