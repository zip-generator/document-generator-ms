import { STR_TIPOS_DTE } from '@app/enums';

const DTE_CUSTOM: Record<string, string> = {
  [STR_TIPOS_DTE.consumidorFinal]: '01',
  [STR_TIPOS_DTE.creditoFiscal]: '03',
  [STR_TIPOS_DTE.sujetoExcluido]: '14',
  [STR_TIPOS_DTE.comprobanteRetencion]: '07',
  [STR_TIPOS_DTE.notaCredito]: '05',
  [STR_TIPOS_DTE.notaDebito]: '06',
};

const TIPO_IDENTIFICACION = {
  '01': 'Reporte consumidor final',
  '03': 'Reporte credito fiscal',
  '07': 'Comprobante de Retencion',
  '14': 'Comprobante de Sujeto Excluido',
  '05': 'Nota de Credito',
};
const LIMITE_PAGINAS_REPORTES = 10;
export { DTE_CUSTOM, TIPO_IDENTIFICACION, LIMITE_PAGINAS_REPORTES };
