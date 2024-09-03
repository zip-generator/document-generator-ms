import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DocumentGeneratorService } from './document-generator.service';
import { GeneratePdfDto } from './dto';
import { GeneratePdfResponse } from './interfaces';
import { GENERATE_PDF } from '@app/config';

@Controller('document-generator')
export class DocumentGeneratorController {
  constructor(
    private readonly documentGeneratorService: DocumentGeneratorService,
  ) {}
  @MessagePattern(GENERATE_PDF)
  generateDocuments(
    @Payload() payload: GeneratePdfDto,
  ): Promise<GeneratePdfResponse> {
    return this.documentGeneratorService.generatePdf(payload);
  }
}
