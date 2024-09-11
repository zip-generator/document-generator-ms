import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import { join } from 'path';
interface ISaveBufferToFile {
  document: PDFKit.PDFDocument;
  fileName: string;
  folder: string;
  extension: string;
}
interface ISaveJsonFile<T>
  extends Pick<ISaveBufferToFile, 'fileName' | 'folder'> {
  data: T;
}
@Injectable()
export class TempFileService {
  #logger = new Logger(TempFileService.name);
  constructor() {}

  async saveBufferToFile({
    document,
    fileName,
    folder,
    extension,
  }: ISaveBufferToFile) {
    const dirPath = join(process.cwd(), 'temp-data', folder);

    await this.createDirectoryIfNotExists(dirPath);

    try {
      document.info.Title = fileName;
      document.pipe(
        fs.createWriteStream(join(dirPath, `${fileName}.${extension}`)),
      );

      document.end();
      this.#logger.log('File has been written', {
        [`fileName.${extension}`]: join(dirPath, `${fileName}.${extension}`),
      });
      return join(dirPath, `${fileName}.${extension}`);
    } catch (err) {
      this.#logger.error('Failed to write file', {
        dirPath,
        error: err.message,
      });
      throw err;
    }
  }

  async saveJsonFile<T>({
    fileName,
    folder,
    data,
  }: ISaveJsonFile<T>): Promise<string> {
    const dirPath = join(process.cwd(), 'temp-data', folder);
    await this.createDirectoryIfNotExists(dirPath);

    try {
      const filePath = join(dirPath, `${fileName}.json`);
      await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));

      return filePath;
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
