import React from 'react'
import { MDBBadge, MDBBtn, MDBTable, MDBTableHead, MDBTableBody } from 'mdb-react-ui-kit';

export default function App({ dados }) {

    return (
        <MDBTable align='middle'>
            <MDBTableHead dark>
                <tr>
                    <th scope='col'>Lote ID</th>
                    <th scope='col'>Total a pagar</th>
                    <th scope='col'>Orçamento está disponível?</th>
                    <th scope='col'>Saldo Disponível para esse lote?</th>
                    <th scope='col'>Ação</th>
                </tr>
            </MDBTableHead>
            <MDBTableBody>
                {dados.map(Batch => {
                   var Orçamento = ""
                   var Saldo = ""
                    {if (Batch.OrçamentoDisponivel === "Disponível") {
                        Orçamento = 'success'
                    } else{
                        Orçamento = 'danger'
                    }}
                    {if (Batch.SaldoDisponivel === "Disponível") {
                        Saldo = 'success'
                    } else{
                        Saldo = 'danger'
                    }}
                    return <tr key={Batch.id}>
                        <th scope="row">{Batch.id}</th>
                        <td>{Batch.SomaValorPorLote}</td>                      
                        <td> <MDBBadge color= {Orçamento} pill>{Batch.OrçamentoDisponivel}</MDBBadge></td>
                        <td> <MDBBadge color= {Saldo} pill>{Batch.SaldoDisponivel}</MDBBadge></td>
                        <td> <MDBBtn color='link' rounded size='sm'> Processar Lote </MDBBtn></td>
                    </tr>
                })}
            </MDBTableBody>
        </MDBTable>
    );
}