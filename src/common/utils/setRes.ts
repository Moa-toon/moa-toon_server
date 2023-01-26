import { ResDefault } from '../types/response';

const getErrorMessageByStatusCode = (statusCode: number): string => {
  let errorMessage = '';
  switch (statusCode) {
    case 200:
      errorMessage = '성공';
      break;
    case 201:
      errorMessage = '새로운 컨텐츠 만들기 성공';
      break;
    case 204:
      errorMessage = '성공했지만 응답할 콘텐츠가 없음';
      break;
    case 400:
      errorMessage = '유효성 검사 통과 실패';
      break;
    case 401:
      errorMessage = '권한 없음';
      break;
    case 403:
      errorMessage = '접근 제한';
      break;
    case 404:
      errorMessage = '컨텐츠를 찾을 수 없음';
      break;
    case 405:
      errorMessage = '허용되지 않는 http method';
      break;
    case 409:
      errorMessage = '서버가 요청을 처리하는 과정에서 충돌 발생';
      break;
    case 429:
      errorMessage = '특정 사용자가 지정된 시간 안에 너무 많은 요청 보냄';
      break;
    default:
      errorMessage = '내부 서버 오류';
      break;
  }
  return errorMessage;
};

export const setRes = (
  statusCode?: ResDefault['statusCode'],
  data?: ResDefault['data'],
  message?: ResDefault['message'],
  error?: ResDefault['error'],
): ResDefault => {
  const defaultRes = {
    statusCode: undefined,
    data: undefined,
    message: undefined,
    error: undefined,
  };

  if (statusCode) defaultRes.statusCode = statusCode;
  if (message) defaultRes.message = message;
  if (error) defaultRes.error = error;
  else defaultRes.error = getErrorMessageByStatusCode(statusCode);

  if (data) defaultRes.data = data;

  return defaultRes;
};
