import { IResultDataforReports } from '@app/interfaces';
import { HttpStatus } from '@nestjs/common';

interface GeneratePdfResponse {
  message: string;
  status: HttpStatus;
  jobId: unknown;
}

type DocumentGenreateResponse = Pick<GeneratePdfResponse, 'message' | 'status'>;

interface ResponseDocument extends DocumentGenreateResponse {
  data: any;
}

interface IFileGenerated {
  jsonFile: Buffer;
  pdfDocument: string;
  dataTemplate: IResultDataforReports;
}
export {
  GeneratePdfResponse,
  DocumentGenreateResponse,
  ResponseDocument,
  IFileGenerated,
};
