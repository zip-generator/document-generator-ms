import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceRepository } from './invoice.repository';
import { PrismaService } from '@app/prisma.service';
import { NatsModule } from '../transports/nats.module';

@Module({
  imports: [NatsModule],
  providers: [InvoiceService, InvoiceRepository, PrismaService],
  exports: [InvoiceService],
})
export class InvoiceModule {}
