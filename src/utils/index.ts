import {
  IJSonFile,
  IResultDataforReports,
  IResultReporte,
} from '@app/interfaces';
import { addDays } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
export * from './make-template';
import { randomUUID, UUID } from 'crypto';
const timeZone = 'America/El_Salvador';
const removeLatestItem = <T>(array: T[]) => {
  array.pop();
  return array;
};
const generarFilasEnBlancosReporte = (
  infoReporte: IResultDataforReports,
  limiteColumnas: number,
) => {
  const filas = [];
  for (let i = infoReporte.data.length; i < limiteColumnas; i++) {
    infoReporte.data.push({
      numItem: null,
      tipoItem: null,
      numeroDocumento: null,
      cantidad: null,
      codigo: null,
      codTributo: null,
      uniMedida: null,
      descripcion: '',
      precioUni: null,
      montoDescu: null,
      ventaNoSuj: null,
      ventaExenta: null,
      ventaGravada: null,
      tributos: null,
      psv: null,
      noGravado: null,
      ivaItem: null,
      compra: null,
    });
  }
  return filas;
};

const getNexyDay = (date: Date) => {
  const nextDay = addDays(date, 1);

  return formatInTimeZone(nextDay, timeZone, 'dd-MM-yyyy');
};

const generatePayloadJsonFile = (
  payloadMH: any,
  invoice: IResultReporte,
): IJSonFile => {
  console.log({ invoice });
  return {
    ...payloadMH,
    selloRecibido: invoice.sello,
    firmaElectronica: invoice.dte?.['body'] ?? invoice['body'],
  };
};

const parseJson = (json: string | object): object => {
  return json instanceof Object ? json : JSON.parse(json);
};

const getRandomUuid = (): UUID => {
  return randomUUID();
};

export {
  removeLatestItem,
  generarFilasEnBlancosReporte,
  getNexyDay,
  generatePayloadJsonFile,
  parseJson,
  getRandomUuid,
};
