import { PrismaService } from '@app/prisma.service';
import { Injectable } from '@nestjs/common';
import { GeneratePdfDto } from '../dto';
import { DOCUMENT_TYPES, ZIP_FILE_FORMAT } from '@app/enums';
import { removeLatestItem } from '@app/utils';
import {
  IFaturaElectronicaTransaccionalExtendedPdf,
  IResultReporte,
  ResultExtend,
} from '@app/interfaces';
import { contribuyentes } from '@prisma/client';

@Injectable()
export class DocumentRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async searchContributorByApiKey(apikey: string): Promise<contribuyentes> {
    return await this.prismaService.contribuyentes.findFirst({
      where: {
        apiKey: apikey,
      },
    });
  }

  async searchInvoices(
    params: GeneratePdfDto,
  ): Promise<IFaturaElectronicaTransaccionalExtendedPdf[] | IResultReporte[]> {
    const where = {};
    if (params.documentType && params.documentType !== DOCUMENT_TYPES.TODOS) {
      where['tiposDte'] = {
        codigoDte: params.documentType,
      };
    }

    if (params.from && params.to) {
      const fromDate = new Date(`${params.from}T00:00:00.000Z`);
      const toDate = new Date(`${params.to}T23:59:59.999Z`);

      where['fechaHoraProcesamiento'] = {
        gte: fromDate,
        lte: toDate,
        not: null,
      };
    }

    if (params.documentType === DOCUMENT_TYPES.TODOS) {
      const newDocumentTypes = removeLatestItem<DOCUMENT_TYPES>(
        Object.values(DOCUMENT_TYPES),
      );
      where['tiposDte'] = {
        codigoDte: {
          in: newDocumentTypes,
        },
      };
    }

    if (params.format === ZIP_FILE_FORMAT.JSON)
      return (await this.prismaService.facturaElectronicaTransacciones.findMany(
        {
          where,
          select: {
            dte: true,
            fechaEmision: true,
            id: true,
            uuid: true,
            payload: true,
            tiposDte: {
              select: {
                codigoDte: true,
                id: true,
              },
            },
          },
        },
      )) as unknown as IFaturaElectronicaTransaccionalExtendedPdf[];

    const result =
      await this.prismaService.facturaElectronicaTransacciones.findMany({
        where,
        select: {
          estadoDte: true,
          payload: true,
          selloRegistro: true,
          responseMh: true,
          observaciones: true,
          dte: true,
          fechaHoraProcesamiento: true,
          tiposDte: {
            select: {
              codigoDte: true,
              id: true,
            },
          },
          id: true,
          uuid: true,
        },
      });
    return this.formatData(result);
  }
  formatData(
    data: IFaturaElectronicaTransaccionalExtendedPdf[],
  ): ResultExtend[] {
    return data.map((item) => {
      return {
        estado: item.estadoDte,
        payload: item.payload,
        sello: item.selloRegistro,
        responseMH: item.responseMh,
        observaciones: item.observaciones,
        dte: item.dte,
        fechaProcesamiento: item.fechaHoraProcesamiento,
        tiposDte: item.tiposDte,
        id: item.id,
        uuid: item.uuid,
      };
    });
  }
}
