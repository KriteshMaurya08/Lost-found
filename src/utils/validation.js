/**
 * Form validation utilities for Campus Lost & Found
 */

export function validateEmail(email) {
  if (!email) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return null;
}

export function validatePhone(phone) {
  if (!phone) return 'Phone number is required';
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone.length < 10) return 'Phone number must have at least 10 digits';
  return null;
}

export function validateStudentId(studentId) {
  if (!studentId || !studentId.trim()) return 'Student or Staff ID is required';
  if (studentId.trim().length < 4) return 'Student ID must be at least 4 characters';
  return null;
}

export function validatePassword(password) {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
}

export function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) return 'Passwords do not match';
  return null;
}

export function validateRequired(value, fieldName = 'This field') {
  if (value === undefined || value === null || String(value).trim() === '') {
    return `${fieldName} is required`;
  }
  return null;
}
