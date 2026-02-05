import { 
    Navbar, 
    Page,
    Block,
    BlockTitle,
    Col,
    Row,
    List
} from 'framework7-react';
import { useContext, useState, } from 'react';
import { NavbarTitle, BackButton, CalculatorButton } from '../../components/Buttons';
import Typography from '../../components/Typography';
import { ModelCtx } from '../../context';
import { PRODUCT_TYPES } from '../../entities/Model';
import LiquidControl from './liquidControl';
import SolidControl from './solidControl';
import Input from '../../components/Input';
import solidRecolectedIcon from '../../assets/icons/peso_recolectado.png';
import liquidRecolectedIcon from '../../assets/icons/vol_recolectado.png';


const Control = props => {

    const model = useContext(ModelCtx);

    const [inputs, setInputs] = useState({
        productType: model.productType,
        recolected: model.recolected || ''
    });

    const handleSetRecolected = value => {
        setInputs(prevState => ({ ...prevState, recolected: value }));
        model.update(attr, value); 
    };

    return (
        <Page>            
            <Navbar style={{maxHeight:"40px", marginBottom:"0px"}}>
                <NavbarTitle {...props} title="Verificación de prestación"/>
            </Navbar>

            <Block style={{marginTop:"0px", marginBottom:"0px"}}>
                <BlockTitle>
                    <Typography>Control de distribución</Typography>
                </BlockTitle>
            </Block>

            <List form noHairlinesMd style={{marginTop:"0px", marginBottom:"0px"}}>
                <Row slot="list">
                    <Col width="80">
                        <Input
                            label={inputs.productType === PRODUCT_TYPES.LIQUID ? "Volumen recolectado" : "Peso recolectado"}
                            name="recolected"
                            type="number"
                            unit={inputs.productType === PRODUCT_TYPES.LIQUID ? "L" : "kg"}
                            icon={inputs.productType === PRODUCT_TYPES.LIQUID ? liquidRecolectedIcon : solidRecolectedIcon}
                            value={inputs.recolected}
                            onChange={v=>handleSetRecolected('recolected', Math.abs(parseFloat(v.target.value)))}>
                        </Input>
                    </Col>
                    <Col width="20" style={{paddingTop:"5px", marginRight:"10px"}}>
                        <CalculatorButton href="/recolected/" tooltip="Cronómetro" color="teal"/>
                    </Col>
                </Row>
            </List>

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