import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller('document-generator')
export class DocumentGeneratorController {
  @MessagePattern('generate-documents')
  generateDocuments() {
    return 'This action generates documents';
  }
}
