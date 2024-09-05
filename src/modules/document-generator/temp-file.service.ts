import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import { join } from 'path';
interface ISaveBufferToFile {
  buffer: Buffer;
  fileName: string;
  folder: string;
  extension: string;
}
@Injectable()
export class TempFileService {
  #logger = new Logger(TempFileService.name);
  constructor() {}

  async saveBufferToFile({
    buffer,
    fileName,
    folder,
    extension,
  }: ISaveBufferToFile) {
    const dirPath = join(process.cwd(), 'temp-data', folder);
    await this.createDirectoryIfNotExists(dirPath);

    this.#logger.debug('saving file', {
      fileName,
      folder,
      extension,
      path: join(dirPath, `${fileName}.${extension}`),
    });
    try {
      await fs.promises.writeFile(
        join(dirPath, `${fileName}.${extension}`),
        buffer,
      );
      return join(dirPath, `${fileName}.${extension}`);
    } catch (err) {
      this.#logger.error('Failed to write file', {
        dirPath,
        error: err.message,
      });
      throw err;
    }
  }
  private async createDirectoryIfNotExists(dirPath: string) {
    try {
      await fs.promises.mkdir(dirPath, {
        recursive: true,
      });
    } catch (err) {
      console.error(`Failed to create directory: ${dirPath}`, err);
      throw err;
    }
  }
}
