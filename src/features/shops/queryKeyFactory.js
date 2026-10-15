export const shopsKeys = {
  all: () => ["shops"],
  lists: () => [...shopsKeys.all(), "list"],
  list: (filters, sortBy, page, size) => [
    ...shopsKeys.lists(),
    filters,
    sortBy,
    page,
    size,
  ],
  counts: () => [...shopsKeys.all(), "count"],
  count: (filters) => [...shopsKeys.counts(), filters],
  inArea: (bounds) => [...shopsKeys.all(), "in-area", bounds],
};
