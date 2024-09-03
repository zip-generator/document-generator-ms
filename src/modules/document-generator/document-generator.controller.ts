import { Controller, HttpStatus } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { GeneratePdfDto } from './dto';
import {
  DOCUMENT_GENERATOR_QUEUE,
  FILE_COMPRESSION_QUEUE,
  GENERATE_PDF,
} from '@app/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { GeneratePdfResponse } from './interfaces';

@Controller('document-generator')
export class DocumentGeneratorController {
  constructor(
    @InjectQueue(DOCUMENT_GENERATOR_QUEUE)
    private readonly documentQueue: Queue,
  ) {}

  @MessagePattern(GENERATE_PDF)
  async generateDocuments(
    @Payload() payload: GeneratePdfDto,
  ): Promise<GeneratePdfResponse> {
    const job = await this.documentQueue.add(FILE_COMPRESSION_QUEUE, payload, {
      attempts: 3,
      backoff: 1000,
    });

    return {
      status: HttpStatus.ACCEPTED,
      message: 'Document generation has been scheduled',
      jobId: job.id,
    };
  }
}
