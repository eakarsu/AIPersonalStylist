const test = require('node:test');
const assert = require('node:assert/strict');
const { validateRecommendation, evaluateRecommendation, validateTransition } = require('../domain/stylistPolicy');

const recommendation = { preference_version: 'p2', catalog_version: 'c4', recommendation_ref: 'r1', explanation: 'Matches explicit preferences', budget_limit: 100, items: [{ sku: 'sku-1', variant: 'blue-m', available: true, size_evidence: 'measurement-v2', price: 45 }] };

test('accepts available catalog variants with fit evidence and budget', () => {
  assert.deepEqual(validateRecommendation(recommendation), { total: 45, item_count: 1 });
});

test('rejects unavailable or ungrounded variants', () => {
  assert.throws(() => validateRecommendation({ ...recommendation, items: [{ sku: 'sku-1', variant: 'm', available: false, size_evidence: 'x', price: 2 }] }), /fit evidence/);
});

test('rejects recommendations over the explicit budget', () => {
  assert.throws(() => validateRecommendation({ ...recommendation, budget_limit: 40 }), /exceeds budget/);
});

test('blocks evaluation when safety or accessibility is below threshold', () => {
  assert.equal(evaluateRecommendation({ relevance: 1, diversity: 1, safety: 0.89, accessibility: 1 }).blocked, true);
});

test('requires owner approval before spending action', () => {
  assert.throws(() => validateTransition('approved', 'action_pending', { role: 'owner' }), /spending action approval/);
  assert.equal(validateTransition('approved', 'action_pending', { role: 'owner', ownerApproval: true }), true);
});

test('purchase and deletion require external receipts', () => {
  assert.throws(() => validateTransition('action_pending', 'purchased', { role: 'owner', ownerApproval: true }), /commerce receipt/);
  assert.throws(() => validateTransition('draft', 'deleted', {}), /deletion propagation/);
});
