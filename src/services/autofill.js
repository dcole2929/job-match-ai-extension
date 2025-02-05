import { getUserData, getResume } from './storage';
import { detectJobForm } from './formDetector';

export const fillForm = async () => {
  // TODO: We're manually getting selectors here based on the form we detect.
  // To make this work in practice we should instead get all the form fields
  // and pass them along with our user data to a prompt with the expected response
  // being the selectors for the form fields and values from the saved user data.
  const formInfo = detectJobForm();
  if (!formInfo) return { filled: false, errors: ['No form detected'] };

  const userData = await getUserData();
  if (!userData) return { filled: false, errors: ['No user data found'] };

  const resume = await getResume();
  if (!resume) return { filled: false, errors: ['No resume found'] };

  const { selectors } = formInfo;
  const errors = [];

  // Fill all text fields
  Object.entries(selectors).forEach(([key, selector]) => {
    if (key === 'form' || key === 'resume' || key === 'coverLetter') return;
    try {
      const value = userData[key];
      fillField(selector, value, key);
    } catch (error) {
      errors.push(error.message);
    }
  });

  // Handle file input separately due to security restrictions
  if (resume.filename && selectors.resume) {
    try {
      highlightFileInput(selectors.resume, 'resume');
    } catch (error) {
      errors.push(error.message);
    }
  }

  return {
    filled: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
};

const fillField = (selector, value, fieldName) => {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`Could not find ${fieldName} field`);
  }
  element.value = value;
  // Trigger change event to ensure form validation works
  element.dispatchEvent(new Event('change', { bubbles: true }));
  element.dispatchEvent(new Event('input', { bubbles: true }));
};

const highlightFileInput = (selector, label) => {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`Could not find ${label} upload field`);
  }
  element.style.border = '2px solid #4CAF50';
  const hint = document.createElement('div');
  hint.textContent = `Please select your ${label} file`;
  hint.style.color = '#4CAF50';
  element.parentNode.insertBefore(hint, element.nextSibling);
};
