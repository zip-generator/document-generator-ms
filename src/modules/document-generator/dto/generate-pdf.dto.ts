import { DOCUMENT_TYPES, ZIP_FILE_FORMAT } from '@app/enums';
import { IsEnum, IsISO8601 } from 'class-validator';

export class GeneratePdfDto {
  @IsISO8601()
  from?: string;

  @IsISO8601()
  to?: string;

  @IsEnum(DOCUMENT_TYPES)
  documentType: DOCUMENT_TYPES = DOCUMENT_TYPES.TODOS;

  @IsEnum(ZIP_FILE_FORMAT)
  format: ZIP_FILE_FORMAT = ZIP_FILE_FORMAT.JSON;
}
