import { Module } from '@nestjs/common';
import { NatsModule } from '@modules/transports/nats.module';
import { DocumentGeneratorModule } from '@modules/document-generator/document-generator.module';
@Module({
  imports: [NatsModule, DocumentGeneratorModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
