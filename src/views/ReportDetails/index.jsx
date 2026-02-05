import { Navbar, Page, Block, Row, Col, Button, BlockTitle } from 'framework7-react';
import { useContext } from 'react';
import { NavbarTitle, BackButton } from '../../components/Buttons';
import NozzlesTable from '../../components/NozzlesTable';
import { SuppliesTable, PrescriptionTable } from '../../components/SuppliesTable';
import { ModelCtx } from '../../context';
import { formatNumber } from '../../utils';
import moment from 'moment';
import { Capacitor } from '@capacitor/core';
import PDFExport from '../../entities/PDF';
import classes from './style.module.css';

const ReportDetails = props => {
    
    const model = useContext(ModelCtx);
    const report = model.getReport(props.id);

    const exportReport = share => {
        PDFExport(report, share);
    };

    return (
        <Page>            
            <Navbar style={{maxHeight:"40px", marginBottom:"0px"}}>
                <NavbarTitle {...props} title={"Reporte de la labor"}/>
            </Navbar>
            
            <div style={{padding:"0px 15px"}}>
                <p style={{margin:0, padding:0}}><b>Nombre: </b>{report.name}</p>
                <p style={{margin:0, padding:0}}><b>Fecha y hora: </b>{moment(report.timestamp).format("DD/MM/YYYY - HH:mm")}</p>
            </div>
            
            {report.completed.params &&
                <Block className={classes.SectionBlock}>
                    <h3 style={{marginBottom:"5px"}}>Parámetros de aplicación</h3>
                    {report.params.productType && 
                        <table>
                            <tbody>
                                <tr>
                                    <td><b>Producto a aplicar:</b></td>
                                    <td>{report.params.productType}</td>
                                </tr>
                            </tbody>
                        </table>
                    }

                    <p style={{marginTop: "5px",marginBottom:0, padding:0}}>Pico</p>
                    <table className={classes.Table}>
                        <tbody>
                            <tr>
                                <td><b>Pico seleccionado:</b></td>
                                <td className={classes.DataCell}>{report.params.nozzleName ? report.params.nozzleName : <i>Otro pico</i>}</td>
                            </tr>                     
                            <tr>
                                <td><b>Caudal nominal:</b></td>
                                <td className={classes.DataCell}>{formatNumber(report.params.nominalFlow)} l/min</td>
                            </tr>
                            <tr>
                                <td><b>Presión nominal:</b></td>
                                <td className={classes.DataCell}>{formatNumber(report.params.nominalPressure)} bar</td>
                            </tr>
                            <tr></tr>
                        </tbody>
                    </table>    
                    <p style={{marginTop:"5px", marginBottom:0, padding:0}}>Parámetros de pulverización</p>
                    <table className={classes.Table}>
                        <tbody>
                            <tr>
                                <td><b>Distancia entre picos:</b></td>
                                <td className={classes.DataCell}>{formatNumber(report.params.nozzleSeparation)} m</td>
                            </tr>
                            <tr>
                                <td><b>Velocidad de trabajo:</b></td>
                                <td className={classes.DataCell}>{formatNumber(report.params.workVelocity)} m/s</td>
                            </tr>
                            <tr>
                                <td><b>Presión de trabajo:</b></td>
                                <td className={classes.DataCell}>{formatNumber(report.params.workPressure)} bar</td>
                            </tr>
                            <tr>
                                <td><b>Volumen de aplicación:</b></td>
                                <td className={classes.DataCell}>{formatNumber(report.params.workVolume)} l/ha</td>
                            </tr>
                            {report.params.waterEqSprayFlow && report.params.productType === "fertilizante" &&
                                <tr>
                                    <td><b>Caudal equivalente en agua:</b></td>
                                    <td className={classes.DataCell}>{formatNumber(report.params.waterEqSprayFlow)} l/ha</td>
                                </tr>
                            }
                            {report.params.dropletSizeLabel && 
                                <tr>
                                    <td><b>Tamaño de gota:</b></td>
                                    <td className={classes.DataCell}>{report.params.dropletSizeLabel}</td>
                                </tr>
                            }
                            {report.params.productDensity && 
                                <tr>
                                    <td><b>Densidad del producto:</b></td>
                                    <td className={classes.DataCell}>{formatNumber(report.params.productDensity)} kg/l</td>
                                </tr>
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
                            <tr>
                                <td><b>Volumen previsto:</b></td>
                                <td className={classes.DataCell}>{formatNumber(report.control.expectedSprayVolume)} l/ha</td>
                            </tr>
                            <tr>
                                <td><b>Diferencia:</b></td>
                                <td className={classes.DataCell}>{formatNumber(report.control.diff)} l/ha <br/>({formatNumber(report.control.diffp)} %)</td>
                            </tr>
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
                                <td><b>Volumen pulverizado:</b></td>
                                <td className={classes.DataCell}>{formatNumber(report.supplies.workVolume)} l/ha</td>
                            </tr>
                            <tr>
                                <td><b>Capacidad del tanque:</b></td>
                                <td className={classes.DataCell}>{formatNumber(report.supplies.capacity, 0)} litros</td>
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