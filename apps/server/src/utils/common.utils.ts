import _ from 'lodash';

export const getInfoData = <T, K extends keyof T>({ keys, obj }: { keys: K[], obj: T }): Pick<T, K> => {
  return _.pick(obj, keys) as Pick<T, K>;
}

export const jsonParse = <T>(data: string): T | null => {
  if (!data) return null;
  let result: T | null = null;
  try {
    result = JSON.parse(data) as T;
  } catch {
    result = null;
  }
  return result;
}