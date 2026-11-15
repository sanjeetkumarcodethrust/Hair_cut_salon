import { validatePassword } from '../backend/utils/passwordValidator.js';
import mongoose from 'mongoose';
import User from '../backend/models/User.js';

console.log('--- Testing validatePassword function ---');

const testCases = [
  { pwd: '', expectedValid: false, reason: 'empty' },
  { pwd: 'Ab1!', expectedValid: false, reason: 'less than 8 chars' },
  { pwd: 'password!', expectedValid: false, reason: 'no uppercase letter' },
  { pwd: 'PASSWORD!', expectedValid: false, reason: 'no lowercase letter' },
  { pwd: 'Password123', expectedValid: false, reason: 'no symbol' },
  { pwd: 'Password!', expectedValid: true, reason: '8 chars, upper, lower, symbol' },
  { pwd: 'Pass@123', expectedValid: true, reason: '8 chars, upper, lower, symbol, digits' },
  { pwd: 'MyP@ssw0rd!', expectedValid: true, reason: 'complex password' },
  { pwd: 'CutMate#2026', expectedValid: true, reason: 'brand password' },
];

let failed = false;

for (const tc of testCases) {
  const res = validatePassword(tc.pwd);
  const pass = res.isValid === tc.expectedValid;
  console.log(`[${pass ? 'PASS' : 'FAIL'}] "${tc.pwd}" (${tc.reason}) -> isValid: ${res.isValid}${res.message ? ' | msg: ' + res.message : ''}`);
  if (!pass) failed = true;
}

console.log('\n--- Testing Mongoose Schema Validator ---');
const schemaPasswordValidator = User.schema.path('password').validators.find(v => v.type === 'user defined' || typeof v.validator === 'function');

const mockDoc = {
  isModified: (field) => field === 'password'
};

const mongooseCases = [
  { pwd: 'short', expected: false },
  { pwd: 'password!', expected: false },
  { pwd: 'PASSWORD!', expected: false },
  { pwd: 'Password123', expected: false },
  { pwd: 'Password!', expected: true },
  { pwd: 'Password123!', expected: true },
];

for (const mc of mongooseCases) {
  const valid = schemaPasswordValidator.validator.call(mockDoc, mc.pwd);
  const pass = valid === mc.expected;
  console.log(`[${pass ? 'PASS' : 'FAIL'}] Mongoose validator on "${mc.pwd}" -> result: ${valid}`);
  if (!pass) failed = true;
}

// Test when not modified
const notModifiedDoc = { isModified: () => false };
const notModValid = schemaPasswordValidator.validator.call(notModifiedDoc, 'anything');
console.log(`[${notModValid ? 'PASS' : 'FAIL'}] Mongoose validator when isModified is false -> result: ${notModValid}`);
if (!notModValid) failed = true;

if (failed) {
  console.error('\nSome tests failed!');
  process.exit(1);
} else {
  console.log('\nAll password validation tests passed successfully!');
  process.exit(0);
}
