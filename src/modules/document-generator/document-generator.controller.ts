import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DocumentGeneratorService } from './document-generator.service';
import { GeneratePdfDto } from './dto';

@Controller('document-generator')
export class DocumentGeneratorController {
  constructor(
    private readonly documentGeneratorService: DocumentGeneratorService,
  ) {}
  @MessagePattern('documents:pdf')
  generateDocuments(@Payload() payload: GeneratePdfDto): Promise<string> {
    return this.documentGeneratorService.generatePdf(payload);
  }
}
