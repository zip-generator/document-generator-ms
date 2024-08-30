import { Module } from '@nestjs/common';
import { DocumentGeneratorModule } from '@modules/document-generator/document-generator.module';
@Module({
  imports: [DocumentGeneratorModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
