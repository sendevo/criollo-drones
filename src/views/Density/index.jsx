import { 
    Page, 
    Navbar,
    Block, 
    BlockTitle,
    List, 
    Row, 
    Col,
    Button 
} from "framework7-react";
import { useContext, useState, useEffect } from 'react';
import { ModelCtx } from '../../context';
import Input from '../../components/Input';
import { parseNonNegativeNumber } from '../../utils';
import iconWeight from '../../assets/icons/peso_recolectado.png';
import iconVolume from '../../assets/icons/concentracion.png';
import { NavbarTitle, NAVBAR_STYLE } from "../../components/Buttons";


const Density = props => { // View

    const model = useContext(ModelCtx);

    const [inputs, setInputs] = useState({weight: 1, volume: 1});

    const [density, setDensity] = useState(1);

    useEffect(() => {
        if(inputs.weight && inputs.volume){
            setDensity(inputs.weight / inputs.volume);
        }
    }, [inputs.weight, inputs.volume]);

    const handleExport = () => {
        if(density){
            model.update("productDensity", density);
            props.f7router.back();
        }
    }

    return (
        <Page>
            <Navbar style={NAVBAR_STYLE}>      
                <NavbarTitle {...props} title="Densidad de caldo"/>
            </Navbar>

            <BlockTitle>Cálculo de densidad</BlockTitle>

            <List form noHairlinesMd style={{marginBottom:"10px"}}>    
                <Input
                    data-testid="input-lot-name"
                    slot="list"
                    label="Peso"
                    name="weight"
                    type="number"
                    unit="kg"
                    icon={iconWeight}
                    value={inputs.weight}
                    onChange={v=>setInputs({...inputs, weight: parseNonNegativeNumber(v.target.value)})}>
                </Input>
                <Input
                    data-testid="input-work-area"
                    slot="list"
                    label="Volumen"
                    name="volume"
                    type="number"
                    unit="l"
                    icon={iconVolume}
                    value={inputs.volume}
                    onChange={v=>setInputs({...inputs, volume: parseNonNegativeNumber(v.target.value)})}>
                </Input>
            </List>

            <Block>
                <p><b>Resultado:</b> {density.toFixed(2)} kg/l</p>
            </Block>

            <Block style={{textAlign:"center"}}>
                <Row>
                    <Col width={20}></Col>
                    <Col width={60}>
                        <Button fill onClick={handleExport}>
                            Exportar
                        </Button>
                    </Col>
                    <Col width={20}></Col>
                </Row>
            </Block>
        </Page>
    );
};

export default Density;