import { UpdateDayCode, UpdateDayKor } from '../types/contents';

const updateDayKor = {
  mon: '월',
  tue: '화',
  wed: '수',
  thu: '목',
  fri: '금',
  sat: '토',
  sun: '일',
  daily: '데일리',
  finished: '완결',
};

export const getUpdateDayKor = (updateDay: UpdateDayCode) => {
  return updateDayKor[updateDay] as UpdateDayKor;
};
