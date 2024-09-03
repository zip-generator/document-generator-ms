import { HttpStatus } from '@nestjs/common';

interface GeneratePdfResponse {
  message: string;
  status: HttpStatus;
}

export { GeneratePdfResponse };
