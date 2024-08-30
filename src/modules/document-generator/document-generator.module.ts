import { Module } from '@nestjs/common';
import { DocumentGeneratorController } from './document-generator.controller';
import { DocumentGeneratorService } from './document-generator.service';

@Module({
  controllers: [DocumentGeneratorController],
  providers: [DocumentGeneratorService],
})
export class DocumentGeneratorModule {}
