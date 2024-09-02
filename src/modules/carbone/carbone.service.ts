import { CarboneFormat } from '@app/enums';
import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import * as carbone from 'carbone';
import { existsSync } from 'fs';
import { join } from 'path';
import { promisify } from 'util';

interface RenderOptions<T> {
  templateKey: string;
  data: T;
  format: CarboneFormat;
}
// type RenderFunction<T> = (
//   template: string,
//   data: T,
//   options: { convertTo: CarboneFormat },
// ) => Promise<Buffer>;

@Injectable()
export class CarboneService {
  // private readonly renderAsync: RenderFunction<unknown> = promisify(
  //   carbone.render,
  // ) as unknown as RenderFunction<unknown>;
  async renderTemplate<T>(params: RenderOptions<T>): Promise<Buffer> {
    try {
      const renderCarbone = promisify(carbone.render) as (
        template: string,
        data: T,
        option: object,
      ) => Promise<Buffer>;
      const { templateKey, data, format = CarboneFormat.pdf } = params;
      const path = this.getPath(templateKey);

      const result = await renderCarbone(path, data, {
        convertTo: format,
      });

      // Asegúrate de que el resultado sea un Buffer
      if (typeof result === 'string') {
        return Buffer.from(result);
      }

      return result;
    } catch (error) {
      throw new RpcException(error);
    }
  }
  getPath(templateKey: string): string {
    const path = join(__dirname, `../../public/templates/${templateKey}`);
    if (!existsSync(path)) {
      throw new Error(`Template not found at ${path}`);
    }
    return path;
  }
}
