import { DOCUMENT_GENERATOR_QUEUE, FILE_COMPRESSION_QUEUE } from '@app/config';
import { DocumentGeneratorService } from './document-generator.service';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { DocumentGenreateResponse, GeneratePdfResponse } from './interfaces';

@Processor(DOCUMENT_GENERATOR_QUEUE)
export class DocumentProcessor {
  constructor(private readonly documentService: DocumentGeneratorService) {}
  @Process(FILE_COMPRESSION_QUEUE)
  async process(job: Job<unknown>): Promise<GeneratePdfResponse> {
    try {
      const response: DocumentGenreateResponse =
        await this.documentService.generatePdf(job.data as any, job.id);

      return {
        message: response.message,
        status: response.status,
        jobId: job.id,
      };
    } catch (error) {
      throw new Error(error);
    }
  }
}
