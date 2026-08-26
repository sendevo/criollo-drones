import { 
    f7,
    Navbar, 
    Page, 
    List,
    ListItem,
    AccordionContent,
    Checkbox,
    Row,
    Col,
    Button,
    BlockTitle
} from 'framework7-react';
import { useContext, useEffect, useState } from 'react';
import { NavbarTitle, BackButton, CalculatorButton, TimerButton, NAVBAR_STYLE } from '../../components/Buttons';
import { ProductTypeSelector } from '../../components/Selectors';
import Typography from '../../components/Typography';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Toast from '../../components/Toast';
import { ModelCtx } from '../../context';
import { getLocation } from '../../utils';
import iconArea from '../../assets/icons/sup_lote.png';
import iconName from '../../assets/icons/reportes.png';
import iconVel from '../../assets/icons/velocidad.png';
import iconFlightAltitude from '../../assets/icons/altitud_vuelo.png';
import iconWidth from '../../assets/icons/ancho_faja.png';
import iconNozzleCnt from '../../assets/icons/cant_picos2.png';
import iconDoseLiq from '../../assets/icons/dosis_liq.png';
import iconDoseSol from '../../assets/icons/dosis_sol.png';
import iconSeedingDensity from '../../assets/icons/dens_siembra.png';
import pmsData from '../../assets/pms.json';
import { PRODUCT_TYPES, SEEDING_DENSITY_UNITS } from '../../entities/Model';


