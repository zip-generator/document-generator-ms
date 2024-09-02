import { PrismaService } from '@app/prisma.service';
import { Injectable } from '@nestjs/common';
import { contribuyentes } from '@prisma/client';

@Injectable()
export class InvoiceRepository {
  constructor(private readonly _prismaServices: PrismaService) {}

  findCorrelativo(tipoDte: number) {
    return this._prismaServices.facturaElectronicaCorrelativos.findFirst({
      where: {
        tipoDte: tipoDte,
      },
      select: {
        numeroControlActual: true,
        tipoDte: true,
        id: true,
        caja: true,
      },
    });
  }

  findTiposDte(tipoDte: string) {
    return this._prismaServices.tiposDte.findFirst({
      where: {
        codigoDte: tipoDte,
      },
      select: {
        id: true,
        schema: true,
        versionDte: true,
      },
    });
  }

  updateNumeroControlActual(id: number, numeroControl: number) {
    return this._prismaServices.facturaElectronicaCorrelativos.update({
      where: {
        id: id,
      },
      data: {
        numeroControlActual: numeroControl,
      },
    });
  }

  updatetokenContribuyente(id: number, token: string) {
    return this._prismaServices.contribuyentes.update({
      where: {
        id: id,
      },
      data: {
        token: token,
        fechaModificacion: new Date(),
      },
    });
  }

  async findFacturasContingencias(
    desde: string,
    hasta: string,
    nit?: string,
    id?: number,
  ) {
    const fechaDesde = new Date(desde);
    const fechaHasta = new Date(hasta);
    fechaHasta.setDate(fechaHasta.getDate() + 1);

    let where = {};

    if (id === undefined) {
      where = {
        fecha_emision: {
          gte: fechaDesde,
          lte: fechaHasta,
        },
        contribuyentes: {
          identificacion: {
            equals: nit,
          },
        },
        contingencia: 1,
      };
    } else {
      where = {
        idContingencia: id,
      };
    }

    const result =
      await this._prismaServices.facturaElectronicaTransacciones.findMany({
        where,
        select: {
          payload: true,
        },
        orderBy: {
          id: 'desc',
        },
      });
    return result.map((item) => item.payload);
  }

  async reportFacturaElectronica(idFactura: string) {
    const result =
      await this._prismaServices.facturaElectronicaTransacciones.findFirst({
        where: {
          uuid: idFactura,
        },
        select: {
          estadoDte: true,
          payload: true,
          selloRegistro: true,
          responseMh: true,
          observaciones: true,
          dte: true,
          fechaHoraProcesamiento: true,
        },
      });

    const payload =
      typeof result?.payload === 'object'
        ? result.payload
        : JSON.parse(result.payload);

    return {
      estado: result.estadoDte,
      payload,
      sello: result.selloRegistro,
      responseMH: result.responseMh,
      observaciones: result.observaciones,
      dte: result.dte,
      fechaProcesamiento: result.fechaHoraProcesamiento,
    };
  }

  async searchContributorByApiKey(apikey: string): Promise<contribuyentes> {
    return await this._prismaServices.contribuyentes.findFirst({
      where: {
        apiKey: apikey,
      },
    });
  }
}
