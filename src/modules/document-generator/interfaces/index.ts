import { HttpStatus } from '@nestjs/common';
import { JobId } from 'bull';

interface GeneratePdfResponse {
  message: string;
  status: HttpStatus;
  jobId: unknown;
}

type DocumentGenreateResponse = Pick<GeneratePdfResponse, 'message' | 'status'>;

interface ResponseDocument extends DocumentGenreateResponse {
  data: any;
}
export { GeneratePdfResponse, DocumentGenreateResponse, ResponseDocument };
