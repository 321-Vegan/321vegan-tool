export const reviewsKeys = {
  all: (resource) => [resource],
  lists: (resource) => [...reviewsKeys.all(resource), "list"],
  list: (resource, filters, sortBy, page, size) => [
    ...reviewsKeys.lists(resource),
    filters,
    sortBy,
    page,
    size,
  ],
  counts: (resource) => [...reviewsKeys.all(resource), "count"],
  count: (resource, filters) => [...reviewsKeys.counts(resource), filters],
};
