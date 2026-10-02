// export const formatDateByLocale = (
//   dateString: string,
//   locale: string = "en-BE",
// ) => {
//   try {
//     return new Intl.DateTimeFormat(locale, {
//       day: "numeric",
//       month: "long",
//       year: "numeric",
//     }).format(new Date(dateString));
//   } catch (error) {
//     // ✅ fallback to English if anything breaks
//     return new Intl.DateTimeFormat("en-BE", {
//       day: "numeric",
//       month: "long",
//       year: "numeric",
//     }).format(new Date(dateString));
//   }
// };

export const formatDateByLocale = (
  dateString: string | null | undefined,
  locale: string = "en-BE",
) => {
  if (dateString == null || String(dateString).trim() === "") {
    return "";
  }

  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  try {
    return new Intl.DateTimeFormat(locale, {
      // ✅ uses the passed locale directly
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(parsed);
  } catch (error) {
    return new Intl.DateTimeFormat("en-BE", {
      // fallback stays English
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(parsed);
  }
};
