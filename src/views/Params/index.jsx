import { 
    f7,
    Navbar, 
    Page, 
    List,
    Checkbox,
    Row,
    Col,
    Button,
    BlockTitle
} from 'framework7-react';
import { useContext, useEffect, useState, Fragment } from 'react';
import { NavbarTitle, BackButton, CalculatorButton } from '../../components/Buttons';
import { ProductTypeSelector } from '../../components/Selectors';
import Typography from '../../components/Typography';
import Input from '../../components/Input';
import Toast from '../../components/Toast';
import { ModelCtx } from '../../context';
import { getLocation } from '../../utils';
import iconArea from '../../assets/icons/sup_lote.png';
import iconName from '../../assets/icons/reportes.png';
import iconVel from '../../assets/icons/velocidad.png';
import iconFlightAltitude from '../../assets/icons/altitud_vuelo.png';
import iconWidth from '../../assets/icons/ancho_faja.png';
import iconDoseLiq from '../../assets/icons/dosis_liq.png';
import iconDoseSol from '../../assets/icons/dosis_sol.png';
import { PRODUCT_TYPES } from '../../entities/Model';


const Params = props => {

    const model = useContext(ModelCtx);

    const [inputs, setInputs] = useState({
        productType: model.productType,
    
        lotName: model.lotName || '',
        workArea: model.workArea || '',
        lotCoordinates: model.lotCoordinates || [],
        gpsEnabled: false,

        doseSolid: model.doseSolid || '',
        doseLiquid: model.doseLiquid || '',
        workWidth: model.workWidth || '',
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
            <Navbar style={{maxHeight:"40px", marginBottom:"0px"}}>
                <NavbarTitle {...props} title="Parámetros de operación"/>
            </Navbar>

            <ProductTypeSelector value={inputs.productType} onChange={handleProductTypeChange}/>

            <BlockTitle>
                <Typography>Datos del lote</Typography>
            </BlockTitle>

            <List form noHairlinesMd style={{marginBottom:"10px"}}>    
                <Input
                    slot="list"
                    label="Lote"
                    name="lotName"
                    type="text"
                    icon={iconName}
                    value={inputs.lotName}
                    onChange={v=>setMainParams('lotName', v.target.value)}>
                </Input>
                <Input
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

            <BlockTitle>
                <Typography>Parámetros de labor</Typography>
            </BlockTitle>

            <List form noHairlinesMd style={{marginBottom:"10px"}}>

                {inputs.productType === PRODUCT_TYPES.LIQUID ?
                    <Input
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
                    <Input
                        slot="list"
                        label="Dosis prevista"
                        name="doseSolid"
                        type="number"
                        unit="kg/ha"
                        icon={iconDoseSol}
                        value={inputs.doseSolid}
                        onChange={v=>setMainParams('doseSolid', Math.abs(parseFloat(v.target.value)))}>
                    </Input>
                }

                <Input
                    slot="list"
                    label="Ancho de faja"
                    name="workWidth"
                    type="number"
                    unit="m"
                    icon={iconWidth}
                    value={inputs.workWidth}
                    onChange={v=>setMainParams('workWidth', Math.abs(parseFloat(v.target.value)))}>
                </Input>

                <Row slot="list">
                    <Col width="80">
                        <Input
                            label="Velocidad"
                            name="workVelocity"
                            type="number"
                            unit="m/s"
                            icon={iconVel}
                            value={inputs.workVelocity}
                            onChange={v=>setMainParams('workVelocity', Math.abs(parseFloat(v.target.value)))}>
                        </Input>
                    </Col>
                    <Col width="20" style={{paddingTop:"5px", marginRight:"10px"}}>
                        <CalculatorButton href="/velocity/" tooltip="Medir velocidad"/>
                    </Col>
                </Row>

                <Input
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