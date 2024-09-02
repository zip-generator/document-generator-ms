enum CarboneFormat {
  excel = 'xlsx',
  pdf = 'pdf',
}
enum DOCUMENT_TYPES {
  CONSUMIDOR_FINAL = '01',
  CREDITO_FISCAL = '03',
  NOTA_CREDITO = '05',
  COMPROBANTE_RETENCION = '07',
  SUJETO_EXCLUIDO = '14',
  TODOS = '00',
}
enum ZIP_FILE_FORMAT {
  PDF = 'PDF',
  JSON = 'JSON',
}

enum STR_TIPOS_DTE {
  consumidorFinal = '01',
  creditoFiscal = '03',
  sujetoExcluido = '14',
  comprobanteRetencion = '07',
  notaCredito = '05',
  notaDebito = '06',
}
export { CarboneFormat, DOCUMENT_TYPES, ZIP_FILE_FORMAT, STR_TIPOS_DTE };
