export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      message: 'Password is required.',
      checks: {
        minLength: false,
        hasUpper: false,
        hasLower: false,
        hasSymbol: false,
      },
    };
  }

  const checks = {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasSymbol: /[^A-Za-z0-9\s]/.test(password),
  };

  const isValid = checks.minLength && checks.hasUpper && checks.hasLower && checks.hasSymbol;

  const missing = [];
  if (!checks.minLength) missing.push('at least 8 characters');
  if (!checks.hasUpper) missing.push('at least one capital letter (A-Z)');
  if (!checks.hasLower) missing.push('at least one small letter (a-z)');
  if (!checks.hasSymbol) missing.push('at least one symbol (e.g. !@#$%^&*)');

  const message = isValid
    ? ''
    : `Password must contain ${missing.join(', ')}.`;

  return { isValid, message, checks };
};
