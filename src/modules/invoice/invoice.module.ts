import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceRepository } from './invoice.repository';
import { PrismaService } from '@app/prisma.service';
import { PdfMakeModule } from '../pdf-make/pdf-make.module';
import { NatsModule } from '../transports/nats.module';

@Module({
  imports: [PdfMakeModule, NatsModule],
  providers: [InvoiceService, InvoiceRepository, PrismaService],
  exports: [InvoiceService],
})
export class InvoiceModule {}
