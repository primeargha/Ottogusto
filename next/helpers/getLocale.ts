import { LOCALEs_LIST } from "@/constants";
import { LocaleInterface } from "@/types/globalTypes";

export const getLocale = (localeString: string): LocaleInterface | null => {
  return (
    LOCALEs_LIST.filter((node) => {
      return localeString === node.locale;
    })[0] || null
  );
};
