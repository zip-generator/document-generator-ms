import {
  Emisor,
  Extension,
  Identificacion,
  Insurance,
  IResultDataforReports,
  IResultReporte,
  Receptor,
  Resumen,
  SujetoExcluido,
} from '@app/interfaces';
import { CurrencyAdapter } from '@app/plugins';
import { STR_TIPOS_DTE } from 'src/enums';
import { DTE_CUSTOM } from '@app/config/constants';

const makeDocumentBodyExcludeSubject = (documentBody: any[]) => {
  return documentBody.map((item) => {
    return {
      ...item,
      precioUni: CurrencyAdapter.create(item.precioUni).format(),
      montoDescu: CurrencyAdapter.create(item.montoDescu).format(),
      compra: CurrencyAdapter.create(item.compra).format(),
    };
  });
};
const makeDocumentBodyWithholdingVoucher = (documentBody: any[]) => {
  return documentBody.map((item) => ({
    ...item,
    ivaRetenido: CurrencyAdapter.create(item.ivaRetenido).format(),
    montoSujetoGrav: CurrencyAdapter.create(item.montoSujetoGrav).format(),
  }));
};
const makeGenericDocumentBody = (documentBody: any[]) => {
  return documentBody.map((item) => ({
    ...item,
    precioUni: CurrencyAdapter.create(item.precioUni).format(),
    montoDescu: CurrencyAdapter.create(item.montoDescu).format(),
    ventaNoSuj: CurrencyAdapter.create(item.ventaNoSuj).format(),
    ventaExenta: CurrencyAdapter.create(item.ventaExenta).format(),
    ventaGravada: CurrencyAdapter.create(item.ventaGravada).format(),
  }));
};

const makeResumeExcludeSubject = (resume: any) => ({
  ...resume,
  subTotal: CurrencyAdapter.create(resume.subTotal).format(),
  reteRenta: CurrencyAdapter.create(resume.reteRenta).format(),
  totalDescu: CurrencyAdapter.create(resume.totalDescu).format(),
  totalPagar: CurrencyAdapter.create(resume.totalPagar).format(),
  totalCompra: CurrencyAdapter.create(resume.totalCompra).format(),
});

const makeResumeWithholdingVoucher = (resume: any) => ({
  ...resume,
  totalIVAretenido: CurrencyAdapter.create(resume.totalIVAretenido).format(),
  totalSujetoRetencion: CurrencyAdapter.create(
    resume.totalSujetoRetencion,
  ).format(),
});
const makeGenericResume = (resume: any) => {
  return {
    ...resume,
    totalPagar: CurrencyAdapter.create(resume.totalPagar).format(),
    totalNoSuj: CurrencyAdapter.create(resume.totalNoSuj).format(),
    totalNoGravado: CurrencyAdapter.create(resume.totalNoGravado).format(),
    totalIva: CurrencyAdapter.create(resume?.totalIva).format(),
    totalGravada: CurrencyAdapter.create(resume.totalGravada).format(),
    totalExenta: CurrencyAdapter.create(resume.totalExenta).format(),
    totalDescu: CurrencyAdapter.create(resume.totalDescu).format(),
    subTotalVentas: CurrencyAdapter.create(resume.subTotalVentas).format(),
    subTotal: CurrencyAdapter.create(resume.subTotal).format(),
    saldoFavor: CurrencyAdapter.create(resume.saldoFavor).format(),
    reteRenta: CurrencyAdapter.create(resume.reteRenta).format(),
    descuNoSuj: CurrencyAdapter.create(resume.descuNoSuj).format(),
    descuGravada: CurrencyAdapter.create(resume.descuGravada).format(),
    descuExenta: CurrencyAdapter.create(resume.descuExenta).format(),
    montoTotalOperacion: CurrencyAdapter.create(
      resume.montoTotalOperacion ?? 0,
      {
        precision: 4,
        symbol: '$ ',
      },
    ).format(),
    porcentajeDescuento: CurrencyAdapter.create(
      resume.porcentajeDescuento ?? 0,
      {
        precision: 4,
        symbol: '$ ',
      },
    ).format(),
  };
};

function makeArr(object: any[], dteType: string): unknown[] {
  const makeFuntion = dteFunctionsDocumentBody[dteType];
  if (makeFuntion) {
    return makeFuntion(object);
  }

  // eslint-disable-next-line no-console
  console.error('No existe la funcion para el tipo de dte');
  return object;
}
function makeObject(object: Resumen, dteType: string): Resumen {
  const makeFunctionResume = dteFunctionsResume[dteType];
  if (makeFunctionResume) {
    return makeFunctionResume(object);
  }

  // eslint-disable-next-line no-console
  console.error('No existe la funcion para el tipo de dte');
  return object;
}

