/*global chrome */
import { useState, useEffect } from 'react';
import { BriefcaseIcon, CheckCircleIcon, XCircleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

export default function Popup() {
  const [jobData, setJobData] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [hasResume, setHasResume] = useState(false);

  useEffect(() => {
    // Check if resume exists
    chrome.storage.local.get(['resume'], (result) => {
      setHasResume(!!result.resume);
    });
  }, []);

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
    setSelectedSkill(skill);
    setLoading(true);
    
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GET_SKILL_SUGGESTIONS',
        data: skill,
      });
      
      if (response.success) {
        setSuggestions(response.data);
      } else {
        setError('Failed to get skill suggestions');
      }
    } catch (err) {
      setError('Error getting skill suggestions');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="p-4 w-96">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 w-96">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <p>{error}</p>
          {error.includes('resume') && (
            <button
              onClick={openOptions}
              className="mt-2 text-sm text-red-700 hover:text-red-800 underline"
            >
              Open Settings
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!jobData) {
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
        <div className="text-center py-8">
          <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          {!hasResume ? (
            <>
              <p className="text-gray-600 mb-4">
                Please upload your resume in Settings first.
              </p>
              <button
                onClick={openOptions}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Open Settings
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-600 mb-4">
                Navigate to a job posting on LinkedIn, Indeed, Glassdoor, or Greenhouse to analyze your match.
              </p>
              <button
                onClick={analyzeCurrentJob}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Analyze Current Job
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 w-96">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start space-x-3">
          <BriefcaseIcon className="h-6 w-6 text-blue-500 mt-1" />
          <div>
            <h2 className="text-xl font-bold">{jobData.title}</h2>
            <p className="text-gray-600">{jobData.company}</p>
          </div>
        </div>
        <button
          onClick={openOptions}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          title="Settings"
        >
          <Cog6ToothIcon className="h-5 w-5" />
        </button>
      </div>

      {analysis && (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Match Score</h3>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getScoreColor(analysis.matchScore)} transition-all duration-500`}
                style={{ width: `${analysis.matchScore}%` }}
              />
            </div>
            <p className="text-right text-sm text-gray-600 mt-1">
              {analysis.matchScore}%
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2 flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
              Matching Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {analysis.matchingSkills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2 flex items-center">
              <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
              Missing Requirements
            </h3>
            <div className="flex flex-wrap gap-2">
              {analysis.missingSkills.map((skill, index) => (
                <button
                  key={index}
                  onClick={() => handleSkillClick(skill)}
                  className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm hover:bg-red-200 transition-colors"
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {selectedSkill && suggestions && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">
                How to acquire: {selectedSkill}
              </h4>
              <div className="space-y-2">
                <div>
                  <h5 className="text-sm font-medium text-gray-700">Short-term actions:</h5>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {suggestions.shortTerm.map((action, index) => (
                      <li key={index}>{action}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-700">Resources:</h5>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {suggestions.resources.map((resource, index) => (
                      <li key={index}>{resource}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 