export interface ApiErrorResponse {
  detail: string | Array<{ loc: string[]; msg: string; type: string }>;
}

