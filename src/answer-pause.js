// A session-only reminder, never an input to scoring or a judgment of honesty.
export function createAnswerPause(threshold = 6) {
  let group;
  let sequence = [];
  const reminded = new Set();
  return {
    record(groupId, itemId, value, isNew) {
      if (group !== groupId) { group = groupId; sequence = []; }
      const last = sequence.at(-1);
      if (last?.id === itemId) last.value = value;
      else if (isNew) sequence.push({ id: itemId, value });
      else { sequence = []; return false; }
      sequence = sequence.slice(-threshold);
      if (reminded.has(groupId) || sequence.length < threshold) return false;
      return sequence.every(item => item.value === value);
    },
    acknowledge(groupId) { reminded.add(groupId); sequence = []; },
    reset() { group = undefined; sequence = []; reminded.clear(); },
  };
}
