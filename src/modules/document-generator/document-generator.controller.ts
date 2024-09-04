import { Controller, HttpStatus, Logger, ParseIntPipe } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { GeneratePdfDto } from './dto';
import {
  DOCUMENT_GENERATOR_QUEUE,
  FILE_COMPRESSION_QUEUE,
  GENERATE_PDF,
  ZIP_STATUS,
} from '@app/config';
import { InjectQueue } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { GeneratePdfResponse } from './interfaces';

@Controller('document-generator')
export class DocumentGeneratorController {
  #logger = new Logger(DocumentGeneratorController.name);
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
      jobId: job,
    };
  }

  @MessagePattern(ZIP_STATUS)
  async getDocumentGenerationStatus(
    @Payload('jobId', ParseIntPipe) jobId: number,
  ) {
    const job: Job = await this.documentQueue.getJob(+jobId);
    this.#logger.debug('QLO LOCO', { job });
    if (!job) {
      throw new RpcException('Job not found');
    }

    if (!job.isCompleted) {
      throw new RpcException('Job is still in progress');
    }

    return {
      status: HttpStatus.OK,
      message: 'Job has been completed',
      data: {
        downloadUrl: job.returnvalue.data.data?.url,
        key: job.returnvalue.data.data?.key,
      },
    };
  }
}
