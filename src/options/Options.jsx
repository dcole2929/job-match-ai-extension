/*global chrome */
import { useState, useEffect } from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { parseDocument } from '../services/documentParser';
import { saveUserData, getUserData } from '../services/storage';

const RACE_OPTIONS = [
  { value: 'prefer_not_to_answer', label: 'Prefer not to answer' },
  { value: 'american_indian', label: 'American Indian or Alaska Native' },
  { value: 'asian', label: 'Asian' },
  { value: 'black', label: 'Black or African American' },
  { value: 'pacific_islander', label: 'Native Hawaiian or Other Pacific Islander' },
  { value: 'white', label: 'White' },
  { value: 'two_or_more', label: 'Two or more races' }
];

const VETERAN_OPTIONS = [
  { value: 'prefer_not_to_answer', label: 'Prefer not to answer' },
  { value: 'not_veteran', label: 'I am not a veteran' },
  { value: 'veteran', label: 'I am a veteran' },
  { value: 'protected_veteran', label: 'I identify as a protected veteran' }
];

const DISABILITY_OPTIONS = [
  { value: 'prefer_not_to_answer', label: 'Prefer not to answer' },
  { value: 'no_disability', label: 'No, I don\'t have a disability' },
  { value: 'yes_disability', label: 'Yes, I have a disability' }
];

