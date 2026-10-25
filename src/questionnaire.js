export const MODES = ['short', 'full'];

export function categoryItems(category, mode = 'short') {
  return mode === 'full'
    ? (category.fullItemIds ? category.items.filter(item => category.fullItemIds.includes(item.id)) : category.items)
    : category.items.filter(item => category.shortItemIds.includes(item.id));
}

export function groupItems(group, mode = 'short') {
  return group.categories.flatMap(category =>
    categoryItems(category, mode).map(item => ({ ...item, categoryId: category.id })),
  );
}

// Stable ordering lets a saved session return to the same page after a refresh.
export function orderedItems(group, mode, seed) {
  let value = seed;
  const random = () => {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;
    let mixed = Math.imul(value ^ (value >>> 15), 1 | value);
    mixed = mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed) ^ mixed;
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
  const items = groupItems(group, mode);
  for (let index = items.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [items[index], items[other]] = [items[other], items[index]];
  }
  for (let index = 1; index < items.length; index++) {
    if (items[index].categoryId !== items[index - 1].categoryId) continue;
    const other = items.findIndex((item, position) =>
      position > index && item.categoryId !== items[index - 1].categoryId,
    );
    if (other !== -1) [items[index], items[other]] = [items[other], items[index]];
  }
  return items;
}

export const isAnswer = value => Number.isInteger(value) && value >= 1 && value <= 5;

export function validateQuestionnaire(data) {
  if (!data?.questionnaireVersion || !Array.isArray(data.groups) || data.groups.length !== 3) {
    throw new Error('Invalid questionnaire structure');
  }
  const ids = new Set();
  for (const group of data.groups) {
    if (!group.categories?.length) throw new Error('Missing categories');
    for (const category of group.categories) {
      if (!category.scripture || category.shortItemIds?.length !== (group === data.groups[0] ? 4 : 3)) {
        throw new Error('Missing scripture or short assessment items');
      }
      if (new Set(category.shortItemIds).size !== category.shortItemIds.length) throw new Error('Repeated short item');
      for (const item of category.items) {
        if (ids.has(item.id) || !item.text) throw new Error('Invalid question');
        ids.add(item.id);
      }
      if (!category.shortItemIds.every(id => category.items.some(item => item.id === id))) {
        throw new Error('Unknown short assessment item');
      }
      if (category.fullItemIds && (new Set(category.fullItemIds).size !== 4 || category.fullItemIds.length !== 4 ||
          !category.shortItemIds.every(id => category.fullItemIds.includes(id)) ||
          !category.fullItemIds.every(id => category.items.some(item => item.id === id)))) {
        throw new Error('Invalid deeper selection');
      }
    }
    if (group === data.groups[0] && MODES.some(mode => groupItems(group, mode).length > 80)) {
      throw new Error('Core assessment exceeds 80 statements');
    }
  }
  return data;
}
