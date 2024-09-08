import { Module } from '@nestjs/common';
import { DocumentGeneratorController } from './document-generator.controller';
import { DocumentGeneratorService } from './services/document-generator.service';
import { PrismaService } from '@app/prisma.service';
import { DocumentRepository } from './repository/document.repository';
// import { ZipModule } from '../zip/zip.module';
import { InvoiceModule } from '@modules/invoice/invoice.module';
import { NatsModule } from '../transports/nats.module';
import { MessaginModule } from '../messagin/messagin.module';

import { BullMqModule } from '@modules/bull-mq/bull-mq.module';
import { BullModule } from '@nestjs/bull';
import { DOCUMENT_GENERATOR_QUEUE } from '@app/config';
import { TempFileService } from './services/temp-file.service';
import { PdfMakeModule } from '../pdf-make/pdf-make.module';
import { DocumentGrouperService } from './services/document-grouper.service';
import { DocumentProcessorService } from './services';
import { DocumentProcessor } from './document.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: DOCUMENT_GENERATOR_QUEUE,
    }),
    InvoiceModule,
    NatsModule,
    MessaginModule,
    BullMqModule,
    PdfMakeModule,
    NatsModule,
  ],
  controllers: [DocumentGeneratorController],
  providers: [
    DocumentGeneratorService,
    PrismaService,
    DocumentRepository,
    TempFileService,
    DocumentGrouperService,
    DocumentProcessor,
    DocumentProcessorService,
  ],
})
export class DocumentGeneratorModule {}
