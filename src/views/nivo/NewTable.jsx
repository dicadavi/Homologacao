import React from 'react';
import ErroCardif from '../base/Validation/CardifVolksValidation0.json';
import { MDBDataTableV5 } from 'mdbreact';

export default function Pagination() {
  const [datatable, setDatatable] = React.useState({
    columns: [
      {
        label: 'Validação',
        field: 'ValidationQuery',
        width: 150,
        attributes: {
          'aria-controls': 'DataTable',
          'aria-label': 'ValidationQuery',
        },
      },
      {
        label: 'Periodo',
        field: 'PeriodoDeValidação',
        width: 120,
      },
      {
        label: 'SaleId',
        field: 'SaleId',
        width: 100,
      },
      {
        label: 'Status',
        field: 'SaleStatus',
        sort: 'asc',
        width: 50,
      },
      {
        label: 'Status Detail',
        field: 'ValidationStatusDetail',
        sort: 'asc',
        width: 50,
      },
      {
        label: 'Data do Registro',
        field: 'SaleDateRegistro',
        sort: 'disabled',
        width: 80,
      },     
      {
        label: 'InicioDaCampanha',
        field: 'InicioDaCampanha',
        sort: 'disabled',
        width: 80,
      },
      {
        label: 'Lote',
        field: 'validationBatchId',
        sort: 'disabled',
        width: 50,
      },
      {
        label: 'ProdutoCardif',
        field: 'ProdutoCardif',
        sort: 'disabled',
        width: 50,
      },
    ],
    rows: ErroCardif
  });

  return <MDBDataTableV5 hover entriesOptions={[5, 20, 25]} entries={5} pagesAmount={4} data={datatable} fullPagination />
           
}