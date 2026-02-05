import { 
    Navbar, 
    Page,
    Block,
    Button,
    BlockTitle,
    Col,
    Row,
    List
} from 'framework7-react';
import { useContext, useState, useEffect} from 'react';
import { NavbarTitle, BackButton, CalculatorButton } from '../../components/Buttons';
import Typography from '../../components/Typography';
import { ModelCtx } from '../../context';
import { PRODUCT_TYPES } from '../../entities/Model';
import { computeDose } from '../../entities/API';
import LiquidControl from './liquidControl';
import SolidControl from './solidControl';
import Input from '../../components/Input';
import timeIcon from '../../assets/icons/tiempo.png';
import solidRecolectedIcon from '../../assets/icons/peso_recolectado.png';
import liquidRecolectedIcon from '../../assets/icons/vol_recolectado.png';
import Toast from '../../components/Toast';

const dataCellStyle = {
    textAlign: "right",
    frontSize: "90%"
};

const fieldCellStyle = {
    textAlign: "left",
    frontSize: "90%"
};

const ParamsData = props => {
    const {
        doseSolid,
        doseLiquid,
        workWidth,
        workVelocity,
        productType
    } = props;

    const dose = productType === PRODUCT_TYPES.LIQUID ? doseLiquid : doseSolid;
    const doseUnit = productType === PRODUCT_TYPES.LIQUID ? "l/ha" : "kg/ha";

    return (
        <Block style={{margin: "10px 0px 5px 0px"}}>
            <table style={
                {
                    padding: "0px !important",
                    margin: "0 auto",
                    width: "90%"
                }}>
                <tbody>
                    {doseSolid ? 
                        <tr>
                            <td style={fieldCellStyle}><b>Dosis prevista:</b></td>
                            <td style={dataCellStyle}>{dose?.toFixed(2)} {doseUnit}</td>
                        </tr>
                        : null
                    }
                    {workWidth ?
                        <tr>
                            <td style={fieldCellStyle}><b>Ancho de labor:</b></td>
                            <td style={dataCellStyle}>{workWidth} m</td>
                        </tr>
                        : null
                    }
                    {workVelocity ?
                        <tr>
                            <td style={fieldCellStyle}><b>Velocidad de trabajo:</b></td>
                            <td style={dataCellStyle}>{workVelocity} m/s</td>
                        </tr>
                        : null
                    }
                </tbody>
            </table>
        </Block>
    );
};


const OutputsData = props => {
    const {
        effectiveDose,
        doseDiff,
        doseDiffP,
        productType
    } = props;

    return (
        <Block style={{margin: "10px 0px 5px 0px"}}>
            <table style={{
                    padding: "0px !important",
                    margin: "0 auto",
                    width: "90%"
                }}>
                <tbody>
                    {effectiveDose ? 
                        <tr>
                            <td style={fieldCellStyle}><b>Dosis efectiva:</b></td>
                            <td style={dataCellStyle}>{effectiveDose?.toFixed(2)} {productType === PRODUCT_TYPES.LIQUID ? "l/ha" : "kg/ha"}</td>
                        </tr>
                        : null
                    }
                    {doseDiff ?
                        <tr>
                            <td style={fieldCellStyle}><b>Diferencia con dosis prevista:</b></td>
                            <td style={dataCellStyle}>{doseDiff?.toFixed(2)} {productType === PRODUCT_TYPES.LIQUID ? "l/ha" : "kg/ha"} ({doseDiffP?.toFixed(2)}%)</td>
                        </tr>
                        : null
                    }
                </tbody>
            </table>
        </Block>
    );
};


