import { 
    Page, 
    Navbar, 
    List, 
    Block,
    BlockTitle,
    Row, 
    Button,
    Col
} from "framework7-react";
import { useContext, useState, useEffect } from "react";
import { ModelCtx } from "../../context";
import Input from '../../components/Input';
import Select from '../../components/Select';
import Typography from '../../components/Typography';
import { NavbarTitle, NAVBAR_STYLE } from "../../components/Buttons";
import Toast from "../../components/Toast";
import iconSeedingDensity from '../../assets/icons/dens_siembra.png';
import { PRODUCT_TYPES, SEEDING_DENSITY_UNITS } from '../../entities/Model';
import pmsData from '../../assets/pms.json';
import { parseNonNegativeNumber, set2Decimals } from "../../utils";
import { densToKgHa, densFromKgHa, getParameterNames } from "../../entities/API";

const Dose = props => {

    const model = useContext(ModelCtx);

    const [inputs, setInputs] = useState({
        seedVariety: model.seedVariety || '',
        seedName: model.seedName || '',
        seedP1000: model.seedP1000 || '',
        seedPurity: model.seedPurity || '',
        seedPG: model.seedPG || '',
        plantingEfficiency: model.plantingEfficiency || '',
        seedingDensity: model.seedingDensity || '',
        seedingDensityUnit: model.seedingDensityUnit || 'Kg/ha',
        doseSolid: model.doseSolid || ''
    });

    const seedingDensityUnitOptions = Object
        .values(SEEDING_DENSITY_UNITS)
        .filter(value => value !== SEEDING_DENSITY_UNITS.KG_HA)
        .map(value => ({
        value,
        text: value
    }));

    const seedPresetOptions = [
        { value: '', text: 'Seleccione' },
        ...pmsData.map(({ variedad, pms }) => ({
            value: variedad,
            text: variedad
        }))
    ];

    const setParam = (attr, value) => {
        setInputs(prevState => ({ ...prevState, [attr]: value }));
        if(attr == "seedName") {
            const selectedSeed = pmsData.find(({ variedad }) => variedad === value);
            if(selectedSeed) {
                setInputs(prevState => ({
                    ...prevState,
                    seedName: value,
                    seedP1000: selectedSeed.pms
                }));
                model.update("seedName", value);
                model.update("seedP1000", selectedSeed.pms);
                return;
            }
            setInputs(prevState => ({
                ...prevState,
                seedName: value,
                seedP1000: ''
            }));
            model.update("seedName", value);
            model.update("seedP1000", '');
            return;
        }
        model.update(attr, value);
    };

    const handleExport = () => {
        const result = densToKgHa({
            unit: inputs.seedingDensityUnit,
            dens: inputs.seedingDensity,
            seedP1000: inputs.seedP1000,
            seedPurity: inputs.seedPurity,
            seedPG: inputs.seedPG,
            plantingEfficiency: inputs.plantingEfficiency
        });

        if (result.status === "error") {
            // e.g. surface which fields are invalid/missing
            console.warn("Invalid dose params:", result.wrong_keys);
            Toast("error", `Error en parámetros: ${getParameterNames(result.wrong_keys)}`);
            return;
        }

        model.update("doseSolid", set2Decimals(result.kg_ha));
        props.f7router.back();
    };

    return (
        <Page>
            <Navbar style={NAVBAR_STYLE}>      
                <NavbarTitle {...props} title="Cálculo de dosis"/>
            </Navbar>

            <Block style={{marginTop: "0px"}}>
                <List form noHairlinesMd style={{marginTop: "0px"}}>
                    <Input
                        data-testid="input-seed-variety"
                        slot="list"
                        label="Híbrido o variedad"
                        name="seedVariety"
                        type="text"
                        value={inputs.seedVariety}
                        onChange={v=>setParam('seedVariety', v.target.value)}>
                    </Input>    

                    <Row slot="list">
                        <Col>
                            <Select
                                data-testid="input-seed-name"
                                slot="list"
                                label="Valor predefinido"
                                name="seedName"
                                value={inputs.seedName}
                                options={seedPresetOptions}
                                onChange={v => setParam('seedName', v.target.value)}>
                            </Select>
                        </Col>
                    
                        <Col>
                            <Input
                                data-testid="input-seed-p1000"
                                slot="list"
                                label="P1000"
                                name="seedP1000"
                                type="number"
                                unit="g"
                                value={inputs.seedP1000}
                                onChange={v=>setParam('seedP1000', parseNonNegativeNumber(v.target.value))}>
                            </Input>    
                        </Col>
                    </Row>

                    <Row slot="list">
                        <Col>
                            <Input
                                data-testid="input-seed-purity"
                                slot="list"
                                label="Pureza"
                                name="seedPurity"
                                type="number"
                                unit="%"
                                value={inputs.seedPurity}
                                onChange={v=>setParam('seedPurity', parseNonNegativeNumber(v.target.value))}>
                            </Input>    
                        </Col>

                        <Col>
                            <Input
                                data-testid="input-seed-pg"
                                slot="list" 
                                label="PG"
                                name="seedPG"
                                type="number"
                                unit="%"
                                value={inputs.seedPG}
                                onChange={v=>setParam('seedPG', parseNonNegativeNumber(v.target.value))}>
                            </Input>    
                        </Col>
                    </Row>
                </List>

                <BlockTitle style={{marginBottom:0}}>
                    <Typography>Estimación de logro</Typography>
                </BlockTitle>

                <List form noHairlinesMd>
                    <Input
                        data-testid="input-planting-efficiency"
                        slot="list" 
                        label="Eficiencia de implantación"
                        name="plantingEfficiency"
                        type="number"
                        unit="%"
                        value={inputs.plantingEfficiency}
                        onChange={v=>setParam('plantingEfficiency', parseNonNegativeNumber(v.target.value))}>
                    </Input>    
                </List>

                <BlockTitle style={{marginBottom:0}}>
                    <Typography>Densidad de siembra</Typography>
                </BlockTitle>

                <List form noHairlinesMd>
                    <Row slot="list">
                        <Col width="100" medium="60">
                            <Input
                                data-testid="input-seed-density"
                                slot="list"
                                label="Densidad de siembra"
                                name="seedingDensity"
                                type="number"
                                inputMode="decimal"
                                icon={iconSeedingDensity}
                                value={inputs.seedingDensity}
                                onChange={v => setParam('seedingDensity', parseNonNegativeNumber(v.target.value))}>
                            </Input>    
                        </Col>

                        <Col width="100" medium="40">
                            <Select
                                data-testid="input-seeding-density-unit"
                                slot="list"
                                label="Unidad"
                                name="seedingDensityUnit"
                                value={inputs.seedingDensityUnit}
                                options={seedingDensityUnitOptions}
                                onChange={v => setParam('seedingDensityUnit', v.target.value)}>
                            </Select>
                        </Col>
                    </Row>
                </List>

                <Row>
                    <Col width={10}></Col>
                    <Col width={40}>
                        <Button fill color="red" onClick={()=>{ props.f7router.back(); }}>
                            Cancelar
                        </Button>
                    </Col>
                    <Col width={40}>
                        <Button fill onClick={handleExport}>
                            Exportar
                        </Button>
                    </Col>
                    <Col width={10}></Col>
                </Row>
            </Block>
        </Page>
    );
};

export default Dose;