import { envs } from '@app/config';
import { InvoiceService } from '../../invoice/invoice.service';
import { IFileGenerated } from '../interfaces';
import {
  DataGroupedByDate,
  IGroup,
  IResultDataforReports,
  ItemsGroupped,
} from '@app/interfaces';
import { JobId } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { DocumentGrouperService } from './document-grouper.service';
interface IProcessInvoiceItem {
  item: ItemsGroupped;
  identification: any;
  jobId: JobId;
}

interface ProcessInvoiceResponse {
  jsonFile: Buffer;
  pdfDocument: string;
  dataTemplate: IResultDataforReports;
  buffer: IFileGenerated;
}

@Injectable()
export class DocumentProcessorService {
  #logger = new Logger(DocumentProcessorService.name);
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly documentGrouper: DocumentGrouperService,
  ) {}

  async processGroupedData(
    groupedData: IGroup<ItemsGroupped>,
    jobId: JobId,
  ): Promise<DataGroupedByDate> {
    const batchSize = 20;
    const dataGroupedByDate: DataGroupedByDate = {};
    const entries = Object.entries(groupedData);

    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, i + batchSize);
      this.#logger.debug('processing batch', { batch: i });

      for (const [fecha, clientInvoices] of batch) {
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
            await this.documentGrouper.groupDataByDateAndType(
              {
                pdfDocument: processedData.pdfDocument,
                identificacion: item.hacienda?.['identificacion'],
              },
              fecha,
              dataGroupedByDate,
            );
          }),
        );
      }
      // batch.map(async ([fecha, clientInvoices]) => {}),
      this.#logger.debug('batch processed', { batch: i });
    }

    return dataGroupedByDate;
  }
  private async processInvoiceItem({
    item,
    identification,
    jobId,
  }: IProcessInvoiceItem): Promise<ProcessInvoiceResponse> {
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

    return {
      buffer: document,
      ...document,
    };
  }
}
