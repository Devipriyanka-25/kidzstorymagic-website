// Frontend utility functions and helpers

export const formatCurrency = (amount, currency) => {
  const symbols = {
    USD: '$',
    CAD: 'C$',
    GBP: '£',
    EUR: '€',
    AUD: 'A$',
    INR: '₹',
  };

  return `${symbols[currency] || '$'}${amount.toFixed(2)}`;
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password)
  );
};

export const getPasswordStrength = (password) => {
  if (password.length < 8) {
    return {
      score: 0,
      label: 'Weak',
      color: 'red',
    };
  }

  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[!@#$%^&*]/.test(password)) strength++;

  const levels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong', 'Very Strong'];
  const colors = ['red', 'orange', 'yellow', 'green', 'emerald', 'emerald'];

  return {
    score: strength,
    label: levels[strength] || 'Weak',
    color: colors[strength] || 'red',
  };
};

export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

export const setAuthToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token);
  }
};

export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
  }
};

export const getAgeGroupLabel = (ageGroup) => {
  const labels = {
    '3-5': '3-5 years',
    '5-8': '5-8 years',
    '8-12': '8-12 years',
    '12+': '12+ years',
  };
  return labels[ageGroup] || ageGroup;
};

export const getThemeEmoji = (theme) => {
  const emojis = {
    family: '👨‍👩‍👧‍👦',
    friends: '👫👬👭',
    motivational: '💪🌟',
    behavioural: '😊💖',
    fairytale: '✨🎪',
    customizable: '🎨',
  };
  return emojis[theme] || '📖';
};

export const truncateText = (text, maxLength) => {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + '...';
  }
  return text;
};

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
