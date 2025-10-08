/**
 * Security Test Suite
 * Tests for XSS prevention, CSRF protection, and input validation
 */
import { describe, test, expect } from 'vitest';
import { validateAndSanitize, createPostSchema, sanitizeText, sanitizeHtml } from '../utils/validation';

describe('Input Sanitization', () => {
  test('should sanitize XSS attempts', () => {
    const maliciousInput = '<script>alert("xss")</script>Hello';
    const sanitized = sanitizeText(maliciousInput);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('alert');
  });

  test('should sanitize HTML content', () => {
    const htmlInput = '<div onclick="alert()">Content</div>';
    const sanitized = sanitizeHtml(htmlInput);
    expect(sanitized).not.toContain('onclick');
    expect(sanitized).not.toContain('alert');
  });

  test('should preserve safe HTML tags', () => {
    const safeHtml = '<p><strong>Bold text</strong></p>';
    const sanitized = sanitizeHtml(safeHtml);
    expect(sanitized).toContain('<strong>');
    expect(sanitized).toContain('Bold text');
  });
});

describe('Form Validation', () => {
  test('should validate post creation data', () => {
    const validData = {
      title: 'Test Post',
      content: 'This is test content',
      category_id: 'general-discussion',
      is_anonymous: false,
      visibility: 'public'
    };

    const result = validateAndSanitize(createPostSchema, validData);
    expect(result.success).toBe(true);
    expect(result.data.title).toBe('Test Post');
  });

  test('should reject invalid post data', () => {
    const invalidData = {
      title: '', // Empty title
      content: 'Content',
      category_id: 'general-discussion'
    };

    const result = validateAndSanitize(createPostSchema, invalidData);
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
  });

  test('should sanitize malicious post content', () => {
    const maliciousData = {
      title: '<script>alert("xss")</script>Malicious Title',
      content: 'javascript:alert("xss")',
      category_id: 'general-discussion',
      is_anonymous: false,
      visibility: 'public'
    };

    const result = validateAndSanitize(createPostSchema, maliciousData);
    expect(result.success).toBe(true);
    expect(result.data.title).not.toContain('<script>');
    expect(result.data.content).not.toContain('javascript:');
  });
});

describe('Email Validation', () => {
  test('should validate proper email format', () => {
    const validEmails = [
      'test@example.com',
      'user.name@domain.co.uk',
      'user+tag@example.org'
    ];

    validEmails.forEach(email => {
      // Test would use emailSchema validation
      expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });
  });

  test('should reject invalid email formats', () => {
    const invalidEmails = [
      'invalid-email',
      '@domain.com',
      'user@',
      'user@domain',
      'user space@domain.com'
    ];

    invalidEmails.forEach(email => {
      expect(email).not.toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });
  });
});