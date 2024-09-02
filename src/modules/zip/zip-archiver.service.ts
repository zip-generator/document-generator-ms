/* eslint-disable @typescript-eslint/no-empty-function */
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as Archiver from 'archiver';
import * as path from 'path';
import { IData } from './interfaces';
import { RpcException } from '@nestjs/microservices';

interface IZipProps<T> {
  data: IData<T>;
}
@Injectable()
export class ZipServiceArchiver {
  #logger = new Logger(ZipServiceArchiver.name);

  async createInMemoryZipAndCleanup<T>({
    data,
  }: IZipProps<T>): Promise<Buffer> {
    try {
      const zipBuffer = await this.createZipInMemory<T>({ data });
      this.#logger.log('Zip file created successfully');
      return zipBuffer;
    } catch (error) {
      this.#logger.warn(
        'Error creating zip file in createInMemoryZipAndCleanup:',
        error,
      );
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error creating zip file',
      });
    }
  }

  private async createZipInMemory<T>({ data }: IZipProps<T>): Promise<Buffer> {
    this.#logger.warn('Creating zip in memory...');

    const archive = Archiver('zip', { zlib: { level: 9 } });
    const buffers: Buffer[] = [];

    return new Promise<Buffer>((resolve, reject) => {
      archive.on('data', (chunk: Buffer) => buffers.push(chunk));
      archive.on('end', () => resolve(Buffer.concat(buffers)));
      archive.on('error', (error) => {
        this.#logger.error('Error creating zip file:', error);
        reject(error);
      });
      // Add files to the archive
      for (const dateKey in data) {
        this.#logger.log('Processing dateKey:', dateKey);
        const clientData: T[] = data[dateKey];
        for (const tipoFac in clientData) {
          for (const file of clientData[tipoFac] as T[]) {
            const fileName = `${file?.['identificacion']?.['codigoGeneracion']}.pdf`;
            const fileContent = file?.['buffer'] ?? Buffer.alloc(0);
            archive.append(fileContent, {
              name: path.join(dateKey.toString(), tipoFac.toString(), fileName),
            });
          }
        }
      }
      this.#logger.warn('Finalizing archive...');
      // Finalize the archive
      return archive.finalize();
    });
  }
}
