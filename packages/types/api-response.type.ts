export interface DefaultResponse<T> {
  data: T;
  statusCode: number;
  status: string;
  message: string;
  error?: string;
  timeStamp: string;
}