import React from 'react';
import { MDBDataTableV5 } from 'mdbreact';



export default function Pagination( {dados, coluna} ) {
  const [datatable, setDatatable] = React.useState({
    columns: coluna,
    rows: dados
  });

  return <MDBDataTableV5 hover entriesOptions={[5, 20, 25]} entries={5} pagesAmount={4} data={datatable} fullPagination />
           
}