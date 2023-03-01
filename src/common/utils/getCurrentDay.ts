const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const getCurrentDay = () => {
  const today = new Date();
  const dayOfWeekName = daysOfWeek[today.getDay()];
  return dayOfWeekName;
};
