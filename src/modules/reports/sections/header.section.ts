import { Content } from 'pdfmake/interfaces';

interface HeaderSectionOptions {
  generationCode: string;
  receptionStamp: string;
  controlNumber: string;
  emitionDate: string;
  emitionTime: string;
}
const headerSection = (options: HeaderSectionOptions) => {
  const {
    controlNumber,
    emitionDate,
    emitionTime,
    generationCode,
    receptionStamp,
  } = options;
  const headerContent: Content = {
    columns: [
      {
        text: [
          {
            text: 'INVERSIONES MEDICAS DE ORIENTE SA DE CV \n',
            style: 'header',
          },
          {
            text: '86100-Servicios Medicos Hospitalarios  \n',
            style: 'small',
          },
          {
            text: 'Final 9a Avenida Sur y Calle La Paz, Ba. La Merced Atras de Hotel Tropico Inn, San Miguel.  \n',
            style: 'small',
          },
          {
            text: [
              { text: 'Telefono: ', style: 'smallBold' },
              { text: '26610001 \n', style: 'small' },
            ],
          },
          {
            text: [
              { text: 'Email: ', style: 'smallBold' },
              {
                text: 'no-reply@hospitaldeespecialidades.com.sv \n',
                style: 'small',
              },
            ],
          },
          {
            text: [
              { text: 'Categoria: ', style: 'smallBold' },
              { text: 'Gran contribuyente \n', style: 'small' },
            ],
          },
          {
            text: [
              { text: 'Tipo Establecimiento: ', style: 'smallBold' },
              { text: 'Casa Matriz \n', style: 'small' },
            ],
          },
          {
            text: [
              { text: 'Nit: ', style: 'smallBold' },
              { text: '06141505911029 ', style: 'small' },
              { text: 'NRC: ', style: 'smallBold' },
              { text: ' 504700\n', style: 'small' },
            ],
          },
        ],
        width: '50%',
      },
      {
        width: '50%',
        table: {
          headerRows: 1,
          widths: ['*'],
          body: [
            [
              {
                text: [
                  {
                    text: 'DOCUMENTO TRIBUTARIO ELECTRÓNICO\n',
                    style: 'subHeader',
                    alignment: 'center',
                  },
                  {
                    text: 'COMPROBANTE DE FACTURA CONSUMIDOR FINAL',
                    alignment: 'center',
                    style: 'header',
                  },
                ],
              },
            ],
            [
              {
                text: [
                  {
                    text: [
                      { text: 'Codigo Generación: ', style: 'smallBold' },
                      {
                        text: `${generationCode} \n\n`,
                        style: 'small',
                      },
                    ],
                  },
                  {
                    text: [
                      { text: 'Sello Recepción: ', style: 'smallBold' },
                      {
                        text: `${receptionStamp} \n\n`,
                        style: 'small',
                      },
                    ],
                  },
                  {
                    text: [
                      { text: 'Número de control: ', style: 'smallBold' },
                      {
                        text: `${controlNumber}`,
                        style: 'small',
                      },
                    ],
                  },
                ],
              },
            ],
            [
              {
                columns: [
                  {
                    text: [
                      {
                        text: [
                          {
                            text: 'Modélo facturación: ',
                            style: 'smallBold',
                            width: 'auto',
                          },
                          {
                            width: '*',
                            text: 'Previo',
                            style: 'small',
                          },
                        ],
                      },
                    ],
                  },
                  {
                    text: [
                      {
                        text: [
                          {
                            text: 'Versión del Json: ',
                            style: 'smallBold',
                            width: 'auto',
                          },
                          {
                            width: '*',
                            text: '1',
                            style: 'small',
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
            [
              {
                columns: [
                  {
                    text: [
                      {
                        text: [
                          {
                            text: 'Tipo de transmisión: ',
                            style: 'smallBold',
                            width: 'auto',
                          },
                          {
                            width: '*',
                            text: 'Normal',
                            style: 'small',
                          },
                        ],
                      },
                    ],
                  },
                  {
                    text: [
                      {
                        text: [
                          {
                            text: 'Fecha emisión: ',
                            style: 'smallBold',
                            width: 'auto',
                          },
                          {
                            width: '*',
                            text: `${emitionDate}`,
                            style: 'small',
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
            [
              {
                columns: [
                  {
                    text: [
                      {
                        text: [
                          {
                            text: 'Hora de emisión: ',
                            style: 'smallBold',
                            width: 'auto',
                          },
                          {
                            width: '*',
                            text: `${emitionTime}`,
                            style: 'small',
                          },
                        ],
                      },
                    ],
                  },
                  {
                    text: [
                      {
                        text: [
                          {
                            text: 'Transacción contable: ',
                            style: 'smallBold',
                            width: 'auto',
                          },
                          {
                            width: '*',
                            text: '89859',
                            style: 'small',
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          ],
        },
      },
    ],
  };
  return headerContent;
};

export { headerSection };
