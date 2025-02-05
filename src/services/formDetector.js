const FORM_PATTERNS = {
  GREENHOUSE: {
    domain: 'greenhouse.io',
    selectors: {
      form: 'form#application_form',
      firstName: 'input#first_name',
      lastName: 'input#last_name',
      email: 'input#email',
      phone: 'input#phone',
      resume: 'input#resume_upload[type="file"]',
      coverLetter: 'textarea#cover_letter'
    }
  }
};

export const detectJobForm = () => {
  const currentDomain = window.location.hostname;

  for (const [provider, config] of Object.entries(FORM_PATTERNS)) {
    if (currentDomain.includes(config.domain.toLowerCase())) {
      const form = document.querySelector(config.selectors.form);
      if (form) {
        return { provider, selectors: config.selectors };
      }
    }
  }

  return null;
};
