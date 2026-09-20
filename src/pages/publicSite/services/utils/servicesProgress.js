function createServicesProgress() {
  return { step: 0, revealed: true, categoriesComplete: false };
}

function advanceServicesProgress(state) {
  if (!state.revealed || state.step >= 2) return state;
  return { ...state, step: state.step + 1, revealed: false };
}

function completeServicesReveal(state, step) {
  return state.step === step ? { ...state, revealed: true } : state;
}

function canLeaveServices(state) {
  return state.step === 2 && state.revealed && state.categoriesComplete;
}

function visitServiceCategory(visited, index, count) {
  const next = new Set(visited);
  if (Number.isInteger(index) && index >= 0 && index < count) next.add(index);
  return { visited: next, complete: count > 0 && next.size === count };
}

export { createServicesProgress, advanceServicesProgress, completeServicesReveal, canLeaveServices, visitServiceCategory };
