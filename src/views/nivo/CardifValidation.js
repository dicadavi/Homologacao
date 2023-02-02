import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { ResponsivePie } from '@nivo/pie'
import CIcon from '@coreui/icons-react';
import * as icon from '@coreui/icons';
import { CButton, CButtonGroup, CCard, CCardBody, CCardHeader, CCol, CHeader, CRow, CAlert, CTable, CSpinner } from '@coreui/react'
import DataTableView from './DataTable';
import NewDataBla from './NewTable';
import { useQuery, useQueryClient } from 'react-query';
import axios from 'axios';



const CardifValidation = () => {
    const [viewType, setViewType] = useState('Gráfico')
    const [pieOrDonut, setPieOrDonut] = useState('Pizza')
    const pieData = []
    var Refresh = "Atualizar"
    const { data: salesVolks, isFetching } = useQuery('Volks', async () => {
        const response = await axios.get('http://localhost:8800/cardifVolks')
        return response.data
    }, {
        refetchOnWindowFocus: false, //Evita que a recarregue sempre que volta na tela
        staleTime: 50000,
        cacheTime: 50000

    })

    const queryClient = useQueryClient()
async function RefreshDB(){
    
    Refresh="Loading..."
    console.log(Refresh)
    await queryClient.invalidateQueries('Volks')
    Refresh="Atualizar"
    console.log(Refresh)
}

    function UpdatePie(params) {
        let total = 1// Total de Conteudo
        let couunt = 1 // Quantidade em Ordem 
        for (let i = 0; i < salesVolks.length; i++) {
            if (pieData.length > 0 && pieData.find(pieData => pieData.label === salesVolks[i].ValidationQuery) != null) {

            } else {
                let buscado = salesVolks[i].ValidationQuery
                total = salesVolks.filter(salesVolks => salesVolks.ValidationQuery === buscado).length;
                pieData.push({ id: couunt, label: salesVolks[i].ValidationQuery, value: total });
                couunt++
                // console.log(pieData.find(pieData => pieData.ERRO === salesVolks[i].ValidationQuery) != null); 
            }
        }

    }
    const MyResponsivePie = ({ data, pieType }) => (
        <ResponsivePie
            data={data}
            margin={{ top: 80, right: 80, bottom: 80, left: -250 }}
            innerRadius={pieType === 'pizza' ? 0 : 0.5}
            padAngle={0.7}
            cornerRadius={3}
            activeOuterRadiusOffset={8}
            colors={{ scheme: 'nivo' }}
            borderWidth={1}
            borderColor={{
                from: 'color',
                modifiers: [
                    [
                        'darker',
                        0.2
                    ]
                ]
            }}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor="#333333"
            arcLinkLabelsThickness={5}
            arcLinkLabelsColor={{ from: 'color' }}
            arcLabelsSkipAngle={10}
            arcLinkLabel={function (e) { return e.id + " (" + e.label + ")" }}
            arcLabelsTextColor={{
                from: 'color',
                modifiers: [
                    [
                        'darker',
                        2
                    ]
                ]
            }}
            //tooltip={function(e){var t=e.datum;return(0,a.jsxs)(s,{style:{color:t.color},children:[(0,a.jsx)(d,{children:"id"}),(0,a.jsx)(c,{children:t.id}),(0,a.jsx)(d,{children:"value"}),(0,a.jsx)(c,{children:t.value}),(0,a.jsx)(d,{children:"formattedValue"}),(0,a.jsx)(c,{children:t.formattedValue}),(0,a.jsx)(d,{children:"color"}),(0,a.jsx)(c,{children:t.color})]})}}
            defs={[
                {
                    id: 'dots',
                    type: 'patternDots',
                    background: 'inherit',
                    color: 'rgba(255, 255, 255, 0.3)',
                    size: 4,
                    padding: 1,
                    stagger: true
                },
                {
                    id: 'lines',
                    type: 'patternLines',
                    background: 'inherit',
                    color: 'rgba(255, 255, 255, 0.3)',
                    rotation: -45,
                    lineWidth: 6,
                    spacing: 10
                }
            ]}
            fill={[
                {
                    match: {
                        id: 'ruby'
                    },
                    id: 'dots'
                },
                {
                    match: {
                        id: 'c'
                    },
                    id: 'dots'
                },
                {
                    match: {
                        id: 'go'
                    },
                    id: 'dots'
                },
                {
                    match: {
                        id: 'python'
                    },
                    id: 'dots'
                },
                {
                    match: {
                        id: 'scala'
                    },
                    id: 'lines'
                },
                {
                    match: {
                        id: 'lisp'
                    },
                    id: 'lines'
                },
                {
                    match: {
                        id: 'elixir'
                    },
                    id: 'lines'
                },
                {
                    match: {
                        id: 'javascript'
                    },
                    id: 'lines'
                }
            ]}
            legends={[
                {
                    anchor: 'right',
                    direction: 'column',
                    justify: false,
                    translateX: -250,
                    translateY: 150, //56
                    itemsSpacing: 0,
                    itemWidth: 100,
                    itemHeight: 26,
                    itemTextColor: '#999',
                    itemDirection: 'left-to-right',
                    itemOpacity: 1,
                    symbolSize: 18,
                    // symbolShape: 'circle',
                    effects: [
                        {
                            on: 'hover',
                            style: {
                                itemTextColor: '#000'
                            }
                        }
                    ]
                }
            ]}
        />
    )

    MyResponsivePie.propTypes = {
        data: PropTypes.object.isRequired,
        pieType: PropTypes.bool.isRequired
    }
    return (
        <>
            <CCard>
                <CCardHeader>
                    <CRow>
                        <CCol sm={5}>
                            <h4>Cardif Validation</h4>
                        </CCol>
                        <CCol sm={3}>
                            <CButtonGroup>
                                {['Gráfico', 'Tabela', 'Dados Detalhado'].map((value) => (
                                    <CButton
                                        color='outline-secondary'
                                        active={value === viewType}
                                        onClick={() => setViewType(value)}
                                        key={value}>
                                        {value}
                                    </CButton>
                                ))}
                            </CButtonGroup>
                        </CCol>
                        <CCol sm={2}>
                            <CButtonGroup>
                                {['Pizza', 'Rosca'].map((value) => (
                                    <CButton
                                        color='outline-secondary'
                                        active={value === pieOrDonut}
                                        onClick={() => setPieOrDonut(value)}
                                        key={value}>
                                        {value}
                                    </CButton>
                                ))}
                            </CButtonGroup>
                        </CCol>
                        <CCol sm={1}>
                            <CButton color="secondary" size="sm"  variant="outline" onClick={() => RefreshDB()}>
                                {Refresh === 'Atualizar' ?  <CIcon icon={icon.cilLoopCircular} size="sm"/> :<CSpinner component="span" size="sm" aria-hidden="true" color='grey' />
                                } {Refresh}
                                
                            </CButton>
                        </CCol>
                    </CRow>
                </CCardHeader>
                {isFetching && <CAlert>Carregando...</CAlert>}
                {viewType === 'Gráfico' ? <CCardBody style={{ height: '600px' }}><MyResponsivePie data={pieData} pieType={pieOrDonut.toLowerCase()} /></CCardBody> : ""}
                {salesVolks && viewType === 'Tabela' ? <CCardBody><DataTableView tableData={pieData} /></CCardBody> : ""}
                {salesVolks && viewType === 'Dados Detalhado' ? <CCardBody style={{ marginLeft: '0px' }}> <NewDataBla dados={salesVolks} /></CCardBody> : ""}
                <CCardBody>                    
                    {salesVolks && UpdatePie()}
                </CCardBody>
            </CCard>
        </>
    )
}
export default CardifValidation