const Params = props => {

    const model = useContext(ModelCtx);
    const seedingDensityUnitOptions = Object.values(SEEDING_DENSITY_UNITS).map(value => ({
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

    const [inputs, setInputs] = useState({
        productType: model.productType,
    
        lotName: model.lotName || '',
        workArea: model.workArea || '',
        lotCoordinates: model.lotCoordinates || [],
        gpsEnabled: false,

        seedVariety: model.seedVariety || '',
        seedName: model.seedName || '',
        seedP1000: model.seedP1000 || '',
        seedPurity: model.seedPurity || '',
        seedPG: model.seedPG || '',
        plantingEfficiency: model.plantingEfficiency || '',

        seedingDensity: model.seedingDensity || '',
        seedingDensityUnit: model.seedingDensityUnit || 'Kg/ha',

        doseSolid: model.doseSolid || '',
        doseLiquid: model.doseLiquid || '',
        workWidth: model.workWidth || '',
        nozzleCnt: model.nozzleCnt || '',
        workVelocity: model.workVelocity || '',
        flightAltitude: model.flightAltitude || ''
    });

    useEffect(() => { // Actualizar input de velocidad por si se mide con cronometro
        setInputs({
            ...inputs,
            workVelocity: model.workVelocity || ''
        });
    }, [model.workVelocity]);


    const handleProductTypeChange = (value) => {
        if(Object.values(PRODUCT_TYPES).includes(value)){
            const prevInputs = { ...inputs, productType: value };
            model.update("productType", value );
            setInputs({
                ...prevInputs,
                productType: value
            });
        }else{
            Toast("error", "Tipo de producto inválido");
        }
    };

    const setMainParams = (attr, value) => {
        if(attr === "gpsEnabled"){
            if(value){
                getLocation().then( coords => {
                    setInputs(prevState => ({ 
                        ...prevState, 
                        lotCoordinates: coords 
                    }));
                })
                .catch( err => {
                    if(err.type === "locationPermissions"){
                        Toast("error", "No se pudieron obtener los permisos de ubicación");
                    }else if(err.type === "getLocation"){
                        Toast("error", "No se pudo obtener la ubicación actual");
                    }else{
                        Toast("error", "Error desconocido al obtener la ubicación");
                    }
                    setInputs(prevState => ({ ...prevState, gpsEnabled: false }));
                });
            }
        }

        if(attr === "seedName"){
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

        if(attr === "trayCount"){ // Actualizar array de datos de bandejas
            const trayCount = isNaN(value) ? 0 : parseInt(value);
            const newTrayData = [];
            for(let i=0; i < trayCount; i++){
                if(inputs.trayData[i]){
                    newTrayData.push(inputs.trayData[i]);
                }else{
                    newTrayData.push({collected: 0});
                }
            }
            setInputs(prevState => ({ 
                ...prevState, 
                trayData: newTrayData
            }));
            model.update("trayData", newTrayData);
        }

        setInputs(prevState => ({ ...prevState, [attr]: value }));
        if(attr !== "gpsEnabled") // gpsEnabled no forma parte del modelo
            model.update(attr, value); 
    };

    const addResultsToReport = () => {
        model.addParamsToReport(inputs);
        f7.panel.open();
    };

    return (
        <Page>            
            <Navbar style={NAVBAR_STYLE}>
                <NavbarTitle {...props} title="Parámetros de operación"/>
            </Navbar>

            <ProductTypeSelector value={inputs.productType} onChange={handleProductTypeChange}/>

            <BlockTitle>
                <Typography>Datos del lote</Typography>
            </BlockTitle>

            <List form noHairlinesMd style={{marginBottom:"10px"}}>    
                <Input
                    data-testid="input-lot-name"
                    slot="list"
                    label="Lote"
                    name="lotName"
                    type="text"
                    icon={iconName}
                    value={inputs.lotName}
                    onChange={v=>setMainParams('lotName', v.target.value)}>
                </Input>
                <Input
                    data-testid="input-work-area"
                    slot="list"
                    label="Superficie"
                    name="workArea"
                    type="number"
                    unit="ha"
                    icon={iconArea}
                    value={inputs.workArea}
                    onChange={v=>setMainParams('workArea', Math.abs(parseFloat(v.target.value)))}>
                </Input>
                <div 
                    slot="list" 
                    style={{paddingLeft: 30, paddingBottom: 10}}>
                    <Checkbox
                        data-testid="checkbox-gps-enabled"
                        checked={inputs.gpsEnabled}
                        onChange={v=>setMainParams('gpsEnabled', v.target.checked)}/>
                    <span style={{
                        paddingLeft: 10, 
                        color: inputs.gpsEnabled ? "#000000" : "#999999", 
                        fontSize: "0.8em"}}>
                            Geoposición [
                                {inputs.lotCoordinates[0]?.toFixed(4) || '?'}, 
                                {inputs.lotCoordinates[1]?.toFixed(4) || '?'}
                            ] 
                    </span>
                </div>
            </List>

            {inputs.productType === PRODUCT_TYPES.SOLID && (
                <List accordionList style={{
                        marginTop: "0", 
                        marginBottom: "10px", 
                        margin: "0px 10px",
                        padding: "0 10px",
                        "--f7-list-border-color": "transparent",
                        "--f7-list-item-border-color": "transparent",
                        border: "1px solid #e0e0e0",
                        borderRadius: "10px"
                    }}>
                    <ListItem accordionItem title="Siembra">
                        <AccordionContent>
                            <div>
                                <BlockTitle style={{marginBottom:0, marginTop: 10}}>
                                    <Typography>Semilla</Typography>
                                </BlockTitle>

                                <List form noHairlinesMd>
                                    <Input
                                        data-testid="input-seed-variety"
                                        slot="list"
                                        label="Híbrido o variedad"
                                        name="seedVariety"
                                        type="text"
                                        value={inputs.seedVariety}
                                        onChange={v=>setMainParams('seedVariety', v.target.value)}>
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
                                                onChange={v => setMainParams('seedName', v.target.value)}>
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
                                                onChange={v=>setMainParams('seedP1000', Math.abs(parseFloat(v.target.value)))}>
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
                                                onChange={v=>setMainParams('seedPurity', Math.abs(parseFloat(v.target.value)))}>
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
                                                onChange={v=>setMainParams('seedPG', Math.abs(parseFloat(v.target.value)))}>
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
                                        onChange={v=>setMainParams('plantingEfficiency', Math.abs(parseFloat(v.target.value)))}>
                                    </Input>    
                                </List>

                                <BlockTitle style={{marginBottom:0}}>
                                    <Typography>Densidad de siembra</Typography>
                                </BlockTitle>

                                <List form noHairlinesMd>
                                    <Row slot="list">
                                        <Col>
                                            <Input
                                                data-testid="input-seed-density"
                                                slot="list"
                                                label="Densidad de siembra"
                                                name="seedingDensity"
                                                type="number"
                                                icon={iconSeedingDensity}
                                                value={inputs.seedingDensity}
                                                onChange={v=>setMainParams('seedingDensity', v.target.value === '' ? '' : Math.abs(parseFloat(v.target.value)))}>
                                            </Input>    
                                        </Col>

                                        <Col>
                                            <Select
                                                data-testid="input-seeding-density-unit"
                                                slot="list"
                                                label="Unidad"
                                                name="seedingDensityUnit"
                                                value={inputs.seedingDensityUnit}
                                                options={seedingDensityUnitOptions}
                                                onChange={v => setMainParams('seedingDensityUnit', v.target.value)}>
                                            </Select>
                                        </Col>
                                    </Row>
                                </List>
                            </div>
                        </AccordionContent>
                    </ListItem>
                </List>
            )}

            <BlockTitle>
                <Typography>Parámetros de labor</Typography>
            </BlockTitle>

            <List form noHairlinesMd style={{marginBottom:"10px"}}>

                {inputs.productType === PRODUCT_TYPES.LIQUID ?
                    <Input
                        data-testid="input-dose-liquid"
                        slot="list"
                        label="Dosis prevista"
                        name="doseLiquid"
                        type="number"
                        unit="L/ha"
                        icon={iconDoseLiq}
                        value={inputs.doseLiquid}
                        onChange={v=>setMainParams('doseLiquid', Math.abs(parseFloat(v.target.value)))}>
                    </Input>
                    :
                    <Row>
                        <Col width="80">
                            <Input
                                data-testid="input-dose-solid"
                                slot="list"
                                label="Dosis prevista"
                                name="doseSolid"
                                type="number"
                                unit="kg/ha"
                                icon={iconDoseSol}
                                value={inputs.doseSolid}
                                onChange={v=>setMainParams('doseSolid', Math.abs(parseFloat(v.target.value)))}>
                            </Input>
                        </Col>
                        <Col width="20" style={{paddingTop:"5px", marginRight:"10px"}}>
                            <CalculatorButton onClick={console.log}/>
                        </Col>
                    </Row>
                }

                <Input
                    data-testid="input-work-width"
                    slot="list"
                    label="Ancho de faja"
                    name="workWidth"
                    type="number"
                    unit="m"
                    icon={iconWidth}
                    value={inputs.workWidth}
                    onChange={v=>setMainParams('workWidth', Math.abs(parseFloat(v.target.value)))}>
                </Input>

                { inputs.productType === PRODUCT_TYPES.LIQUID &&
                    <Input
                        data-testid="input-nozzle-cnt"
                        slot="list"
                        label="Cantidad de picos"
                        name="nozzleCnt"
                        type="number"
                        unit=""
                        icon={iconNozzleCnt}
                        value={inputs.nozzleCnt}
                        onChange={v=>setMainParams('nozzleCnt', Math.abs(parseFloat(v.target.value)))}>
                    </Input>
                }

                <Row slot="list">
                    <Col width="80">
                        <Input
                            data-testid="input-work-velocity"
                            label="Velocidad"
                            name="workVelocity"
                            type="number"
                            unit="km/h"
                            icon={iconVel}
                            value={inputs.workVelocity}
                            onChange={v=>setMainParams('workVelocity', Math.abs(parseFloat(v.target.value)))}>
                        </Input>
                    </Col>
                    <Col width="20" style={{paddingTop:"5px", marginRight:"10px"}}>
                        <TimerButton href="/velocity/" tooltip="Medir velocidad"/>
                    </Col>
                </Row>

                <Input
                    data-testid="input-flight-altitude"
                    slot="list"
                    label="Altura de vuelo"
                    name="flightAltitude"
                    type="number"
                    unit="m"
                    icon={iconFlightAltitude}
                    value={inputs.flightAltitude}
                    onChange={v=>setMainParams('flightAltitude', Math.abs(parseFloat(v.target.value)))}>
                </Input>
            </List>

            <Row style={{marginBottom:"15px", marginTop:"20px"}}>
                <Col width={20}></Col>
                <Col width={60}>
                    <Button 
                        data-testid="save-params-btn"
                        fill 
                        color="green"
                        onClick={() => Toast("success", "Parámetros guardados")}
                        style={{textTransform:"none"}}>
                            Guardar parámetros
                    </Button>
                </Col>
                <Col width={20}></Col>
            </Row>

            <Row style={{marginBottom:"15px", marginTop:"20px"}}>
                <Col width={20}></Col>
                <Col width={60}>
                    <Button 
                        data-testid="add-to-report-btn"
                        fill 
                        onClick={addResultsToReport}
                        style={{textTransform:"none"}}>
                            Agegar al reporte
                    </Button>
                </Col>
                <Col width={20}></Col>
            </Row>

            <BackButton {...props} />
        </Page>
    );
};

export default Params;