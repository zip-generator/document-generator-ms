import { DOCUMENT_GENERATOR_QUEUE, FILE_COMPRESSION_QUEUE } from '@app/config';
import { DocumentGeneratorService } from './document-generator.service';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import {
  // DocumentGenreateResponse,
  // GeneratePdfResponse,
  ResponseDocument,
} from './interfaces';
import { Logger } from '@nestjs/common';

@Processor(DOCUMENT_GENERATOR_QUEUE)
export class DocumentProcessor {
  #logger = new Logger(DocumentProcessor.name);
  constructor(private readonly documentService: DocumentGeneratorService) {}
  @Process(FILE_COMPRESSION_QUEUE)
  async process(job: Job<unknown>) {
    try {
      const response: ResponseDocument = await this.documentService.generatePdf(
        job.data as any,
        job.id,
      );
      this.#logger.debug('responses', { response });

      return {
        message: response.message,
        status: response.status,
        jobId: job.id,
        data: response.data,
      };
    } catch (error) {
      throw new Error(error);
    }
  }
}
