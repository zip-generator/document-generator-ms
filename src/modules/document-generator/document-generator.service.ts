import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { GeneratePdfDto } from './dto';
import { DocumentRepository } from './repository/document.repository';
import {
  DataGroupedByDate,
  IGroup,
  ItemsGroupped,
  ResultExtend,
} from '@app/interfaces';
import { format } from 'date-fns';
import { envs, NATS_SERVICE, PDF_CREATED } from '@app/config';
import { GroupBy } from '@app/plugins/lodash.plugin';
import { InvoiceService } from '../invoice/invoice.service';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { parseJson } from '@app/utils';
import { IFileGenerated, ResponseDocument } from './interfaces';
import { JobId } from 'bull';
import { firstValueFrom } from 'rxjs';

interface IProcessInvoiceItem {
  item: ItemsGroupped;
  identification: any;
  jobId: JobId;
}
@Injectable()
export class DocumentGeneratorService {
  #logger = new Logger(DocumentGeneratorService.name);
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly invoiceService: InvoiceService,
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}
  async generatePdf(
    params: GeneratePdfDto,
    jobId: JobId,
  ): Promise<ResponseDocument> {
    try {
      const [data] = await Promise.all([
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

      // const dataGroupedByDate: DataGroupedByDate =
      const response: DataGroupedByDate = await this.processGroupedData(
        grouppedData,
        jobId,
      );

      this.#logger.debug('sending data to nats service', { jobId });
      const responseq = await firstValueFrom(
        this.client.send<DataGroupedByDate>(PDF_CREATED, {
          data: {
            data: response,
          },
          jobId: +jobId,
        }),
      );

      return {
        message: 'pdf created',
        status: HttpStatus.OK,
        data: responseq,
      };
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
    jobId: JobId,
  ): Promise<DataGroupedByDate> {
    const dataGroupedByDate: DataGroupedByDate = {};
    await Promise.all(
      Object.entries(groupedData).map(async ([fecha, clientInvoices]) => {
        await Promise.all(
          clientInvoices.map(async (item) => {
            const processedData = await this.processInvoiceItem({
              item,
              identification: {
                ...item.hacienda?.['identificacion'],
                sello: item?.sello,
              },
              jobId,
            });
            await this.groupDataByDateAndType(
              {
                pdfDocument: processedData.pdfDocument,
                identificacion: item.hacienda?.['identificacion'],
              },
              fecha,
              dataGroupedByDate,
            );
          }),
        );
      }),
    );

    return dataGroupedByDate;
  }

  private async processInvoiceItem({
    item,
    identification,
    jobId,
  }: IProcessInvoiceItem) {
    const { fechaProcesamiento, hacienda } = item;
    const url = this.invoiceService.generateUrl({
      ambiente: hacienda?.['identificacion']?.['ambiente'],
      codigoGeneracion: hacienda?.['identificacion']?.['codigoGeneracion'],
      fecEmi: hacienda?.['identificacion']?.['fecEmi'],
      baseUrl: envs.invoiceQueryUrl,
    });
    const document: IFileGenerated = await this.invoiceService.generateFiles({
      result: { fechaProcesamiento, payload: { hacienda } },
      generateJsonFile: false,
      identification,
      jobId,
      url,
    });
    //TODO: ELIMINAR ESTO
    // const codeQR = await this.invoiceService.generateCodesQR({
    //   url,
    //   buffer: document.buffer,
    //   codigoGeneracion: hacienda?.['identificacion']['codigoGeneracion'],
    //   numeroControl: hacienda?.['identificacion']['numeroControl'],
    //   sello,
    // });

    return {
      buffer: document,
      ...document,
    };
  }
  private async groupDataByDateAndType(
    processedData: { pdfDocument: string; identificacion: any },
    fecha: string,
    dataGroupedByDate: any,
  ): Promise<void> {
    const tipoDte = processedData.identificacion?.tipoDte;

    if (!dataGroupedByDate[fecha]) {
      dataGroupedByDate[fecha] = {};
    }

    if (!dataGroupedByDate[fecha][tipoDte]) {
      dataGroupedByDate[fecha][tipoDte] = [];
    }

    dataGroupedByDate[fecha][tipoDte].push({
      buffer: processedData.pdfDocument,
      identificacion: processedData.identificacion,
    });
  }
}
