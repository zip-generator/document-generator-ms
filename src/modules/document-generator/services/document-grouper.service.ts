import { Injectable } from '@nestjs/common';

@Injectable()
export class DocumentGrouperService {
  async groupDataByDateAndType(
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
