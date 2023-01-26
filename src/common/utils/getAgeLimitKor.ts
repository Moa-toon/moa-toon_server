export const getAgeLimitKor = (ageLimit: number): string => {
  return `${ageLimit === 0 ? '전체' : `${ageLimit}세`} 이용가`;
};
