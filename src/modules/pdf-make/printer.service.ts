import { Injectable } from '@nestjs/common';
import { join } from 'path';
import PdfPrinter from 'pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

// const fonts = {
//   Roboto: {
//     normal: './fonts/Roboto-Regular.ttf',
//     bold: './fonts/Roboto-Bold.ttf',
//     italics: './fonts/Roboto-Italic.ttf',
//     bolditalics: './fonts/Roboto-BoldItalic.ttf',
//   },
// };
const fonts = {
  Roboto: {
    normal: join(__dirname, 'fonts/Roboto-Regular.ttf'),
    bold: join(__dirname, 'fonts/Roboto-Regular.ttf'),
    italics: join(__dirname, 'fonts/Roboto-Regular.ttf'),
    bolditalics: join(__dirname, 'fonts/Roboto-Regular.ttf'),
  },
};

@Injectable()
export class PrinterService {
  private printer = new PdfPrinter(fonts);

  createPdf(docDefinition: TDocumentDefinitions): PDFKit.PDFDocument {
    return this.printer.createPdfKitDocument(docDefinition);
  }
}
