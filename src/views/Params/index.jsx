import { 
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
import TrayTable from '../../components/TrayTable';
import Chart from '../../components/Chart';
import { ModelCtx } from '../../context';
import { getLocation } from '../../utils';
import { computeDistributionProfile } from '../../entities/API';
import ResultsProfile from './resultsProfile.jsx';
import iconArea from '../../assets/icons/sup_lote.png';
import iconName from '../../assets/icons/reportes.png';
import iconVel from '../../assets/icons/velocidad.png';
import iconRecolected from '../../assets/icons/peso_recolectado.png';
import iconWidth from '../../assets/icons/ancho_faja.png';
import iconDoseLiq from '../../assets/icons/dosis_liq.png';
import iconDoseSol from '../../assets/icons/dosis_sol.png';
import trayAreaIcon from '../../assets/icons/sup_bandeja.png';
import trayCountIcon from '../../assets/icons/cant_bandejas.png';
import traySeparationIcon from '../../assets/icons/dist_bandejas.png';


const Params = props => {

    const model = useContext(ModelCtx);

    const [inputs, setInputs] = useState({
        productType: model.productType,
        lotCoordinates: model.lotCoordinates || [],
        lotName: model.lotName || '',
        workArea: model.workArea || '',
        workVelocity: model.workVelocity || '',
        recolected: model.recolected || '',
        workWidth: model.workWidth || '',
        doseSolid: model.doseSolid || '',
        doseLiquid: model.doseLiquid || '',
        gpsEnabled: false,
        trayArea: model.trayArea || '',
        trayCount: model.trayCount || '',
        traySeparation: model.traySeparation || '',
        trayData: model.trayData || []
    });

    useEffect(() => { // Actualizar input de velocidad por si se mide con cronometro
        setInputs({
            ...inputs,
            workVelocity: model.workVelocity || ''
        });
    }, [model.workVelocity]);

    useEffect(() => { // Actualizar input de peso recolectado por si se mide con cronometro
        setInputs({
            ...inputs,
            recolected: model.recolected || ''
        });
    }, [model.recolected]);


    const handleProductTypeChange = (value) => {
        if(value === "solido" || value === "liquido") {
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

    const handleTrayAddCollected = (trayIndex, collectedWeight) => {
        const updatedTrayData = [...inputs.trayData];
        updatedTrayData[trayIndex].collected = collectedWeight;
        model.update("trayData", updatedTrayData);
        setInputs(prevState => ({ ...prevState, trayData: updatedTrayData }));
    };

    const handleComputeProfile = () => {
        if(inputs.trayData.length === 0){
            Toast("error", "No hay datos de bandejas para calcular el perfil");
            return;
        }

        const tray_data = inputs.trayData.map(tray => tray.collected);
        const tray_distance = inputs.traySeparation;
        const pass_number = 1;
        const work_width = inputs.workWidth;
        const work_pattern = "lineal"; // ida y vuelta (lineal) o circular

        try {

            console.log(tray_data, tray_distance, pass_number, work_width, work_pattern);

            const result = computeDistributionProfile({
                tray_data,
                tray_distance,
                pass_number,
                work_width,
                work_pattern
            });

            if(result.status === "error") {
                Toast("error", `Error en parámetros: ${result.wrongKeys}`);
                return;
            }else{
                console.log(result);
            }
        } catch (error) {
            Toast("error", "Error al calcular el perfil de distribución");
        }
    };

    const handleClearDistrForm = () => {
        setInputs(prevState => ({ 
            ...prevState, 
            trayArea: '',
            trayCount: '',
            traySeparation: '',
            trayData: [] 
        }));
        model.update({
            trayArea: '',
            trayCount: '',
            traySeparation: '',
            trayData: [] 
        });
    };

    const chartData = inputs.trayData.map( (tray, index) => ({ 
        name: `Band. ${index + 1}`, 
        recolectado: tray.collected*100 // Convertir a kg por ha
    }));

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
                <Typography>Dosis</Typography>
            </BlockTitle>

            <List form noHairlinesMd style={{marginBottom:"10px"}}>

                {inputs.productType === "liquido" ?
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

                <Row slot="list">
                    <Col width="80">
                        <Input
                            label="Peso recolectado"
                            name="recolected"
                            type="number"
                            unit={inputs.productType === "liquido" ? "L" : "kg"}
                            icon={iconRecolected}
                            value={inputs.recolected}
                            onChange={v=>setMainParams('recolected', Math.abs(parseFloat(v.target.value)))}>
                        </Input>
                    </Col>
                    <Col width="20" style={{paddingTop:"5px", marginRight:"10px"}}>
                        <CalculatorButton href="/recolected/" tooltip="Cronómetro" color="teal"/>
                    </Col>
                </Row>

            </List>

            <BlockTitle>
                <Typography>Distribución</Typography>
            </BlockTitle>

            {inputs.productType === "solido" ? 
                <List form noHairlinesMd style={{marginBottom:"10px"}}>        
                    <Input
                        slot="list"
                        label="Superficie de bandeja"
                        name="trayArea"
                        type="number"
                        unit="m²"
                        icon={trayAreaIcon}
                        value={inputs.trayArea}
                        onChange={v=>setMainParams('trayArea', Math.abs(parseFloat(v.target.value)))}>
                    </Input>

                    <Input
                        slot="list"
                        label="Cantidad de bandejas"
                        name="trayCount"
                        type="number"
                        icon={trayCountIcon}
                        value={inputs.trayCount}
                        onChange={v=>setMainParams('trayCount', Math.abs(parseInt(v.target.value)))}>
                    </Input>

                    <Input
                        slot="list"
                        label="Separación entre bandejas"
                        name="traySeparation"
                        type="number"
                        unit="m"
                        icon={traySeparationIcon}
                        value={inputs.traySeparation}
                        onChange={v=>setMainParams('traySeparation', Math.abs(parseFloat(v.target.value)))}>
                    </Input>

                    {inputs.trayData.length > 0 &&
                        <Fragment slot="list" >
                            <TrayTable 
                                trayData={inputs.trayData} 
                                onAddCollected={handleTrayAddCollected}/>

                            <ResultsProfile results={
                                {
                                    fitted_dose: 54,
                                    avg: 3.4,
                                    cv: 12.5,
                                    work_width: inputs.workWidth
                                }
                            }/>

                            <Chart 
                                title="Distribución medida"
                                data={chartData} 
                                tooltipSuffix=" kg/ha"
                                />

                            <Row style={{marginBottom:"15px", marginTop:"20px"}}>
                                <Col width={20}></Col>
                                <Col width={60}>
                                    <Button 
                                        fill 
                                        onClick={handleComputeProfile}
                                        style={{textTransform:"none"}}>
                                            Calcular perfil
                                    </Button>
                                </Col>
                                <Col width={20}></Col>
                            </Row>

                            <Row style={{marginBottom:"15px"}}>
                                <Col width={20}></Col>
                                <Col width={60}>
                                    <Button 
                                        fill 
                                        onClick={handleClearDistrForm}
                                        style={{textTransform:"none", backgroundColor:"red"}}>
                                            Borrar formulario
                                    </Button>
                                </Col>
                                <Col width={20}></Col>
                            </Row>
                        </Fragment>
                    }
                </List>
                :
                <div style={{marginBottom:"10px", padding: "20px"}}>
                    <Typography style={{textAlign:"center", marginTop:"10px"}}>
                        Pendiente...
                    </Typography>
                </div>
            }

            <BackButton {...props} />
        </Page>
    );
};

export default Params;