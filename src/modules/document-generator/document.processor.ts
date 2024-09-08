import { DOCUMENT_GENERATOR_QUEUE, FILE_COMPRESSION_QUEUE } from '@app/config';
import { DocumentGeneratorService } from './services/document-generator.service';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import {
  // DocumentGenreateResponse,
  // GeneratePdfResponse,
  ResponseDocument,
} from './interfaces';
import { Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Processor(DOCUMENT_GENERATOR_QUEUE)
export class DocumentProcessor {
  #logger = new Logger(DocumentProcessor.name);
  constructor(private readonly documentService: DocumentGeneratorService) {}
  @Process(FILE_COMPRESSION_QUEUE)
  async process(job: Job<unknown>) {
    try {
      const response: ResponseDocument = await this.documentService.generatePdf(
        job.data as any,
        job,
      );

      return {
        message: response.message,
        status: response.status,
        jobId: job.id,
        data: response.data,
      };
    } catch (error) {
      this.#logger.error('Error processing job', error);
      throw new RpcException(error);
    }
  }
}
