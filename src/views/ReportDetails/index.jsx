import { Navbar, Page, Block, Row, Col, Button, BlockTitle } from 'framework7-react';
import { useContext } from 'react';
import { NavbarTitle, BackButton, NAVBAR_STYLE } from '../../components/Buttons';
import NozzlesTable from '../../components/NozzlesTable';
import { SuppliesTable, PrescriptionTable } from '../../components/SuppliesTable';
import { ModelCtx } from '../../context';
import { formatNumber, sanitizeTypedValue } from '../../utils';
import moment from 'moment';
import { Capacitor } from '@capacitor/core';
import PDFExport from '../../entities/PDF';
import classes from './style.module.css';
import { PRODUCT_TYPES } from '../../entities/Model';

const ReportDetails = props => {
    
    const model = useContext(ModelCtx);
    const report = model.getReport(props.id);

    const exportReport = share => {
        PDFExport(report, share);
    };

    return (
        <Page>            
            <Navbar style={NAVBAR_STYLE}>
                <NavbarTitle {...props} title={"Reporte de la labor"}/>
            </Navbar>
            
            <div style={{padding:"0px 15px"}}>
                <p style={{margin:0, padding:0}}><b>Nombre: </b>{report.name}</p>
                <p style={{margin:0, padding:0}}><b>Fecha y hora: </b>{moment(report.timestamp).format("DD/MM/YYYY - HH:mm")}</p>
            </div>

            {report.completed.params &&
                <Block className={classes.SectionBlock}>
                    <h3 style={{marginBottom:"5px"}}>Parámetros de aplicación</h3>
                    <table className={classes.Table}>
                        <tbody>
                            {report.params.productType && 
                                <tr>
                                    <td><b>Producto a aplicar:</b></td>
                                    <td className={classes.DataCell}>{report.params.productType === PRODUCT_TYPES.LIQUID ? "Líquidos" : "Sólidos"}</td>
                                </tr>
                            }
                            <tr>
                                <td><b>Velocidad de trabajo:</b></td>
                                <td className={classes.DataCell}>{formatNumber(report.params.workVelocity)} km/h</td>
                            </tr>
                            {
                                report.params.seedMode && 
                                <>
                                    {report.params.seedVariety &&
                                        <tr>
                                            <td><b>Híbrido o variedad:</b></td>
                                            <td className={classes.DataCell}>{report.params.seedVariety}</td>
                                        </tr>
                                    }
                                    {report.params.seedName &&
                                        <tr>
                                            <td><b>Semilla:</b></td>
                                            <td className={classes.DataCell}>{report.params.seedName}</td>
                                        </tr>
                                    }
                                    {report.params.seedP1000 &&
                                        <tr>
                                            <td><b>Peso de 1000 semillas:</b></td>
                                            <td className={classes.DataCell}>{report.params.seedP1000}</td>
                                        </tr>
                                    }
                                    {report.params.seedPurity &&
                                        <tr>
                                            <td><b>Pureza:</b></td>
                                            <td className={classes.DataCell}>{report.params.seedPurity} %</td>
                                        </tr>
                                    }
                                    {report.params.seedPG &&
                                        <tr>
                                            <td><b>Poder germinativo:</b></td>
                                            <td className={classes.DataCell}>{report.params.seedPG} gr</td>
                                        </tr>
                                    }
                                    {report.params.seedEfficiency &&
                                        <tr>
                                            <td><b>Eficiencia de implantación:</b></td>
                                            <td className={classes.DataCell}>{report.params.seedEfficiency} %</td>
                                        </tr>
                                    }
                                    {report.params.seedDensity && report.params.seedDensityUnit !== "Kg/ha" &&
                                        <tr>
                                            <td><b>Densidad de siembra:</b></td>
                                            <td className={classes.DataCell}>{`${sanitizeTypedValue(report.params.seedDensity.toString())} ${report.params.seedDensityUnit}`}</td>
                                        </tr>
                                    }
                                </>
                            }
                        </tbody>
                    </table>
                </Block>
            }
            {report.completed.control &&
                <Block className={classes.SectionBlock}>
                    <h3>Verificación de picos</h3>
                    <table className={classes.Table}>
                        <tbody>
                            {/*<tr>
                                <td><b>Caudal efectivo promedio:</b></td>
                                <td className={classes.DataCell}>{formatNumber(report.control.efAvg)} l/min</td>
                            </tr>*/}
                            {report.control.totalEffectiveFlow && <tr>
                                <td><b>Caudal pulverizado efectivo:</b></td>
                                <td className={classes.DataCell}>{formatNumber(report.control.totalEffectiveFlow)} l/min</td>
                            </tr>}
                            <tr>
                                <td><b>Volumen pulverizado efectivo:</b></td>
                                <td className={classes.DataCell}>{formatNumber(report.control.effectiveSprayVolume)} l/ha</td>
                            </tr>
                            {report.control.expectedSprayVolume && 
                                <>
                                    <tr>
                                        <td><b>Volumen previsto:</b></td>
                                        <td className={classes.DataCell}>{formatNumber(report.control.expectedSprayVolume)} l/ha</td>
                                    </tr>
                                    <tr>
                                        <td><b>Diferencia:</b></td>
                                        <td className={classes.DataCell}>{formatNumber(report.control.diff)} l/ha <br/>({formatNumber(report.control.diffp)} %)</td>
                                    </tr>
                                </>
                            }
                            
                            { report.control.comments && 
                                <tr>
                                    <td><b>Comentarios:</b></td>
                                    <td className={classes.DataCell}>{report.control.comments}</td>
                                </tr>
                            }
                        </tbody>
                    </table>
                    <NozzlesTable 
                        data={report.control.data} 
                        onDataChange={()=>{}} 
                        rowSelectDisabled={true}
                        evalCollected={()=>{}}/>
                </Block>
            }  
            {report.completed.supplies &&
                <Block className={classes.SectionBlock}>
                    <h3>Cálculo de mezcla</h3>
                    <BlockTitle className={classes.SectionTitle}>Parámetros de mezcla</BlockTitle>
                    <table className={classes.Table}>
                        <tbody>
                            <tr>
                                <td><b>Lote:</b></td>
                                <td className={classes.DataCell}>{report.supplies.lotName}</td>
                            </tr>
                            {
                                report.supplies.lotCoordinates &&
                                <tr>
                                    <td><b>Ubicación:</b></td>
                                    <td className={classes.DataCell}>{report.supplies.lotCoordinates.length > 0 ? "lat: "+report.supplies.lotCoordinates.join(', long:') : " - "}</td>
                                </tr>
                            }
                            <tr>
                                <td><b>Superficie:</b></td>
                                <td className={classes.DataCell}>{formatNumber(report.supplies.workArea)} ha</td>
                            </tr>
                            <tr>
                                <td><b>Capacidad de carga:</b></td>
                                <td className={classes.DataCell}>{formatNumber(report.supplies.capacity, 0)} {report.supplies.productType === PRODUCT_TYPES.LIQUID ? "litros" : "kilos"}</td>
                            </tr>
                            <tr>
                                <td><b>Cantidad de cargas:</b></td>
                                <td className={classes.DataCell}>{report.supplies.loadsText}</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <BlockTitle className={classes.SectionTitle}>Prescripción</BlockTitle>
                    <PrescriptionTable supplies={report.supplies}/>

                    <BlockTitle className={classes.SectionTitle}>Insumos</BlockTitle>
                    <SuppliesTable supplies={report.supplies} loadBalancing={report.supplies.loadBalancingEnabled}/>
                    
                    {report.supplies.comments && 
                    <div>
                        <BlockTitle className={classes.SectionTitle}>Observaciones</BlockTitle> 
                        <p className={classes.CommentsBlock}>{report.supplies.comments.length > 0 ? report.supplies.comments : " - "}</p>
                    </div>
                    }
                </Block>
            }
            <Row style={{marginTop:10, marginBottom: 10}}>
                <Col width={20}></Col>
                <Col width={60}>
                    <Button fill onClick={()=>exportReport(false)} style={{textTransform:"none"}}>Guardar como  PDF</Button>
                </Col>
                <Col width={20}></Col>
            </Row>

            {Capacitor.isNativePlatform() &&
                <Row>
                    <Col width={20}></Col>
                    <Col width={60}>
                        <Button fill color="teal" onClick={()=>exportReport(true)} style={{textTransform:"none"}}>Compartir</Button>
                    </Col>
                    <Col width={20}></Col>
                </Row>
            }
            <BackButton {...props}/>
        </Page>
    );
};

export default ReportDetails;