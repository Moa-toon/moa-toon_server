export const getAuthorTypeKor = (authorType: number): string => {
  let answer: string;
  switch (authorType) {
    case 0:
      answer = '공통';
      break;
    case 1:
      answer = '글';
      break;
    case 2:
      answer = '그림';
      break;
    case 3:
      answer = '원작';
      break;
    case 4:
      answer = '배급처';
      break;
    default:
      answer = '공통';
      break;
  }
  return answer;

  return answer;
};
