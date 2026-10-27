export const usersKeys = {
  all: () => ["users"],
  lists: () => [...usersKeys.all(), "list"],
  list: (filters, sortBy, page, size) => [
    ...usersKeys.lists(),
    filters,
    sortBy,
    page,
    size,
  ],
  brief: (id) => [...usersKeys.all(), "brief", id],
};
