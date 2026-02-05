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
import { PRODUCT_TYPES } from '../../entities/Model';

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
                                    <td>{report.params.productType === PRODUCT_TYPES.LIQUID ? "Líquidos" : "Sólidos"}</td>
                                </tr>
                            </tbody>
                        </table>
                    }

                    <p style={{marginTop: "5px",marginBottom:0, padding:0}}>Título</p>
                    <table className={classes.Table}>
                        <tbody>
                            <tr>
                                <td><b>Parámetro ejemplo:</b></td>
                                <td className={classes.DataCell}>{formatNumber(1.23)} l/min</td>
                            </tr>
                            <tr></tr>
                        </tbody>
                    </table>    
                    <p style={{marginTop:"5px", marginBottom:0, padding:0}}>Parámetros de pulverización</p>
                    <table className={classes.Table}>
                        <tbody>
                            <tr>
                                <td><b>Velocidad de trabajo:</b></td>
                                <td className={classes.DataCell}>{formatNumber(report.params.workVelocity)} m/s</td>
                            </tr>
                        </tbody>
                    </table>
                </Block>
            }
            {report.completed.control &&
                <Block className={classes.SectionBlock}>
                    <h3>Verificación de prestación</h3>
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