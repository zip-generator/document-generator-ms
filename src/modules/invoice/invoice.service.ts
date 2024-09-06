import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  buildCommonInfo,
  generateCodeQR,
  generatePayloadJsonFile,
  getNexyDay,
  makeUrl,
} from '@app/utils';
import { InvoiceRepository } from './invoice.repository';
import { GENERATE_DOCUMENT, NATS_SERVICE } from '@app/config';
import { IJSonFile, IResultDataforReports } from '@app/interfaces';
import { PrinterService } from '../pdf-make/printer.service';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { JobId } from 'bull';
import { IFileGenerated } from '../document-generator/interfaces';

interface IGenerateUrl {
  ambiente: string;
  codigoGeneracion: string;
  fecEmi: string;
  baseUrl: string;
}
interface IGenerateCodes {
  buffer: Buffer;
  codigoGeneracion: string;
  sello: string;
  url: string;
  numeroControl: string;
}

interface IGenerateFiles {
  result: any;
  generateJsonFile: boolean;
  identification: unknown;
  jobId: JobId;
  url: string;
}
@Injectable()
export class InvoiceService {
  #logger = new Logger(InvoiceService.name);
  constructor(
    private readonly invoiceRepository: InvoiceRepository,
    private readonly _pdfService: PrinterService,
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}

  generateUrl({ ambiente, codigoGeneracion, fecEmi, baseUrl }: IGenerateUrl) {
    return makeUrl({
      ambiente: ambiente,
      codigoGeneracion: codigoGeneracion,
      fecEmi: fecEmi,
      url: baseUrl,
    });
  }
  async generateCodesQR({
    buffer,
    codigoGeneracion,
    sello,
    url,
    numeroControl,
  }: IGenerateCodes) {
    return await generateCodeQR(
      buffer,
      codigoGeneracion,
      sello,
      url,
      numeroControl,
    );
  }

  async generateFiles({
    result,
    generateJsonFile = true,
    identification,
    jobId,
    url,
  }: IGenerateFiles): Promise<IFileGenerated> {
    const fechaNextDay: string = getNexyDay(result?.fechaProcesamiento);
    let jsonFile: Buffer;
    if (generateJsonFile) {
      const payloadJSON: IJSonFile = generatePayloadJsonFile(
        result.payload.hacienda,
        result,
      );
      jsonFile = Buffer.from(JSON.stringify(payloadJSON, null, 2), 'utf-8');
    }

    // getNameTemplate(
    //   result.payload.hacienda.identificacion.tipoDte,
    //   contribuyente,
    // );
    const dataTemplate: IResultDataforReports = buildCommonInfo({
      cuerpoDocumento: result.payload.hacienda.cuerpoDocumento,
      documentoR:
        result.payload.hacienda.receptor?.nit ??
        result.payload.hacienda.receptor?.tipoDocumento,
      emisor: result.payload.hacienda.emisor,
      estado: result.estado,
      extension: result.payload.hacienda.extension,
      fechaNextDay,
      identificacion: result.payload.hacienda.identificacion,
      infoSeguros: result.payload.informacionSeguros,
      ivaValue: this.calculateIvaValue(result.payload.hacienda.resumen),
      recep: result.payload.hacienda.receptor,
      result,
      resumen: result.payload.hacienda.resumen,
    });

    const pdfDocument: string = await firstValueFrom(
      this.client.send(GENERATE_DOCUMENT, {
        data: {
          header: {
            controlNumber: result.payload.hacienda.identificacion.numeroControl,
            emitionDate: result.payload.hacienda.identificacion.fecEmi,
            emitionTime: result.payload.hacienda.identificacion.horEmi,
            generationCode:
              result.payload.hacienda.identificacion.codigoGeneracion,
            receptionStamp: identification?.['sello'],
            url,
          },
          receptor: {
            name: dataTemplate.info?.['receptor']?.['nombre'],
            document: dataTemplate.info?.['receptor']?.['numDocumento'],
            econimicActivity: {
              activityDescription:
                dataTemplate.info?.['receptor']?.['descActividad'],
              activityCode: dataTemplate.info?.['receptor']?.['codActividad'],
            },
            direction: {
              city: dataTemplate.info?.['receptor']?.['municipio'],
              complement: dataTemplate.info?.['receptor']?.['complemento'],
              department: dataTemplate.info?.['receptor']?.['departamento'],
            },
            nrc: dataTemplate.info?.['receptor']?.['nrc'],
            phone: dataTemplate.info?.['receptor']?.['telefono'],
          },
        },
        extension: 'pdf',
        fileName: `${identification?.['codigoGeneracion']}`,
        folder: `${jobId}`,
      }),
    );
    return {
      jsonFile,
      pdfDocument,
      dataTemplate,
    };
  }

  calculateIvaValue(resumen: any) {
    return (
      resumen.totalIva ??
      resumen?.tributos?.reduce((acumulador: number, tributo) => {
        if (tributo?.codigo === '20') {
          return acumulador + tributo?.valor;
        }
        return acumulador;
      }, 0)
    );
  }
}
