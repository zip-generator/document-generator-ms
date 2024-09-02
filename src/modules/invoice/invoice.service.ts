import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import {
  buildCommonInfo,
  generarFilasEnBlancosReporte,
  generateCodeQR,
  generatePayloadJsonFile,
  getNexyDay,
  makeUrl,
} from '@app/utils';
import { InvoiceRepository } from './invoice.repository';
import {
  envs,
  LIMITE_PAGINAS_REPORTES,
  TIPO_IDENTIFICACION,
} from '@app/config';
import {
  getNameTemplate,
  IJSonFile,
  IResultDataforReports,
  ITemplateInfo,
} from '@app/interfaces';
import { CurrencyAdapter } from '@app/plugins';
import { contribuyentes } from '@prisma/client';
import { CarboneService } from '../carbone/carbone.service';
import { CarboneFormat } from '@app/enums';

interface IGenerateInvoiceReportProp {
  codigo: string;
  whatsApp: string[];
  email: string[];
  apiKey: string;
}
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

interface IGenerateSubject {
  tipoDte: string;
  receiverName: string;
  generationCode: string;
}
interface ISubject {
  subject: string;
  documentName: string;
  invoiceName: string;
}
interface InvoiceDetails {
  receiverName: string; // Nombre del receptor
  emitterName: string; // Nombre del emisor
  invoiceName: string; // Nombre de la factura
  generationCode: string; // Código de generación
  date: string; // Fecha de emisión (puede ser en formato ISO o cualquier formato de fecha)
  totalOperation: number; // Monto total de la operación
  totalToPay: number; // Monto total a pagar
  totalSubjectToRetention: number; // Monto total sujeto a retención
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
  async generateInvoiceReport(params: IGenerateInvoiceReportProp) {
    const { codigo, whatsApp, email, apiKey } = params;
    const { result, contribuyente } = await this.getFacturaAndContribuyente(
      codigo,
      apiKey,
    );

    const { jsonFile, buffer, dataTemplate } = await this.generateFiles(
      result,
      contribuyente,
    );

    const url = this.generateUrl({
      ambiente: result?.payload?.hacienda.identificacion.ambiente,
      codigoGeneracion: result.payload.hacienda.identificacion.codigoGeneracion,
      fecEmi: result.payload.hacienda.identificacion.fecEmi,
      baseUrl: envs.invoiceQueryUrl,
    });
    const codeQR = await this.generateCodesQR({
      url,
      buffer,
      codigoGeneracion: result.payload.hacienda.identificacion.codigoGeneracion,
      sello: result.sello,
      numeroControl: result.payload.hacienda.identificacion.numeroControl,
    });

    const {
      subject,
      documentName,
      invoiceName: nameFactura,
    } = this.createInvoiceDetail({
      tipoDte: result.payload.hacienda.identificacion.tipoDte,
      receiverName: result.payload.hacienda.receptor.nombre,
      generationCode: result.payload.hacienda.identificacion.codigoGeneracion,
    });

    const templateInfo: ITemplateInfo = this.templateInfo({
      receiverName: result.payload.hacienda.receptor.nombre as string,
      emitterName: result.payload.hacienda.emisor.nombre as string,
      generationCode: result.payload.hacienda.identificacion
        .codigoGeneracion as string,
      date: result.payload.hacienda.identificacion.fecEmi as string,
      totalOperation: result.payload.hacienda.resumen
        .totalComprobante as number,
      totalToPay: result.payload.hacienda.resumen.totalImpuesto as number,
      totalSubjectToRetention: result.payload.hacienda.resumen
        .totalComprobante as number,
      invoiceName: nameFactura,
    });

    return {
      jsonFile,
      buffer,
      dataTemplate,
      codeQR,
      subject,
      documentName,
      templateInfo,
      email,
      whatsApp,
      identificacion: result.payload.hacienda.identificacion as string,
    };
  }
  templateInfo({
    receiverName,
    emitterName,
    invoiceName,
    generationCode,
    date,
    totalOperation,
    totalToPay,
    totalSubjectToRetention,
  }: InvoiceDetails): ITemplateInfo {
    return {
      nombreCliente: receiverName,
      empresaEmisor: emitterName,
      codigoGeneracion: generationCode,
      fecha: date,
      monto: CurrencyAdapter.create(
        totalOperation ?? totalToPay ?? totalSubjectToRetention,
      ).format(),
      nameFactura: invoiceName,
    };
  }

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
  async getFacturaAndContribuyente(codigo: string, apiKey: string) {
    const result =
      await this.invoiceRepository.reportFacturaElectronica(codigo);
    if (!result)
      throw new UnprocessableEntityException('No se encontro la factura');

    const contribuyente =
      await this.invoiceRepository.searchContributorByApiKey(apiKey);

    return { result, contribuyente };
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

  createInvoiceDetail({
    tipoDte,
    receiverName,
    generationCode,
  }: IGenerateSubject): ISubject {
    const subject = `${TIPO_IDENTIFICACION[tipoDte]} ${receiverName}`;
    const documentName = generationCode;
    const invoiceName = TIPO_IDENTIFICACION[tipoDte] as string;
    return { subject, documentName, invoiceName };
  }
}
