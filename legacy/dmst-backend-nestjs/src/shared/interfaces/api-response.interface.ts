export interface ApiResponse<TData = unknown, TCode extends string = string> {
  code: TCode;
  message: string;
  data?: TData;
}
