import { f7, Navbar, Page, Row, Col, Button, BlockTitle, List, Block } from 'framework7-react';
import { useContext, useState } from 'react';
import { NavbarTitle, BackButton, NAVBAR_STYLE } from '../../components/Buttons';
import Input from '../../components/Input';
import { SuppliesTable, PrescriptionTable } from '../../components/SuppliesTable';
import { ModelCtx } from '../../context';
import { PRODUCT_TYPES } from '../../entities/Model';
import { formatNumber } from '../../utils';
import iconReport from '../../assets/icons/reportes.png';
import classes from './style.module.css';

const SuppliesList = props => {

    const model = useContext(ModelCtx);

    const [comments, setComments] = useState('');

    const addSuppliesToReport = () => {
        const {
            loadBalancingEnabled,
            supplies,
            lotName,
            lotCoordinates,
            workArea,
            workVolume,
            capacity
        } = model;
        model.addSuppliesToReport({
            loadsText,
            loadBalancingEnabled,
            productType: supplies.productType,
            pr: supplies.pr,
            lotName,
            lotCoordinates,
            workArea,
            workVolume,
            capacity,
            comments
        });
        f7.panel.open();
    };

    const isSolid = model.supplies?.productType === PRODUCT_TYPES.SOLID;
    const capacityUnit = isSolid ? "kg" : "l";
    const doseUnit = isSolid ? "kg/ha" : "l/ha";
    const tankUnit = isSolid ? "kilos" : "litros";

    const loadsText = model.loadBalancingEnabled ? 
        model.supplies.Ncb+" carga(s) de " +Math.round(model.supplies.Vcb)+ " " + capacityUnit 
        : 
        model.supplies.Ncc+" carga(s) completa(s)"+(model.supplies.Vf > 0 ? " y 1 fracción de carga de " +Math.round(model.supplies.Vf)+ " " + capacityUnit : "");

    return (
        <Page>
            <Navbar style={NAVBAR_STYLE}>
                <NavbarTitle {...props} title={"Lista de insumos"} />
            </Navbar>
            <BlockTitle className={classes.SectionTitle}>Parámetros de Mezcla</BlockTitle>
            <Row>
                <table className={classes.MainTable}>
                    <tbody>
                        <tr>
                            <td><b>Lote:</b></td>
                            <td>{model.lotName}</td>
                        </tr>
                        {
                            model.lotCoordinates && 
                            <tr>
                                <td><b>Ubicación:</b></td>
                                <td>{model.lotCoordinates.length > 0 ? "lat: "+model.lotCoordinates.join(', long:') : " - "}</td>
                            </tr>
                        }
                        <tr>
                            <td><b>Superficie:</b></td>
                            <td>{model.workArea} ha</td>
                        </tr>
                        <tr>
                            <td><b>Dosis:</b></td>
                            <td>{formatNumber(model.workVolume)} {doseUnit}</td>
                        </tr>
                        <tr>
                            <td><b>Capacidad de carga:</b></td>
                            <td>{model.capacity} {tankUnit}</td>
                        </tr>
                        <tr>
                            <td><b>Cantidad de cargas:</b></td>
                            <td data-testid="supplies-loads-text">{loadsText}</td>
                        </tr>
                        {
                            PRODUCT_TYPES.SEED && model.seedMode && 
                            <>
                                {model.seedVariety &&
                                    <tr>
                                        <td><b>Híbrido o variedad:</b></td>
                                        <td>{model.seedVariety}</td>
                                    </tr>
                                }
                                {model.seedName &&
                                    <tr>
                                        <td><b>Semilla:</b></td>
                                        <td>{model.seedName}</td>
                                    </tr>
                                }
                                {model.seedP1000 &&
                                    <tr>
                                        <td><b>Peso de 1000 semillas:</b></td>
                                        <td>{model.seedP1000}</td>
                                    </tr>
                                }
                                {model.seedPurity &&
                                    <tr>
                                        <td><b>Pureza:</b></td>
                                        <td>{model.seedPurity} %</td>
                                    </tr>
                                }
                                {model.seedPG &&
                                    <tr>
                                        <td><b>Poder germinativo:</b></td>
                                        <td>{model.seedPG} gr</td>
                                    </tr>
                                }
                                {model.seedEfficiency &&
                                    <tr>
                                        <td><b>Eficiencia de implantación:</b></td>
                                        <td>{model.seedEfficiency}</td>
                                    </tr>
                                }
                                {model.seedDensity && model.seedDensityUnit !== "Kg/ha" &&
                                    <tr>
                                        <td><b>Densidad de siembra:</b></td>
                                        <td>{`${model.seedDensity} ${model.seedDensityUnit}`}</td>
                                    </tr>
                                }
                            </>
                        }
                    </tbody>
                </table>
            </Row>

            <Block style={{marginTop:20}}>
                <BlockTitle className={classes.SectionTitle}>Prescripción</BlockTitle>
                <PrescriptionTable supplies={model.supplies}/>
                
                <BlockTitle className={classes.SectionTitle}>Insumos</BlockTitle>
                <SuppliesTable supplies={model.supplies} loadBalancing={model.loadBalancingEnabled}/>
            </Block>
            

            <List form noHairlinesMd style={{marginBottom:"10px", marginTop: "10px"}}>    
                <Input
                    slot="list"
                    label="Observaciones"
                    name="comments"
                    type="textarea"
                    icon={iconReport}
                    value={comments}
                    onChange={e => setComments(e.target.value)}>
                </Input>
            </List>

            <Row style={{marginTop:"20px", marginBottom: "15px"}}>
                <Col width={20}></Col>
                <Col width={60}>
                    <Button className="help-target-add-report" fill onClick={addSuppliesToReport} style={{textTransform:"none"}}>
                        Agregar a reporte
                    </Button>
                </Col>
                <Col width={20}></Col>
            </Row>
            <BackButton {...props} />
        </Page>
    );
};

export default SuppliesList;