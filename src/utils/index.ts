import {
  IJSonFile,
  IResultDataforReports,
  IResultReporte,
} from '@app/interfaces';
import * as qrCode from 'qrcode';
import { PDFDocument, rgb } from 'pdf-lib';
import { addDays } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
export * from './make-template';

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
export const generateCodeQR = async (
  buffer: Buffer,
  codigoGeneracion?: string,
  sello?: string,
  urlHacienda?: string,
  numeroControl?: string,
): Promise<Buffer> => {
  const pdfDoc = await PDFDocument.load(buffer);

  const qrCodes = [
    { url: urlHacienda.trim(), size: 77, label: 'portal MH' },
    { url: codigoGeneracion, size: 50, label: 'Código Generación' },
    { url: numeroControl, size: 50, label: 'Número de control' },
    { url: sello, size: 50, label: 'Sello de recepción' },
  ];

  // Iterate through the pages of the PDF
  const pdfPage = pdfDoc.getPage(0);
  const { width, height } = pdfPage.getSize();

  const imgY = height - 100 - 135 + 20; // Move up by approximately 4 cm
  let imgX = width - 40; // Start x-coordinate for right alignment

  for (let i = qrCodes.length - 1; i >= 0; i--) {
    const { url, size, label } = qrCodes[i];
    const qrDataURL = await qrCode.toDataURL(url);

    const imgWidth = size;
    const imgHeight = size;

    const img = await pdfDoc.embedPng(qrDataURL);

    pdfPage.drawImage(img, {
      x: imgX - imgWidth,
      y: imgY,
      width: imgWidth,
      height: imgHeight,
    });

    let textX = imgX - imgWidth;

    // If the label is "portal MH", move the text 10 units to the right
    if (label === 'portal MH') {
      textX += 17;
    }

    // Draw the label text below the QR code with a smaller font size of 10
    pdfPage.drawText(label, {
      x: textX,
      y: imgY - 17 + 1, // Adjust this value to position the text
      size: 7, // Font size set to 10
      color: rgb(0, 0, 0),
    });

    imgX -= imgWidth + 20; // Decrement x-coordinate for the previous image, and add a small gap
  }

  const newBuffer = await pdfDoc.save();

  return Buffer.from(newBuffer);
};

const getNexyDay = (date: Date) => {
  const nextDay = addDays(date, 1);

  return formatInTimeZone(nextDay, timeZone, 'dd-MM-yyyy');
};

const generatePayloadJsonFile = (
  payloadMH: any,
  invoice: IResultReporte,
): IJSonFile => {
  return {
    ...payloadMH,
    selloRecibido: invoice.sello,
    firmaElectronica: invoice.dte?.['body'] ?? invoice['body'],
  };
};

const parseJson = (json: string | object): object => {
  return json instanceof Object ? json : JSON.parse(json);
};

export {
  removeLatestItem,
  generarFilasEnBlancosReporte,
  getNexyDay,
  generatePayloadJsonFile,
  parseJson,
};