const Control = props => {

    const model = useContext(ModelCtx);

    const [inputs, setInputs] = useState({
        productType: model.productType,
        recolected: model.recolected || '',
        recolectedTime: model.recolectedTime || ''
    });

    const [outputs, setOutputs] = useState({
        effectiveDose: model.effectiveDose || '',
        doseDiff: model.doseDiff || '',
        doseDiffP: model.doseDiffP || ''
    });

    useEffect(() => { // Actualizar input de peso recolectado por si se mide con cronometro
        setInputs({
            ...inputs,
            recolected: model.recolected || ''
        });
    }, [model.recolected]);

    useEffect(() => { // Actualizar input de peso recolectado por si se mide con cronometro
        setInputs({
            ...inputs,
            recolectedTime: model.recolectedTime || ''
        });
    }, [model.recolectedTime]);

    const handleSetRecolected = value => {
        setInputs(prevState => ({ ...prevState, recolected: value }));
        model.update("recolected", value); 
    };

    const handleSetRecolectedTime = value => {
        setInputs(prevState => ({ ...prevState, recolectedTime: value }));
        model.update('recolectedTime', value); 
    };

    const handleComputeDose = () => {
        const params = {
            recolected: parseFloat(inputs.recolected),
            work_velocity: parseFloat(model.workVelocity),
            recolected_time: parseFloat(inputs.recolectedTime),
            work_width: parseFloat(model.workWidth),
            expected_dose: model.productType === PRODUCT_TYPES.SOLID ? parseFloat(model.doseSolid) : parseFloat(model.doseLiquid)
        };

        const result = computeDose(params);

        if(result.status === "error"){
            Toast("error", "Error al calcular la dosis. Verifique los datos ingresados.");
            console.log("Wrong keys:", result.wrong_keys);
            return;
        }

        setOutputs({
            ...outputs,
            effectiveDose: result.dose,
            doseDiff: result.diffkg,
            doseDiffP: result.diffp,
        });
        model.update({
            effectiveDose: result.dose,
            doseDiff: result.diffkg,
            doseDiffP: result.diffp,
        });
    };

    return (
        <Page>            
            <Navbar style={{maxHeight:"40px", marginBottom:"0px"}}>
                <NavbarTitle {...props} title="Verificación de prestación"/>
            </Navbar>

            <Block style={{marginTop:"0px", marginBottom:"0px"}}>
                <BlockTitle>
                    <Typography>Verificación de dosis</Typography>
                </BlockTitle>
            </Block>

            <ParamsData {...model} />

            <List form noHairlinesMd style={{marginTop:"0px", marginBottom:"0px"}}>
                <Input
                    label={"Tiempo"}
                    name="recolectedTime"
                    type="number"
                    unit={"seg"}
                    icon={timeIcon}
                    value={inputs.recolectedTime}
                    onChange={v=>handleSetRecolectedTime(Math.abs(parseFloat(v.target.value)))}>
                </Input>
                <Row slot="list">
                    <Col width="80">
                        <Input
                            label={inputs.productType === PRODUCT_TYPES.LIQUID ? "Volumen recolectado" : "Peso recolectado"}
                            name="recolected"
                            type="number"
                            unit={inputs.productType === PRODUCT_TYPES.LIQUID ? "L" : "kg"}
                            icon={inputs.productType === PRODUCT_TYPES.LIQUID ? liquidRecolectedIcon : solidRecolectedIcon}
                            value={inputs.recolected}
                            onChange={v=>handleSetRecolected(Math.abs(parseFloat(v.target.value)))}>
                        </Input>
                    </Col>
                    <Col width="20" style={{paddingTop:"5px", marginRight:"10px"}}>
                        <CalculatorButton href="/recolected/" tooltip="Cronómetro" color="teal"/>
                    </Col>
                </Row>
            </List>

            <OutputsData {...outputs} productType={inputs.productType} />

            <Row style={{marginBottom:"15px", marginTop:"20px"}}>
                <Col width={20}></Col>
                <Col width={60}>
                    <Button 
                        fill 
                        onClick={handleComputeDose}
                        style={{textTransform:"none"}}>
                            Calcular dosis
                    </Button>
                </Col>
                <Col width={20}></Col>
            </Row>

            <Block style={{marginTop:"30px", marginBottom:"0px"}}>
                <BlockTitle>
                    <Typography>Control de distribución</Typography>
                </BlockTitle>
            </Block>

            { inputs.productType === PRODUCT_TYPES.LIQUID ? 
                <LiquidControl {...props} /> 
                : 
                <SolidControl {...props} /> 
            }

            <BackButton {...props} />
        </Page>
    );
};

export default Control;