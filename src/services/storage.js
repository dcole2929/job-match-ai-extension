/*global chrome */
const USER_DATA_KEY = 'jobApplicationUserData';

const DEFAULT_USER_DATA = {
  // Basic Info
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',

  // Professional Info
  coverLetterText: '',
  linkedinUrl: '',
  portfolioUrl: '',

  // Demographics (typically optional)
  demographics: {
    gender: '',
    race: '',
    hispanicLatino: '',
    veteranStatus: '',
    disabilityStatus: '',
    // Common options for self-identification
    selfIdentification: {
      disability: 'prefer_not_to_answer', // yes, no, prefer_not_to_answer
      veteran: 'prefer_not_to_answer',    // yes, no, prefer_not_to_answer
      race: 'prefer_not_to_answer',       // Various options or prefer_not_to_answer
      gender: 'prefer_not_to_answer'      // Various options or prefer_not_to_answer
    }
  },

  // Application Preferences
  preferences: {
    autofillDemographics: false, // Whether to autofill demographic information
    confirmBeforeSubmit: true,   // Whether to show confirmation dialog before submission
  }
};

export const saveUserData = async (userData) => {
  return chrome.storage.local.set({
    [USER_DATA_KEY]: {
      ...DEFAULT_USER_DATA,  // Ensure all fields exist
      ...userData,          // Override with user-provided values
      lastUpdated: new Date().toISOString()
    }
  });
};

export const getUserData = async () => {
  const result = await chrome.storage.local.get(USER_DATA_KEY);
  return result[USER_DATA_KEY] || null;
};

export const getResume = async () => {
  const { resume } = await chrome.storage.local.get(['resume']);
  return resume || null;
};
