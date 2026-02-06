import { useContext, useEffect, useState } from 'react';
import {  
    Block,
    Button,
    BlockTitle,
    Col,
    Row,
    List
} from 'framework7-react';
import Typography from '../../components/Typography';
import Input from '../../components/Input';
import Toast from '../../components/Toast';
import { CalculatorButton } from '../../components/Buttons';
import TrayTable from '../../components/TrayTable/index.jsx';
import Chart from '../../components/Chart/index.jsx';
import { ModelCtx } from '../../context/index.js';
import { getLocation } from '../../utils/index.js';
import { computeDistributionProfile, computeDose } from '../../entities/API/index.js';
import { PRODUCT_TYPES } from '../../entities/Model';
import ResultsProfile from './resultsProfile.jsx';
import timeIcon from '../../assets/icons/tiempo.png';
import solidRecolectedIcon from '../../assets/icons/peso_recolectado.png';
import trayAreaIcon from '../../assets/icons/sup_bandeja.png';
import trayCountIcon from '../../assets/icons/cant_bandejas.png';
import traySeparationIcon from '../../assets/icons/dist_bandejas.png';


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
        workWidth,
        workVelocity
    } = props;

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


const SolidControl = () => {

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
        trayData: model.trayData || [],

        profileComputed: false,
        profile: model.profile || [],
        avgDist: model.avgDist || null,
        stdDist: model.stdDist || null,
        cvDist: model.cvDist || null
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
                const {profile, avg, std, cv} = result;
                setInputs(prevState => ({ 
                    ...prevState, 
                    profile: profile,
                    avgDist: avg,
                    stdDist: std,
                    cvDist: cv,
                    profileComputed: true
                }));
            }

            Toast("info", "Funcionalidad en desarrollo - resultados simulados");
        } catch (error) {
            Toast("error", "Error al calcular el perfil de distribución");
        }
    };

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
        <div>
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
                            label={"Peso recolectado"}
                            name="recolected"
                            type="number"
                            unit={"kg"}
                            icon={solidRecolectedIcon}
                            value={inputs.recolected}
                            onChange={v=>handleSetRecolected(Math.abs(parseFloat(v.target.value)))}>
                        </Input>
                    </Col>
                    <Col width="20" style={{paddingTop:"5px", marginRight:"10px"}}>
                        <CalculatorButton href="/recolected/" tooltip="Cronómetro" color="teal"/>
                    </Col>
                </Row>
            </List>

            {!inputs.doseSolid &&
                <Block style={{marginTop:"20px", marginBottom:"10px"}}>
                    <Typography sx={{color:"red"}}>Indique la dosis a aplicar en los parámetros de aplicación.</Typography>
                </Block>
            }

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

            <List form noHairlinesMd style={{marginTop: "0px", marginBottom:"10px"}}>        
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
            </List>

            {inputs.trayData.length > 0 &&
                <div>
                    <TrayTable 
                        trayData={inputs.trayData} 
                        onAddCollected={handleTrayAddCollected}/>

                    {inputs.profileComputed &&
                        <ResultsProfile results={
                            {
                                
                                fitted_dose: 0,
                                avg: inputs.avgDist,
                                cv: inputs.cvDist,
                                work_width: inputs.workWidth
                            }
                        }/>
                    }

                    <Chart 
                        title="Distribución medida"
                        data={chartData} 
                        tooltipSuffix=" kg/ha"/>

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
                </div>
            }
        </div>
    );
};

export default SolidControl;