import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  buildCommonInfo,
  generatePayloadJsonFile,
  getNexyDay,
  makeUrl,
} from '@app/utils';
import { GENERATE_DOCUMENT, NATS_SERVICE } from '@app/config';
import { IJSonFile, IResultDataforReports } from '@app/interfaces';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, firstValueFrom } from 'rxjs';
import { JobId } from 'bull';
import { IFileGenerated } from '../document-generator/interfaces';

interface IGenerateUrl {
  ambiente: string;
  codigoGeneracion: string;
  fecEmi: string;
  baseUrl: string;
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
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  generateUrl({ ambiente, codigoGeneracion, fecEmi, baseUrl }: IGenerateUrl) {
    return makeUrl({
      ambiente: ambiente,
      codigoGeneracion: codigoGeneracion,
      fecEmi: fecEmi,
      url: baseUrl,
    });
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
      recep:
        result.payload.hacienda.receptor ??
        result.payload.hacienda?.['sujetoExcluido'],
      result,
      resumen: result.payload.hacienda.resumen,
    });

    const invoiceType = result.payload.hacienda.identificacion.tipoDte;
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
            econimicActivity:
              dataTemplate.info?.['receptor']?.['descActividad'],
            direction: {
              city: dataTemplate.info?.['receptor']?.['direccion']?.[
                'municipio'
              ],
              complement:
                dataTemplate.info?.['receptor']?.['direccion']?.['complemento'],
              department:
                dataTemplate.info?.['receptor']?.['direccion']?.[
                  'departamento'
                ],
            },
            nrc: dataTemplate.info?.['receptor']?.['nrc'],
            phone: dataTemplate.info?.['receptor']?.['telefono'],
            doctor: dataTemplate.info?.['infoSeguros']?.['medico'],
            deducible: dataTemplate.info?.['infoSeguros']?.['deducible'],
            copaago: dataTemplate.info?.['infoSeguros']?.['copaago'],
            coaseguroPercentage:
              dataTemplate.info?.['infoSeguros']?.['porcentajeCoaseguro'],
            atencionId: dataTemplate.info?.['infoSeguros']?.['atencionId'],
            insuranceCompany:
              dataTemplate.info?.['infoSeguros']?.['aseguradora'],
          },
          extension: {
            nombreEntrega: dataTemplate.info?.['extension']?.['nombEntrega'],
            noDocumentoEntrega:
              dataTemplate.info?.['extension']?.['docuEntrega'],
            nombreRecibe: dataTemplate.info?.['extension']?.['nombRecibe'],
            noDocumentoRecibe: dataTemplate.info?.['extension']?.['docuRecibe'],
          },
          resume: dataTemplate.info?.['resumen'],
          body: dataTemplate.data,
          fechaNextDay,
        },
        extension: 'pdf',
        fileName: `${identification?.['codigoGeneracion']}`,
        folder: `${jobId}`,
        invoiceType,
      }),
    ).catch(
      catchError((error) => {
        this.#logger.error(error);
        throw new RpcException(error);
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