interface ICommonInfo {
  emisor: Emisor;
  recep: SujetoExcluido | Receptor;
  documentoR: string;
  identificacion: Identificacion;
  result: IResultReporte;
  resumen: Resumen;
  extension: Extension;
  infoSeguros: Insurance;
  ivaValue: number;
  fechaNextDay: string;
  cuerpoDocumento: unknown[];
  estado;
}

function buildCommonInfo(commonInfoParams: ICommonInfo): IResultDataforReports {
  const {
    emisor,
    recep,
    documentoR,
    identificacion,
    result,
    resumen,
    extension,
    infoSeguros,
    ivaValue,
    fechaNextDay,
    cuerpoDocumento,
    estado,
  } = commonInfoParams;

  return {
    info: {
      emisor,
      receptor: {
        ...recep,
        numDocumento: recep?.['nit'] ? recep?.['nit'] : recep?.numDocumento,
      },
      documentoR,
      identificacion,
      fecha: identificacion.fecEmi,
      hora: identificacion.horEmi,
      sello: result.sello,
      extension,
      observaciones: {
        coaseguro: CurrencyAdapter.create(
          infoSeguros?.valorCoaseguro ?? 0,
        ).format(),
        porcentajeCoaseguro: CurrencyAdapter.create(
          infoSeguros?.porcentajeCoaseguro ?? 0,
          {
            precision: 2,
            symbol: '',
          },
        ).format(),
        copago: CurrencyAdapter.create(infoSeguros?.copago ?? 0).format(),
        deducible: CurrencyAdapter.create(infoSeguros?.deducible ?? 0).format(),
      },
      estado,
      totalIva: CurrencyAdapter.create(ivaValue ?? 0).format(),
      fechaNextDay,
      medico: infoSeguros?.nombreMedico,
      valueMedico: infoSeguros?.nombreMedico ? true : false,
      aseguradora: infoSeguros?.aseguradora,
      valueAseguradora: infoSeguros?.aseguradora ? true : false,
      atencion: String(infoSeguros?.atencionId),
      valueAtencion: infoSeguros?.atencionId ? true : false,
      paciente: infoSeguros?.nombrePaciente,
      resumen: makeObject(resumen, identificacion.tipoDte),
    },
    data: makeArr(cuerpoDocumento, identificacion.tipoDte),
  };
}

type TDteFunctions = {
  [key: string]: (object: any) => any;
};

const dteFunctionsDocumentBody: TDteFunctions = {
  [DTE_CUSTOM[STR_TIPOS_DTE.sujetoExcluido]]: makeDocumentBodyExcludeSubject,
  [DTE_CUSTOM[STR_TIPOS_DTE.comprobanteRetencion]]:
    makeDocumentBodyWithholdingVoucher,
  [DTE_CUSTOM[STR_TIPOS_DTE.consumidorFinal]]: makeGenericDocumentBody,
  [DTE_CUSTOM[STR_TIPOS_DTE.creditoFiscal]]: makeGenericDocumentBody,
  [DTE_CUSTOM[STR_TIPOS_DTE.notaCredito]]: makeGenericDocumentBody,
};
const dteFunctionsResume: TDteFunctions = {
  [DTE_CUSTOM[STR_TIPOS_DTE.sujetoExcluido]]: makeResumeExcludeSubject,
  [DTE_CUSTOM[STR_TIPOS_DTE.comprobanteRetencion]]:
    makeResumeWithholdingVoucher,
  [DTE_CUSTOM[STR_TIPOS_DTE.consumidorFinal]]: makeGenericResume,
  [DTE_CUSTOM[STR_TIPOS_DTE.creditoFiscal]]: makeGenericResume,
  [DTE_CUSTOM[STR_TIPOS_DTE.notaCredito]]: makeGenericResume,
};

interface IMakeUrlParams {
  url: string;
  ambiente: string;
  codigoGeneracion: string;
  fecEmi: string;
}
const makeUrl = ({
  ambiente,
  codigoGeneracion,
  fecEmi,
  url,
}: IMakeUrlParams) => {
  if (!url) {
    throw new Error('URL_HACIENDA is required');
  }
  const newUrl = new URL(url);
  const params = {
    ambiente,
    codGen: codigoGeneracion,
    fechaEmi: fecEmi,
  };
  newUrl.search = new URLSearchParams(params).toString();

  return newUrl.toString();
};
export { buildCommonInfo, makeUrl };
