import {
  add,
  sub,
  formatDistance,
  parseISO,
  format,
  differenceInDays,
} from "date-fns";
import { fr } from "date-fns/locale";
import { PAGE_SIZE } from "./constants";

/**
 * Returns the date string from today plus num of days
 *
 * @param {Number} numDays: The num of days
 * @param {Boolean} withTime: Flag to set hours or not
 * @return {String} the date string from today plus num of days
 * */
export const fromToday = function (numDays, withTime = false) {
  const date = add(new Date(), { days: numDays });
  if (!withTime) date.setUTCHours(0, 0, 0, 0);
  return date.toISOString().slice(0, -1);
};

/**
 * Returns the date string from today minus num of days
 *
 * @param {Number} numDays: The num of days
 * @param {Boolean} withTime: Flag to set hours or not
 * @return {String} the date string from today minus num of days
 * */
export const beforeToday = function (numDays, withTime = false) {
  const date = sub(new Date(), { days: numDays });
  if (!withTime) date.setUTCHours(0, 0, 0, 0);
  return date.toISOString().slice(0, -1);
};

/**
 * Returns the number of full days between the given dates.
 *
 * @param {string} dateStr1: The later date
 * @param {string} dateStr2: The earlier date
 * @return {Number} the number of full days
 * */
export const subtractDates = (dateStr1, dateStr2) =>
  differenceInDays(parseISO(String(dateStr1)), parseISO(String(dateStr2)));

/**
 * Returns the given date formated according to the given format.
 *
 * @param {string} dateStr: The date to format
 * @param {string} patern: The format
 * @return {String} the given date formated
 * */
export const formatDate = (dateStr, patern = "dd MMM yyyy") =>
  format(new Date(dateStr), patern, { locale: fr });

/**
 * Return the distance between the given date and now in words.
 *
 * @param {string} dateStr: The date to compare to
 * @return {String} the distance in french words
 * */
export const formatDistanceFromNow = (dateStr) =>
  formatDistance(parseISO(dateStr), new Date(), {
    addSuffix: true,
    locale: fr,
  });

/**
 * Returns the given date as a local datetime string usable as the value
 * of an `<input type="datetime-local">` (i.e. "yyyy-MM-ddTHH:mm").
 *
 * Unlike `toISOString()` (which is UTC), this keeps the local timezone so
 * the input shows the user's local time.
 *
 * @param {Date} date: the date to format (defaults to now)
 * @return {String} the local datetime string truncated to minutes
 * */
export const toDatetimeLocal = (date = new Date()) =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

/**
 * Return the distance between the given date and now in words.
 *
 * @param {Object} options: optional parameters to get the today date
 * @return {String} the today date
 * */
export const getToday = function (options = {}) {
  const today = new Date();
  if (options?.end)
    // Set to the last second of the day
    today.setUTCHours(23, 59, 59, 999);
  else today.setUTCHours(0, 0, 0, 0);
  return today.toISOString();
};

/**
 * Return the first day of the month of the given date.
 *
 * @param {Date} date: optional parameters
 * @return {Date}
 * */
export const getFirstDateOfMonth = (date = new Date()) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

/**
 * Return the last day of the month of the given date.
 *
 * @param {Date} date: optional parameters
 * @return {Date}
 * */
export const getLastDateOfMonth = (date = new Date()) =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0);

/**
 * Build an object from search params.
 *
 * @param {Array} allowedFilters: allowed filters to 'sanitize' the search params,
 *   an optional defaultValue applies when the param is missing ("all" overrides it)
 * @param {Object} searchParams: the params from react-router-dom
 * @return {Array} filters designed to refine the search
 * */
export const buildQueryFilters = function (allowedFilters, searchParams) {
  return allowedFilters
    .map((f) => {
      const value = searchParams.get(f.field) ?? f.defaultValue ?? null;
      const fieldName = f.operator ? `${f.field}${f.operator}` : f.field;
      return { field: fieldName, value: value };
    })
    .filter((f) => f.value !== null && f.value !== "all");
};

/**
 * Build a string from filters and search params.
 *
 * @param {Array} filters: optional additional filters
 * @param {String} sortBy: optional additional sortby, must be constructed as 'field_name-direction'
 * @param {Number} page: optional page for offset
 * @param {Number} size: optional page size for limit
 * @return {String} the url search params formatted
 * */
export const buildURLSearchParams = function (
  filters = [],
  sortBy = "",
  page = null,
  size = null,
) {
  const params = new URLSearchParams();
  // FILTER
  if (filters) {
    filters.map((f) => params.append(f.field, f.value));
  }
  // SORT
  if (sortBy) {
    const [field, direction] = sortBy.split("-");
    params.append("sortby", field);
    params.append("direction", direction);
  }
  // PAGINATION
  if (page) {
    const pageSize = size || PAGE_SIZE;
    params.append("page", page);
    params.append("page_size", pageSize);
  }

  return params.toString();
};

/**
 * Return the initials for the given name.
 *
 * @param {string} name: The name to get initials
 * @return {String} the initials
 * */
export const getInitials = function (name) {
  const hasTokens = name.includes(" ");
  return `${name.substring(0, hasTokens ? 1 : 2)}${
    hasTokens ? name.charAt(name.lastIndexOf(" ") + 1) : ""
  }`.toUpperCase();
};

/**
 * Fill in a given template with matching given data values.
 *
 * @param {string} template: The template to fill in
 * @param {Object} data: An object containing template variables as key
 * @return {String} the model filled in with the corresponding values
 * */
export const evaluate = (template, data) => {
  return template.replace(/{{(.*?)}}/g, (match) => {
    return data[match.split(/{{|}}/).filter(Boolean)[0].trim()];
  });
};

/**
 * Sort a given array by a given input first.
 *
 * @param {string} input: The input to order by
 * @param {Array} data: An array containing all data as options (i.e [{ value: id, label: name },])
 * @return {Array} the data filtering by input first
 * */
export const sortByInputFirst = (input, data) => {
  const [first, others] = data.reduce(
    ([a, b], c) =>
      c.label.toLowerCase().indexOf(input.toLowerCase()) == 0
        ? [[...a, c], b]
        : [a, [...b, c]],
    [[], []],
  );
  return first.concat(others);
};

/**
 * Return a random element of a given array.
 *
 * @param {Array} list: the array from which you wish to retrieve a random element
 * @return {any} a random element from the list
 * */
export const getRand = (list) => list[(list.length * Math.random()) | 0];
