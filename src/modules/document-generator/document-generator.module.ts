import { Module } from '@nestjs/common';
import { DocumentGeneratorController } from './document-generator.controller';
import { DocumentGeneratorService } from './document-generator.service';
import { PrismaService } from '@app/prisma.service';
import { DocumentRepository } from './repository/document.repository';
// import { ZipModule } from '../zip/zip.module';
import { InvoiceModule } from '@modules/invoice/invoice.module';
import { NatsModule } from '../transports/nats.module';
import { MessaginModule } from '../messagin/messagin.module';
import { DocumentProcessor } from './document.processor';
import { BullMqModule } from '@modules/bull-mq/bull-mq.module';
import { BullModule } from '@nestjs/bull';
import { DOCUMENT_GENERATOR_QUEUE } from '@app/config';

@Module({
  imports: [
    BullModule.registerQueue({
      name: DOCUMENT_GENERATOR_QUEUE,
    }),
    InvoiceModule,
    NatsModule,
    MessaginModule,
    BullMqModule,
  ],
  controllers: [DocumentGeneratorController],
  providers: [
    DocumentGeneratorService,
    PrismaService,
    DocumentRepository,
    DocumentProcessor,
  ],
})
export class DocumentGeneratorModule {}
