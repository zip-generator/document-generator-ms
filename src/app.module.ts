import { Module } from '@nestjs/common';
import { DocumentGeneratorModule } from '@modules/document-generator/document-generator.module';
import { PrismaService } from './prisma.service';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { NatsModule } from './modules/transports/nats.module';
import { MessaginModule } from './modules/messagin/messagin.module';
import { BullMqModule } from './modules/bull-mq/bull-mq.module';

@Module({
  imports: [
    DocumentGeneratorModule,
    InvoiceModule,
    NatsModule,
    MessaginModule,
    BullMqModule,
  ],
  controllers: [],
  providers: [PrismaService],
  exports: [PrismaService, BullMqModule],
})
export class AppModule {}
