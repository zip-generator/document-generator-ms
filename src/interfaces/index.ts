type TipoDte = {
  id: number;
  codigoDte: string;
};
interface IFaturaElectronicaTransaccionalExtendedPdf {
  estadoDte: string;
  payload: unknown;
  selloRegistro: string;
  responseMh: unknown;
  observaciones: string;
  dte: string;
  fechaHoraProcesamiento: Date;
  tiposDte: TipoDte;
  id: number;
  uuid: string;
}

interface IResultReporte {
  payload: unknown;
  sello: string | null;
  responseMH: unknown;
  observaciones: string | null;
  estado: string;
  dte: unknown;
  fechaProcesamiento: Date;
}

type ResultExtend = IResultReporte & {
  tiposDte: TipoDte;
  id: number;
  uuid: string;
};
interface ItemsGroupped {
  fechaEmision: string;
  hacienda: unknown;
  id: number;
  tiposDte: TipoDte;
  dte: unknown;
  uuid: string;
  fechaProcesamiento?: Date;
  sello?: string;
}
interface IGroup<TValue> {
  [key: string]: TValue[];
}
interface Direccion {
  municipio: string;

  complemento: string;

  departamento: string;
}
interface Emisor {
  nit: string;
  nrc: string;
  correo: string;
  nombre: string;
  telefono: string;
  direccion: Direccion;
  codEstable?: number | null;
  codActividad: string;
  codEstableMH?: string;
  codPuntoVenta?: number | null;
  descActividad?: string;
  codPuntoVentaMH?: string;
  nombreComercial?: string;
  tipoEstablecimiento?: string;
  codigoMH?: string | null;
  codigo?: string | null;
  puntoVentaMH?: string | null;
  puntoVenta?: string | null;
  nomEstablecimiento?: string | null;
}
interface SujetoExcluido {
  numDocumento?: string | null;

  tipoDocumento?: string | null;

  nombre: string;

  codActividad?: string | null;

  descActividad?: string | null;

  direccion: Direccion;

  telefono: string;

  correo: string;
}

interface Receptor {
  nrc: string | null;
  nit: string | null;
  correo: string;
  nombre: string;
  telefono: string;
  direccion: Direccion;
  codActividad: string | null;
  numDocumento: string | null;
  tipoDocumento: string | null;
  descActividad?: string | null;
  nombreComercial: string | null;
}
interface Pago {
  codigo: string;

  montoPago: number;

  referencia: string | null;

  plazo: string | null;

  periodo: string | null;

  numPagoElectronico?: string;
}

interface Tributos {
  codigo: string;
  descripcion: string;
  valor: number;
}
interface Resumen {
  pagos: Pago[] | null;

  ivaPerci1: number;

  tributos: Tributos[] | Tributos | null;

  ivaRete1: number;

  subTotal: number;

  reteRenta: number;

  descuNoSuj: number;

  saldoFavor: number;

  totalDescu: number;

  totalNoSuj: number;

  totalPagar: number;

  descuExenta: number;

  totalExenta: number;

  totalLetras: string;

  descuGravada: number;

  subTotalVentas: number;

  totalNoGravado: number;

  totalIva: number | null;

  totalGravada: number;

  condicionOperacion: number;

  numPagoElectronico?: string | null;

  montoTotalOperacion: number;

  porcentajeDescuento: number;

  descu: number | null;

  totalCompra: number | null;

  observaciones: string | null;

  totalSujetoRetencion?: number | null;

  totalIVAretenido?: number | null;

  totalIVAretenidoLetras?: string | null;
}

interface Identificacion {
  fecEmi: string;

  horEmi: string;

  tipoDte: string;

  version: number;

  ambiente: string;

  tipoModelo: number;

  tipoMoneda: string;

  motivoContin: string | null;

  numeroControl: string;

  tipoOperacion: number;

  codigoGeneracion: string;

  tipoContingencia: string | null;
}
interface CuerpoDocumento {
  psv: number;

  codigo?: string | null;

  ivaItem: number | null;

  numItem: number;

  cantidad: number;

  tipoItem: number;

  tributos: any[];

  noGravado: number;

  precioUni: number;

  codTributo: string | null;

  uniMedida: number;

  montoDescu: number;

  ventaNoSuj: number;

  descripcion: string;

  ventaExenta: number;

  ventaGravada: number;

  numeroDocumento: string | null;

  compra: number;

  tipoDte?: string | null;

  tipoDoc?: number | null;

  numDocumento?: string | null;

  fechaEmision?: string | null;

  montoSujetoGrav?: number | null;

  codigoRetencionMH?: string | null;

  ivaRetenido?: number | null;
}

interface Extension {
  docuRecibe: string | null;

  nombRecibe: string | null;

  docuEntrega: string | null;

  nombEntrega: string | null;

  observaciones: string | null;

  placaVehiculo: string | null;
}
interface Insurance {
  deducible: number;

  copago: number;

  porcentajeCoaseguro: number;

  valorCoaseguro: number;

  actividadEconomica: string;

  atencionId: number;

  nombrePaciente: string;

  nombreMedico: string;

  aseguradora: string;
}

interface ITemplateInfo {
  nombreCliente: string;
  empresaEmisor: string;
  codigoGeneracion: string;
  fecha: string;
  monto: string;
  nameFactura: string;
}
interface IResultDataforReports {
  info: unknown;
  data: any[];
  resumen?: unknown;
}

interface IJSonFile extends IResultReporte {
  selloRecibido: string;
  firmaElectronica: string;
}

// Define el tipo de los datos individuales
interface ProcessedData {
  buffer: Buffer;
  identificacion: object;
}

// Define el tipo del grupo por fecha y tipo
interface DataGroupedByDate {
  [fecha: string]: {
    [tipoDte: string]: ProcessedData[];
  };
}

export {
  IFaturaElectronicaTransaccionalExtendedPdf,
  IResultReporte,
  ResultExtend,
  ItemsGroupped,
  IGroup,
  Emisor,
  SujetoExcluido,
  Receptor,
  Resumen,
  Identificacion,
  CuerpoDocumento,
  Extension,
  Insurance,
  ITemplateInfo,
  IResultDataforReports,
  IJSonFile,
  DataGroupedByDate,
};
