import React, {useState} from 'react'
import PropTypes from 'prop-types'
import { ResponsivePie } from '@nivo/pie'
import { CButton, CButtonGroup, CCard, CCardBody, CCardHeader, CCol, CHeader, CRow, CAlert, CTable } from '@coreui/react'
import DataTableView from './DataTable';
import NewDataBla from './NewTable';
import ErrosCardif from '../base/Validation/CardifVolksValidation0.json';

const CardifValidation = () => {
    const [viewType, setViewType] = useState('Gráfico')
    const [pieOrDonut, setPieOrDonut] = useState('Pizza')
    const tableData = ErrosCardif
    const pieData = []

    let total = 1// Total de Conteudo
    let couunt = 1 // Quantidade em Ordem 
        for (let i = 0; i < tableData.length; i++) {
        if (pieData.length > 0 && pieData.find(pieData => pieData.label === tableData[i].ValidationQuery) != null ) {
       console.log("Ja criado");
    } else {
        let buscado = tableData[i].ValidationQuery
        total = tableData.filter(tableData => tableData.ValidationQuery === buscado).length;
        pieData.push({ id: couunt,label: tableData[i].ValidationQuery, value: total });
        couunt++
       // console.log(pieData.find(pieData => pieData.ERRO === tableData[i].ValidationQuery) != null);
    
   
    } 
}    
           
    


    const MyResponsivePie = ({ data, pieType}) => (
        <ResponsivePie
            data={data}
            margin={{ top: 80, right: 80, bottom: 80, left: -250}}            
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
            arcLinkLabel={function(e){return e.id+" ("+e.label+")"}}
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

    return(
        <>
        <CCard>
            <CCardHeader>
                <CRow>
                    <CCol sm={6}>
                    <h4>Cardif Volks</h4>
                    </CCol>
                    <CCol sm={3}>
                        <CButtonGroup>
                            {['Gráfico', 'Tabela', 'Dados Detalhado'].map( (value) => (
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
                    <CCol sm={3}>
                        <CButtonGroup>
                            {['Pizza', 'Rosca'].map( (value) => (
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
                    <CCol sm={3}>
                        {/* <CButtonGroup>
                            {['horizontal', 'vertical'].map( (value) => (
                                <CButton 
                                color='outline-secondary'
                                active={value === vertOrHor}
                                onClick={() => setVertOrHor(value.toLowerCase())}
                                key={value}>
                                    {value}
                                </CButton>
                            ))}
                        </CButtonGroup> */}
                    </CCol>
                    <CCol sm={3}>
                        {/* <CButtonGroup>
                            {['horizontal', 'vertical'].map( (value) => (
                                <CButton 
                                color='outline-secondary'
                                active={value === vertOrHor}
                                onClick={() => setVertOrHor(value.toLowerCase())}
                                key={value}>
                                    {value}
                                </CButton>
                            ))}
                        </CButtonGroup> */}
                    </CCol>
                </CRow>                
            </CCardHeader>           
                    {viewType === 'Gráfico' ? <CCardBody style={{height:'600px'}}><MyResponsivePie data={pieData} pieType={pieOrDonut.toLowerCase()} /></CCardBody> : "" }
                    {viewType === 'Tabela' ?<CCardBody><DataTableView tableData={pieData} /></CCardBody>:""} 
                    {viewType === 'Dados Detalhado' ? <CCardBody style={{marginLeft:'0px'}}> <NewDataBla/></CCardBody>:"" }    
        </CCard>
        </>
    )
}
export default CardifValidation
