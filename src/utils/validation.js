export const PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\d\s+\-()]{7,20}$/,
  dni: /^\d{7,9}$/,
  zipCode: /^[a-zA-Z0-9\s\-]{4,10}$/,
  macAddress: /^([0-9A-Fa-f]{2}:){5}([0-9A-Fa-f]{2})$/,
  letters: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/,
  alphanumeric: /^[a-zA-Z0-9_]+$/,
};

export const validateField = (value, rules) => {
  for (const rule of rules) {
    if (rule.required && (!value || value.toString().trim() === '')) {
      return rule.message;
    }
    if (value && value.toString().trim() !== '') {
      if (rule.minLength && value.toString().trim().length < rule.minLength) {
        return rule.message;
      }
      if (rule.maxLength && value.toString().trim().length > rule.maxLength) {
        return rule.message;
      }
      if (rule.pattern && !rule.pattern.test(value.toString().trim())) {
        return rule.message;
      }
      if (rule.min !== undefined && Number(value) < rule.min) {
        return rule.message;
      }
      if (rule.max !== undefined && Number(value) > rule.max) {
        return rule.message;
      }
    }
  }
  return '';
};

export const sanitizeInput = (value) => {
  if (typeof value !== 'string') return value;
  return value
    .trim()
    .replace(/<[^>]*>/g, '')
    .replace(/[<>"']/g, '');
};
