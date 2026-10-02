export const getTimeAgo = (
  dateString: string,
  getLabel: (key: string, replacements?: Record<string, string | number>) => string,
): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (isNaN(date.getTime())) {
    return dateString;
  }

  if (diffInSeconds < 60) {
    return getLabel("time_just_now");
  }

  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    const unit = minutes === 1 ? getLabel("unit_minute") : getLabel("unit_minutes");
    return getLabel("previous_search_timestamp", { value: minutes, unit });
  }

  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    const unit = hours === 1 ? getLabel("unit_hour") : getLabel("unit_hours");
    return getLabel("previous_search_timestamp", { value: hours, unit });
  }

  const days = Math.floor(diffInSeconds / 86400);
  const unit = days === 1 ? getLabel("unit_day") : getLabel("unit_days");
  return getLabel("previous_search_timestamp", { value: days, unit });
};
