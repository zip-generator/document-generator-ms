import { Module } from '@nestjs/common';
import { DocumentGeneratorController } from './document-generator.controller';
import { DocumentGeneratorService } from './document-generator.service';
import { PrismaService } from '@app/prisma.service';
import { DocumentRepository } from './repository/document.repository';
import { ZipModule } from '../zip/zip.module';
import { InvoiceModule } from '../invoice/invoice.module';

@Module({
  imports: [ZipModule, InvoiceModule],
  controllers: [DocumentGeneratorController],
  providers: [DocumentGeneratorService, PrismaService, DocumentRepository],
})
export class DocumentGeneratorModule {}
