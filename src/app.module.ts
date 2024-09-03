import { Module } from '@nestjs/common';
import { DocumentGeneratorModule } from '@modules/document-generator/document-generator.module';
import { CarboneModule } from './modules/carbone/carbone.module';
import { PrismaService } from './prisma.service';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { NatsModule } from './modules/transports/nats.module';
import { MessaginModule } from './modules/messagin/messagin.module';
@Module({
  imports: [
    DocumentGeneratorModule,
    CarboneModule,
    InvoiceModule,
    NatsModule,
    MessaginModule,
  ],
  controllers: [],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
