/*global chrome */
import { useState, useEffect } from 'react';
import { BriefcaseIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import Loading from './common/Loading';
import Error from './common/Error';
import JobData from './job/JobData';
import Analysis from './analysis/Analysis';
import Autofill from './autofill/Autofill';
import Skills from './skills/Skills';

export default function Popup() {
  // Core state
  const [jobData, setJobData] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [hasResume, setHasResume] = useState(false);
  const [canAutofill, setCanAutofill] = useState(false);
  const [isValidJobPage, setIsValidJobPage] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Skills view state
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [showingSkills, setShowingSkills] = useState(false);

  useEffect(() => {
    // Check if resume exists
    chrome.storage.local.get(['resume'], (result) => {
      setHasResume(!!result.resume);
    });

    // Check if current page is a valid job page
    checkValidJobPage();
    // Check if current page has a supported form
    checkForForm();
  }, []);

  const checkValidJobPage = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) {
        throw new Error('No active tab found');
      }

      const url = tab.url;
      const isValid = url.includes('linkedin.com/jobs') ||
        url.includes('indeed.com/viewjob') ||
        url.includes('glassdoor.com/job-listing') ||
        url.includes('greenhouse.io/');

      setIsValidJobPage(isValid);
    } catch (error) {
      console.error('Error checking job page:', error);
      setIsValidJobPage(false);
    }
  };

  const checkForForm = async () => {
    try {
      // Get the current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab) {
        throw new Error('No active tab found');
      }

      // Ensure we have the necessary permissions
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });

      // Add a small delay to ensure content script is ready
      await new Promise(resolve => setTimeout(resolve, 100));

      // Now check for form
      const result = await chrome.tabs.sendMessage(tab.id, {
        type: 'CHECK_FORM_COMPATIBILITY'
      });
      setCanAutofill(result?.hasForm || false);
    } catch (error) {
      console.error('Error checking form:', error);
      setCanAutofill(false);
    }
  };

  const openOptions = () => {
    chrome.runtime.openOptionsPage();
  };

  const analyzeCurrentJob = async () => {
    setLoading(true);
    setError(null);

    try {
      // First check if we have a resume
      const { resume } = await chrome.storage.local.get(['resume']);
      if (!resume) {
        throw new Error('Please upload your resume in the extension settings first');
      }

      // Get the current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab) {
        throw new Error('No active tab found');
      }

      // Ensure we have the necessary permissions
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });

      // Extract job data from the page
      const extractResponse = await chrome.tabs.sendMessage(tab.id, {
        type: 'EXTRACT_JOB_DATA'
      });

      if (!extractResponse?.success) {
        throw new Error(extractResponse?.error || 'Failed to extract job data');
      }

      // Send job data to background script for analysis
      const analysisResponse = await chrome.runtime.sendMessage({
        type: 'ANALYZE_JOB',
        data: extractResponse.data
      });

      if (!analysisResponse?.success) {
        throw new Error(analysisResponse?.error || 'Failed to analyze job data');
      }

      setJobData(extractResponse.data);
      setAnalysis(analysisResponse.data);
    } catch (err) {
      console.error('Analysis error:', err);
      if (err.message.includes('resume')) {
        setError('Please upload your resume in Settings first');
      } else {
        setError(
          err.message === 'No active tab found'
            ? 'Please open a job posting in a new tab'
            : err.message || 'Please navigate to a supported job board and try again'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSkillClick = async (skill) => {
    setLoading(true);
    setError(null);

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GET_SKILL_SUGGESTIONS',
        data: skill,
      });

      if (response.success) {
        setSelectedSkill(skill);
        setSuggestions(response.data);
        setShowingSkills(true);
      } else {
        throw new Error('Failed to get skill suggestions');
      }
    } catch (err) {
      setError('Error getting skill suggestions');
      console.error('Error getting skill suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAutofill = async () => {
    setIsLoading(true);
    setStatus(null);

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab) {
        throw new Error('No active tab found');
      }

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });

      const result = await chrome.tabs.sendMessage(tab.id, {
        type: 'AUTOFILL_FORM'
      });

      if (result?.success) {
        setStatus({ message: 'Form filled successfully! Please review before submitting.', type: 'success' });
      } else {
        const errorMessage = result?.errors?.length
          ? `Could not fill fields: ${result.errors.join(', ')}. Please fill manually.`
          : 'Could not fill some fields. Please check and fill manually.';
        setStatus({ message: errorMessage, type: 'error' });
      }
    } catch (error) {
      console.error('Autofill error:', error);
      setStatus({
        message: 'Error filling form. Please try refreshing the page.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToAnalysis = () => {
    setShowingSkills(false);
    setSelectedSkill(null);
    setSuggestions(null);
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} onOpenSettings={openOptions} />;
  }

  return (
    <div className="p-4 w-96">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-gray-900">Job Match AI</h1>
        <button
          onClick={openOptions}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          title="Settings"
        >
          <Cog6ToothIcon className="h-5 w-5" />
        </button>
      </div>

      {canAutofill && (
        <div className="mb-4 flex items-center text-green-600">
          <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Application form detected!</span>
        </div>
      )}

      {!jobData ? (
        <div className="text-center py-8">
          <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <div className="space-y-4">
            {!hasResume && (
              <button
                onClick={openOptions}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Upload Resume in Settings
              </button>
            )}

            {isValidJobPage ? (
              <div className="space-y-4">
                <button
                  onClick={analyzeCurrentJob}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Analyze Current Job
                </button>

                {canAutofill && (
                  <Autofill
                    onAutofill={handleAutofill}
                    isLoading={isLoading}
                    status={status}
                  />
                )}
              </div>
            ) : (
              <p className="text-gray-600">
                Navigate to a job posting on LinkedIn, Indeed, Glassdoor, or Greenhouse to analyze your match.
              </p>
            )}
          </div>
        </div>
      ) : (
        <>
          <JobData jobData={jobData} />

          {showingSkills && selectedSkill && suggestions ? (
            <Skills
              selectedSkill={selectedSkill}
              suggestions={suggestions}
              onBack={handleBackToAnalysis}
            />
          ) : (
            <>
              {analysis && (
                <Analysis
                  analysis={analysis}
                  onSkillClick={handleSkillClick}
                />
              )}

              {canAutofill && (
                <div className="space-y-4 mt-4">
                  <Autofill
                    onAutofill={handleAutofill}
                    isLoading={isLoading}
                    status={status}
                  />
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
