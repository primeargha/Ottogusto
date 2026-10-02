export const toSentenceCase = (str?: string, locale: string = "en"): string => {
  if (!str) return "";
  const lower = str.toLocaleLowerCase(locale);
  return lower.charAt(0).toLocaleUpperCase(locale) + lower.slice(1);
};
type Title = Record<string, string>;

export const formatTitleObject = (title: Title): Title => {
  return Object.fromEntries(
    Object.entries(title).map(([key, value]) => [
      key,
      toSentenceCase(value, key), // use locale per language
    ]),
  );
};

export const truncateLabel = (value: string, max: number = 15) => {
  if (!value) return value;
  return value.length > max ? `${value.slice(0, max)}...` : value;
};
