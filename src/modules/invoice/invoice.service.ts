import { Injectable } from '@nestjs/common';
import {
  buildCommonInfo,
  generarFilasEnBlancosReporte,
  generateCodeQR,
  generatePayloadJsonFile,
  getNexyDay,
  makeUrl,
} from '@app/utils';
import { InvoiceRepository } from './invoice.repository';
import { LIMITE_PAGINAS_REPORTES } from '@app/config';
import {
  getNameTemplate,
  IJSonFile,
  IResultDataforReports,
} from '@app/interfaces';
import { contribuyentes } from '@prisma/client';
import { CarboneService } from '../carbone/carbone.service';
import { CarboneFormat } from '@app/enums';

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

interface IFileGenerated {
  jsonFile: Buffer;
  buffer: Buffer;
  dataTemplate: IResultDataforReports;
}
@Injectable()
export class InvoiceService {
  constructor(
    private readonly invoiceRepository: InvoiceRepository,
    private readonly _pdfService: CarboneService,
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

  async generateFiles(
    result: any,
    contribuyente: contribuyentes,
    generateJsonFile = true,
  ): Promise<IFileGenerated> {
    const fechaNextDay: string = getNexyDay(result?.fechaProcesamiento);
    let jsonFile: Buffer;
    if (generateJsonFile) {
      const payloadJSON: IJSonFile = generatePayloadJsonFile(
        result.payload.hacienda,
        result,
      );
      jsonFile = Buffer.from(JSON.stringify(payloadJSON, null, 2), 'utf-8');
    }

    const template: string = getNameTemplate(
      result.payload.hacienda.identificacion.tipoDte,
      contribuyente,
    );
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

    if (dataTemplate.data.length < LIMITE_PAGINAS_REPORTES) {
      generarFilasEnBlancosReporte(dataTemplate, LIMITE_PAGINAS_REPORTES);
    }

    const buffer: Buffer =
      await this._pdfService.renderTemplate<IResultDataforReports>({
        templateKey: template,
        data: dataTemplate,
        format: CarboneFormat.pdf,
      });

    return { jsonFile, buffer, dataTemplate };
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
