const NUMBER_REG_EXP = /\d*/;

// "전체" => 0, "15세" => 15세 이상, "16세" => 16세 이상
export const getAgeLimit = (ageStr: string): number => {
  if (ageStr === '전체연령가') return 0;

  const age = Number(ageStr.match(NUMBER_REG_EXP)[0]);
  return age;
};
