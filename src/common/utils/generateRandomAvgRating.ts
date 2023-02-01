export const generateRandomAvgRating = (
  min: number,
  max: number,
  decimals: number,
): number => {
  const str = (Math.random() * (max - min) + min).toFixed(decimals);

  return parseFloat(str);
};
