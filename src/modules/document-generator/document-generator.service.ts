import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { GeneratePdfDto } from './dto';
import { DocumentRepository } from './repository/document.repository';
import { IGroup, ItemsGroupped, ResultExtend } from '@app/interfaces';
import { format } from 'date-fns';
import { envs } from '@app/config';
import { GroupBy } from '@app/plugins/lodash.plugin';
import { InvoiceService } from '../invoice/invoice.service';
import { ZipServiceArchiver } from '../zip/zip-archiver.service';
import { contribuyentes } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import { parseJson } from '@app/utils';

interface IProcessBatch {
  clientInvoices: ItemsGroupped[];
  fecha: string;
  contribuyente: contribuyentes;
  batchSize: number;
  dataGroupedByDate: any;
}
@Injectable()
export class DocumentGeneratorService {
  #logger = new Logger(DocumentGeneratorService.name);
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly invoiceService: InvoiceService,
    private readonly zipService: ZipServiceArchiver,
  ) {}
  async generatePdf(params: GeneratePdfDto) {
    try {
      const [data, contribuyente] = await Promise.all([
        this.documentRepository.searchInvoices(params) as Promise<
          ResultExtend[]
        >,
        this.documentRepository.searchContributorByApiKey(envs.apiKey),
      ]);

      const newData: ItemsGroupped[] = data.map(
        ({ payload, fechaProcesamiento, sello, ...rest }) => {
          if (fechaProcesamiento === null) return;
          const newPayload = parseJson(payload as string);
          return {
            ...rest,
            hacienda: newPayload?.['hacienda'],
            fechaEmision: format(fechaProcesamiento, 'yyyy-MM-dd'),
            fechaProcesamiento,
            sello,
          };
        },
      );
      const grouppedData: IGroup<ItemsGroupped> =
        GroupBy.property<ItemsGroupped>(newData, 'fechaEmision');

      const dataGroupedByDate = await this.processGroupedData(
        grouppedData,
        contribuyente,
      );
      this.#logger.debug('QLO', {
        dataGroupedByDate: dataGroupedByDate[0],
      });

      // return await this.zipService.createInMemoryZipAndCleanup<
      //   IData<ItemsGroupped>
      // >({
      //   data: dataGroupedByDate,
      // });
      return 'qlos';
    } catch (error) {
      this.#logger.error('Generate Pdf', error);
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'error generating pdf',
      });
    }
  }
  private async processGroupedData(
    groupedData: IGroup<ItemsGroupped>,
    contribuyente: contribuyentes,
    batchSize: number = 10,
  ) {
    const dataGroupedByDate = {};
    await Promise.all(
      Object.entries(groupedData).map(async ([fecha, clientInvoices]) => {
        await this.proccessBatches({
          batchSize,
          clientInvoices,
          contribuyente,
          dataGroupedByDate,
          fecha,
        });
      }),
    );
    return dataGroupedByDate;
  }

  private async proccessBatches({
    batchSize,
    clientInvoices,
    contribuyente,
    dataGroupedByDate,
    fecha,
  }: IProcessBatch) {
    for (let i = 0; i < clientInvoices.length; i += batchSize) {
      const batch = clientInvoices.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (item) => {
          const processedData = await this.processInvoiceItem(
            item,
            contribuyente,
          );
          this.groupDataByDateAndType(
            {
              buffer: processedData.buffer,
              identificacion: item.hacienda?.['identificacion'],
            },
            fecha,
            dataGroupedByDate,
          );
        }),
      );
    }
  }
  private async processInvoiceItem(
    item: ItemsGroupped,
    contribuyente: contribuyentes,
  ) {
    const { fechaProcesamiento, hacienda, sello } = item;

    const document = await this.invoiceService.generateFiles(
      { fechaProcesamiento, payload: { hacienda } },
      contribuyente,
      false,
    );

    const url = this.invoiceService.generateUrl({
      ambiente: hacienda?.['identificacion']?.['ambiente'],
      codigoGeneracion: hacienda?.['identificacion']?.['codigoGeneracion'],
      fecEmi: hacienda?.['identificacion']?.['fecEmi'],
      baseUrl: envs.invoiceQueryUrl,
    });

    const codeQR = await this.invoiceService.generateCodesQR({
      url,
      buffer: document.buffer,
      codigoGeneracion: hacienda?.['identificacion']['codigoGeneracion'],
      numeroControl: hacienda?.['identificacion']['numeroControl'],
      sello,
    });

    return {
      buffer: codeQR,
      ...document,
    };
  }
  private groupDataByDateAndType(
    processedData: { buffer: Buffer; identificacion: any },
    fecha: string,
    dataGroupedByDate: any,
  ): void {
    const tipoDte = processedData.identificacion?.tipoDte;

    if (!dataGroupedByDate[fecha]) {
      dataGroupedByDate[fecha] = {};
    }

    if (!dataGroupedByDate[fecha][tipoDte]) {
      dataGroupedByDate[fecha][tipoDte] = [];
    }

    dataGroupedByDate[fecha][tipoDte].push({
      buffer: processedData.buffer,
      identificacion: processedData.identificacion,
    });
  }
}
// for (const [fecha, clientInvoices] of Object.entries(groupedData)) {
//   for (const item of clientInvoices) {
//     const { fechaProcesamiento, hacienda, sello } = item;

//     const document = await this.invoiceService.generateFiles(
//       { fechaProcesamiento, payload: { hacienda } },
//       contribuyente,
//       false,
//     );

//     const url = this.invoiceService.generateUrl({
//       ambiente: hacienda?.['identificacion']?.['ambiente'],
//       codigoGeneracion: hacienda?.['identificacion']?.['codigoGeneracion'],
//       fecEmi: hacienda?.['identificacion']?.['fecEmi'],
//       baseUrl: envs.invoiceQueryUrl,
//     });

//     const codeQR = await this.invoiceService.generateCodesQR({
//       url,
//       buffer: document.buffer,
//       codigoGeneracion: hacienda?.['identificacion']['codigoGeneracion'],
//       numeroControl: hacienda?.['identificacion']['numeroControl'],
//       sello,
//     });

//     const newDocument = { ...document, buffer: codeQR };
//     const tipoDte = hacienda?.['identificacion']?.tipoDte;

//     if (!dataGroupedByDate[fecha]) dataGroupedByDate[fecha] = {};
//     if (!dataGroupedByDate[fecha][tipoDte])
//       dataGroupedByDate[fecha][tipoDte] = [];

//     dataGroupedByDate[fecha][tipoDte].push({
//       buffer: newDocument.buffer,
//       identificacion: { ...hacienda?.['identificacion'] },
//     });
//   }
// }
// return dataGroupedByDate;
