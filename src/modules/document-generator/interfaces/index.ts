import { HttpStatus } from '@nestjs/common';
import { JobId } from 'bull';

interface GeneratePdfResponse {
  message: string;
  status: HttpStatus;
  jobId: JobId;
}

type DocumentGenreateResponse = Pick<GeneratePdfResponse, 'message' | 'status'>;

export { GeneratePdfResponse, DocumentGenreateResponse };
