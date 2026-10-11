import { describe, it, expect } from 'vitest';
import {
  validateAmount,
  validateDate,
  validateTransactionInput,
  sanitizeAppState,
} from '../utils/validation';
import { createInitialDemoState } from '../data/demoData';

describe('validation and sanitization', () => {
  it('11. validateAmount handles valid, invalid, negative, and extreme amounts', () => {
    // Valid amounts
    expect(validateAmount(500).isValid).toBe(true);
    expect(validateAmount('1250.50').isValid).toBe(true);
    expect(validateAmount('1250.50').value).toBe(1250.5);

    // Invalid amounts
    expect(validateAmount(0).isValid).toBe(false);
    expect(validateAmount(-50).isValid).toBe(false);
    expect(validateAmount('invalid-string').isValid).toBe(false);
    expect(validateAmount(null).isValid).toBe(false);
    expect(validateAmount(undefined).isValid).toBe(false);
    expect(validateAmount(9999999999).isValid).toBe(false);
  });

  it('validates date strings reliably', () => {
    expect(validateDate('2026-10-15').isValid).toBe(true);
    expect(validateDate('').isValid).toBe(false);
    expect(validateDate('not-a-date').isValid).toBe(false);
  });

  it('12. validateTransactionInput validates required fields correctly', () => {
    const valid = validateTransactionInput({
      type: 'expense',
      category: 'Food',
      amount: '350',
      date: '2026-10-10',
      description: 'Canteen meal',
    });
    expect(valid.isValid).toBe(true);

    const invalid = validateTransactionInput({
      type: 'expense',
      category: 'Food',
      amount: '-10',
      date: 'invalid-date',
      description: '',
    });
    expect(invalid.isValid).toBe(false);
    expect(invalid.errors.amount).toBeDefined();
    expect(invalid.errors.description).toBeDefined();
  });

  it('13. sanitizeAppState recovers safely from corrupt or malformed LocalStorage data', () => {
    const demoState = createInitialDemoState();

    // Corrupted state: null or non-object
    expect(sanitizeAppState(null, demoState)).toEqual(demoState);
    expect(sanitizeAppState('some corrupt string', demoState)).toEqual(demoState);

    // Partial malformed state: transactions is not an array, startingBudget is negative
    const malformed = {
      startingBudget: -5000,
      transactions: 'not-an-array',
      savingsGoals: [{ invalid: true }],
    };
    const recovered = sanitizeAppState(malformed, demoState);
    expect(recovered.startingBudget).toBe(demoState.startingBudget);
    expect(Array.isArray(recovered.transactions)).toBe(true);
    expect(recovered.savingsGoals.length).toBe(0);
  });

  it('14. sanitizeAppState rejects prototype pollution and NaN values gracefully', () => {
    const demoState = createInitialDemoState();
    const maliciousPayload = {
      __proto__: { polluted: true },
      startingBudget: NaN,
      transactions: [{ amount: 'not-num' }, { amount: -500 }, { amount: 150, description: 'Safe' }],
    };

    const result = sanitizeAppState(maliciousPayload, demoState);
    expect((Object.prototype as unknown as { polluted?: boolean }).polluted).toBeUndefined();
    expect(result.startingBudget).toBe(demoState.startingBudget);
    expect(result.transactions.length).toBe(1);
    expect(result.transactions[0].amount).toBe(150);
  });
});