export default function Options() {
  const [keys, setKeys] = useState({
    openaiKey: '',
    anthropicKey: '',
  });
  const [resume, setResume] = useState(null);
  const [status, setStatus] = useState('');
  const [storedData, setStoredData] = useState(null);
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    coverLetterText: '',
    linkedinUrl: '',
    portfolioUrl: '',
    demographics: {
      gender: 'prefer_not_to_answer',
      race: 'prefer_not_to_answer',
      hispanicLatino: 'prefer_not_to_answer',
      veteranStatus: 'prefer_not_to_answer',
      disabilityStatus: 'prefer_not_to_answer'
    },
    preferences: {
      autofillDemographics: false,
      confirmBeforeSubmit: true
    }
  });

  useEffect(() => {
    // Load saved data
    chrome.storage.local.get(['openaiKey', 'anthropicKey', 'resume'], (result) => {
      setKeys({
        openaiKey: result.openaiKey || '',
        anthropicKey: result.anthropicKey || '',
      });
      if (result.resume) {
        setResume({
          content: result.resume.content,
          filename: result.resume.filename,
        });
      }
    });
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const data = await getUserData();
    if (data) {
      setUserData(data);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await chrome.storage.local.set({
        openaiKey: keys.openaiKey,
        anthropicKey: keys.anthropicKey,
      });
      setStatus('Settings saved successfully!');
      verifyStorage();
      await saveUserData(userData);
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      setStatus('Error saving settings');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setKeys(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setStatus('Parsing resume...');
      const parsedContent = await parseDocument(file);

      const resumeData = {
        content: parsedContent,
        filename: file.name,
        uploadDate: new Date().toISOString()
      };

      await chrome.storage.local.set({ resume: resumeData });
      setResume(resumeData);
      setStatus('Resume uploaded and parsed successfully!');
      verifyStorage();
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      console.error('Resume upload error:', error);
      setStatus(error.message || 'Error uploading resume');
      setTimeout(() => setStatus(''), 5000);
    }
  };

  const verifyStorage = async () => {
    const data = await chrome.storage.local.get(['openaiKey', 'anthropicKey', 'resume']);
    setStoredData(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Job Match AI Settings</h1>
          <p className="mt-2 text-sm text-gray-600">
            Configure your API keys and upload your resume
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Resume Upload Section */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Resume
            </label>
            <div className="mt-1 flex items-center space-x-4">
              <div className="flex-1">
                {resume ? (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <DocumentTextIcon className="h-5 w-5" />
                    <span>{resume.filename}</span>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No resume uploaded</div>
                )}
              </div>
              <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50">
                {resume ? 'Replace Resume' : 'Upload Resume'}
                <input
                  type="file"
                  className="hidden"
                  accept=".txt,.pdf,.doc,.docx"
                  onChange={handleResumeUpload}
                />
              </label>
            </div>
          </div>

          {/* API Keys Section */}
          <div className="space-y-4">
            <div>
              <label htmlFor="openaiKey" className="block text-sm font-medium text-gray-700">
                OpenAI API Key
              </label>
              <input
                type="password"
                name="openaiKey"
                id="openaiKey"
                value={keys.openaiKey}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="sk-..."
              />
            </div>

            <div>
              <label htmlFor="anthropicKey" className="block text-sm font-medium text-gray-700">
                Anthropic API Key (Optional)
              </label>
              <input
                type="password"
                name="anthropicKey"
                id="anthropicKey"
                value={keys.anthropicKey}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="sk-ant-..."
              />
            </div>
          </div>

          {/* User Data Section */}
          <div className="space-y-4">
            <div>
              <label className="block mb-2">First Name</label>
              <input
                type="text"
                value={userData.firstName}
                onChange={e => setUserData({...userData, firstName: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-2">Last Name</label>
              <input
                type="text"
                value={userData.lastName}
                onChange={e => setUserData({...userData, lastName: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-2">Email</label>
              <input
                type="email"
                value={userData.email}
                onChange={e => setUserData({...userData, email: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-2">Phone</label>
              <input
                type="tel"
                value={userData.phone}
                onChange={e => setUserData({...userData, phone: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-2">Cover Letter Template</label>
              <textarea
                value={userData.coverLetterText}
                onChange={e => setUserData({...userData, coverLetterText: e.target.value})}
                className="w-full p-2 border rounded"
                rows={6}
              />
            </div>
          </div>

          {/* Demographics Section */}
          <div className="mt-8 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Demographics</h2>
            <p className="text-sm text-gray-600">
              This information is optional and will only be used when specifically requested by job applications.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Race</label>
                <select
                  value={userData.demographics.race}
                  onChange={e => setUserData({
                    ...userData,
                    demographics: {
                      ...userData.demographics,
                      race: e.target.value
                    }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {RACE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Veteran Status</label>
                <select
                  value={userData.demographics.veteranStatus}
                  onChange={e => setUserData({
                    ...userData,
                    demographics: {
                      ...userData.demographics,
                      veteranStatus: e.target.value
                    }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {VETERAN_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Disability Status</label>
                <select
                  value={userData.demographics.disabilityStatus}
                  onChange={e => setUserData({
                    ...userData,
                    demographics: {
                      ...userData.demographics,
                      disabilityStatus: e.target.value
                    }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {DISABILITY_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autofillDemographics"
                  checked={userData.preferences.autofillDemographics}
                  onChange={e => setUserData({
                    ...userData,
                    preferences: {
                      ...userData.preferences,
                      autofillDemographics: e.target.checked
                    }
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="autofillDemographics" className="ml-2 block text-sm text-gray-900">
                  Automatically fill demographic information when available
                </label>
              </div>
            </div>
          </div>

          {status && (
            <div className={`rounded-md p-4 ${
              status.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
            }`}>
              {status}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Settings
            </button>
          </div>
        </form>

        {/* Storage Verification Section */}
        <div className="mt-8">
          <button
            onClick={verifyStorage}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Verify Stored Data
          </button>
          {storedData && (
            <div className="mt-2 p-4 bg-gray-100 rounded-md text-sm">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify({
                  hasOpenAIKey: !!storedData.openaiKey,
                  hasAnthropicKey: !!storedData.anthropicKey,
                  resume: storedData.resume ? {
                    filename: storedData.resume.filename,
                    contentLength: storedData.resume.content.length,
                    uploadDate: storedData.resume.uploadDate
                  } : null
                }, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
