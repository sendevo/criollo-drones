import { Page, Navbar, Block, List, Row, Col, Button, BlockTitle } from "framework7-react";
import Input from "../../components/Input";
import { NavbarTitle, BackButton } from "../../components/Buttons";
import Toast from '../../components/Toast';
import { useContext, useState } from "react";
import { ModelCtx } from "../../context";
import { computeQd } from "../../entities/API";
import { set2Decimals } from "../../utils";
import concentrationIcon from '../../assets/icons/concentracion.png';
import doseIcon from '../../assets/icons/dropper.png';


const View = props => { // View
    
    const model = useContext(ModelCtx);

    const [nutrientDose, setNutrientDose] = useState(model.nutrientDose || 0);
    const [nutrientConcentration, setNutrientConcentration] = useState(model.nutrientConcentration || 0);

    let workVolume = "";
    try {
        workVolume = set2Decimals(computeQd({
            Dnu: nutrientDose,
            Cnu: nutrientConcentration,
            Dp: model.productDensity
        })) || "";
    } catch (err) {
        workVolume = "";
    }

    const handleNutrientDoseChange = (e) => {
        setNutrientDose(e.target.value);
    };

    const handleNutrientConcentrationChange = (e) => {
        setNutrientConcentration(e.target.value);
    };

    const handleExport = () => { 
        try{
            // Se calcula de nuevo para capturar errores
            const wv = computeQd({
                Dnu: nutrientDose,
                Cnu: nutrientConcentration,
                Dp: model.productDensity
            });
            model.update({
                nutrientDose,
                nutrientConcentration,
                workVolume: set2Decimals(wv),
                volumeMeasured: true
            });
            props.f7router.back();        
        } catch (err) {
            Toast("error", err.message);
        }
    };

    return (
        <Page>
            <Navbar style={{maxHeight:"40px", marginBottom:"0px"}}>
                <NavbarTitle {...props} title="Ajuste por concentración"/>
            </Navbar>
            
            <BlockTitle style={{marginTop: "0px"}}>Cálculo auxiliar de volumen de aplicación</BlockTitle>

            <List form noHairlinesMd style={{marginTop:"0px", marginBottom:"0px"}}>
                <Input
                    slot="list"
                    label="Dosis de nutriente"
                    name="nutrientDose"
                    type="number"
                    unit="kg/ha"
                    icon={doseIcon}
                    value={nutrientDose}
                    onChange={handleNutrientDoseChange}>
                </Input>

                <Input
                    slot="list"
                    label="Concentración de nutriente"
                    name="nutrientConcentration"
                    type="number"
                    unit="%"
                    icon={concentrationIcon}
                    value={nutrientConcentration}
                    onChange={handleNutrientConcentrationChange}>
                </Input>
            </List>

            <Block style={{marginTop:"5px"}}>
                {workVolume && 
                    <span style={{fontSize: "0.9em", color: "rgb(100, 100, 100)"}}>
                        Volumen de aplicación: {workVolume} l/ha
                    </span>
                }
            </Block>
            
            <Block>
                <Row>
                    <Col width={20}></Col>
                    <Col width={60}><Button fill onClick={handleExport}>Exportar</Button></Col>
                    <Col width={20}></Col>
                </Row>
            </Block>

            <BackButton {...props} />
        </Page>
    );
};

export default View;