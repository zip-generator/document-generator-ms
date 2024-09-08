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
      removeOnFail: true,
    });

    return {
      status: HttpStatus.ACCEPTED,
      message: 'Document generation has been scheduled',
      jobId: job.id,
    };
  }

  @MessagePattern(ZIP_STATUS)
  async getDocumentGenerationStatus(
    @Payload('jobId', ParseIntPipe) jobId: number,
  ) {
    const job: Job = await this.documentQueue.getJob(+jobId);
    if (!job) {
      throw new RpcException('Job not found');
    }

    const isCompleted = await job.isCompleted();
    if (isCompleted) {
      this.#logger.log(`Job ${job.id} has been completed`, {
        job: job.returnvalue.data,
      });
      return {
        status: HttpStatus.OK,
        message: job.returnvalue.data.message,
        data: {
          key: job?.returnvalue?.data?.data?.awsKey,
        },
      };
    }
    throw new RpcException('Job is still in progress');
  }
}
