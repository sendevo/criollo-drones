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
import LiquidControl from './liquidControl';
import SolidControl from './solidControl';
import Input from '../../components/Input';
import timeIcon from '../../assets/icons/tiempo.png';
import solidRecolectedIcon from '../../assets/icons/peso_recolectado.png';
import liquidRecolectedIcon from '../../assets/icons/vol_recolectado.png';
import Toast from '../../components/Toast';


const ParamsData = props => {
    const {
        doseSolid,
        workWidth,
        workVelocity
    } = props;

    const dataCellStyle = {
        frontSize: "90%"
    };

    const fieldCellStyle = {
        textAlign: "left",
        frontSize: "90%"
    };

    return (
        <Block style={{margin: "10px 0px 5px 0px"}}>
            <table style={
                {
                    display: "block",
                    padding: "0px !important",
                    margin: "0 0 0 auto"
                }}>
                <tbody>
                    {doseSolid ? 
                        <tr>
                            <td style={fieldCellStyle}><b>Dosis prevista:</b></td>
                            <td style={dataCellStyle}>{doseSolid?.toFixed(2)} kg/ha</td>
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

const Control = props => {

    const model = useContext(ModelCtx);

    const [inputs, setInputs] = useState({
        productType: model.productType,
        recolected: model.recolected || '',
        recolectedTime: model.recolectedTime || ''
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
        Toast("info", "No implementado...");
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