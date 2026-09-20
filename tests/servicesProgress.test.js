import assert from "node:assert/strict";
import test from "node:test";
import { createServicesProgress, advanceServicesProgress, completeServicesReveal, canLeaveServices, visitServiceCategory } from "../src/pages/publicSite/services/utils/servicesProgress.js";

test("each service container must finish revealing before another step is accepted", () => {
  let state = createServicesProgress();
  assert.equal(canLeaveServices(state), false);
  state = advanceServicesProgress(state);
  assert.equal(state.step, 1);
  assert.equal(advanceServicesProgress(state), state);
  assert.equal(completeServicesReveal(state, 2), state);
  state = completeServicesReveal(state, 1);
  state = advanceServicesProgress(state);
  assert.equal(state.step, 2);
  assert.equal(canLeaveServices({ ...state, categoriesComplete: true }), false);
  state = completeServicesReveal(state, 2);
  assert.equal(canLeaveServices(state), false);
  assert.equal(canLeaveServices({ ...state, categoriesComplete: true }), true);
});

test("visiting the last category alone does not complete the entire selector", () => {
  let progress = visitServiceCategory(new Set(), 0, 3);
  progress = visitServiceCategory(progress.visited, 2, 3);
  assert.equal(progress.complete, false);
  progress = visitServiceCategory(progress.visited, 1, 3);
  assert.equal(progress.complete, true);
  assert.equal(visitServiceCategory(progress.visited, 1, 3).complete, true);
});

test("invalid category indices and empty lists never count as visits", () => {
  for (const index of [-1, 3, 0.5, NaN, Infinity]) {
    const result = visitServiceCategory(new Set(), index, 3);
    assert.equal(result.visited.size, 0);
    assert.equal(result.complete, false);
  }
  assert.equal(visitServiceCategory(new Set(), 0, 0).complete, false);
});

test("progress updates do not mutate previously recorded state", () => {
  const original = new Set([0]);
  visitServiceCategory(original, 1, 3);
  assert.deepEqual([...original], [0]);
  const state = createServicesProgress();
  advanceServicesProgress(state);
  assert.deepEqual(state, createServicesProgress());
});
