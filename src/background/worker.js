/*global chrome */
import { analyzeJobMatch, initializeVectorStore, getSuggestionForSkill } from '../services/ai.js';

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'ANALYZE_JOB':
      handleJobAnalysis(request.data, sendResponse);
      return true;

    case 'GET_SKILL_SUGGESTIONS':
      handleSkillSuggestions(request.data, sendResponse);
      return true;

    default:
      sendResponse({ success: false, error: 'Unknown message type' });
  }
});

async function handleJobAnalysis(jobData, sendResponse) {
  try {    
    // Get resume data from chrome.storage
    const result = await chrome.storage.local.get(['resume']);
    const resumeContent = result.resume?.content;
    
    if (!resumeContent) {
      sendResponse({ 
        success: false, 
        error: 'Please upload your resume first' 
      });
      return;
    }

    // Format job data properly
    const formattedJobData = {
      title: jobData.title || '',
      description: jobData.description || '',
      requirements: Array.isArray(jobData.requirements) ? jobData.requirements : []
    };

    // Validate job data
    if (!formattedJobData.title && !formattedJobData.description && formattedJobData.requirements.length === 0) {
      console.error('Job data is empty after formatting');
      sendResponse({ 
        success: false, 
        error: 'Could not extract job data from the page. Please make sure you are on a job posting page.' 
      });
      return;
    }

    await initializeVectorStore(resumeContent);

    const analysis = await analyzeJobMatch(
      `${formattedJobData.title}\n${formattedJobData.description}\n${formattedJobData.requirements.join('\n')}`
    );

    // Store the analysis in chrome.storage
    await chrome.storage.local.set({
      [`analysis_${Date.now()}`]: {
        jobData: formattedJobData,
        analysis,
        timestamp: new Date().toISOString()
      }
    });

    sendResponse({ success: true, data: analysis });
  } catch (error) {
    console.error('Error analyzing job:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleSkillSuggestions(skill, sendResponse) {
  try {
    const suggestions = await getSuggestionForSkill(skill);
    sendResponse({ success: true, data: suggestions });
  } catch (error) {
    console.error('Error getting skill suggestions:', error);
    sendResponse({ success: false, error: error.message });
  }
}