import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceRepository } from './invoice.repository';
import { CarboneModule } from '../carbone/carbone.module';
import { PrismaService } from '@app/prisma.service';

@Module({
  imports: [CarboneModule],
  providers: [InvoiceService, InvoiceRepository, PrismaService],
  exports: [InvoiceService],
})
export class InvoiceModule {}
