import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { GeneratePdfDto } from '../dto';
import { DocumentRepository } from '../repository/document.repository';
import {
  DataGroupedByDate,
  IGroup,
  ItemsGroupped,
  ResultExtend,
} from '@app/interfaces';
import { format } from 'date-fns';
import { envs, NATS_SERVICE, PDF_CREATED } from '@app/config';
import { GroupBy } from '@app/plugins/lodash.plugin';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { getRandomUuid, parseJson } from '@app/utils';
import { ResponseDocument } from '../interfaces';
import { Job } from 'bull';
import { firstValueFrom } from 'rxjs';
import { DocumentProcessorService } from './document-processor.service';

import { TempFileService } from './temp-file.service';

const delimiter = '-';
@Injectable()
export class DocumentGeneratorService {
  #logger = new Logger(DocumentGeneratorService.name);
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly documentProcessor: DocumentProcessorService,
    private readonly tempFolderService: TempFileService,
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}
  async generatePdf(
    params: GeneratePdfDto,
    jobId: Job,
  ): Promise<ResponseDocument> {
    try {
      const [data] = await Promise.all([
        this.documentRepository.searchInvoices(params) as Promise<
          ResultExtend[]
        >,
        this.documentRepository.searchContributorByApiKey(envs.apiKey),
      ]);
      if (!data.length) {
        await jobId.moveToFailed({
          message: 'no data found',
        });
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'no data found',
        });
      }

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
      const response: DataGroupedByDate =
        await this.documentProcessor.processGroupedData(grouppedData, jobId.id);

      const fileName =
        await this.tempFolderService.saveJsonFile<DataGroupedByDate>({
          data: response,
          fileName: `${jobId.id}`,
          folder: `${jobId.id}${delimiter}${getRandomUuid()}`,
        });

      const responseq = await firstValueFrom(
        this.client.send<DataGroupedByDate>(PDF_CREATED, {
          data: {
            fileName,
          },
          jobId: +jobId.id,
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
}
