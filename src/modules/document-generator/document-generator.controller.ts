import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller('document-generator')
export class DocumentGeneratorController {
  @MessagePattern('generate-documents')
  generateDocuments(payload: unknown) {
    console.log('generate-documents payload', payload);
    return 'This action generates documents';
  }
}
