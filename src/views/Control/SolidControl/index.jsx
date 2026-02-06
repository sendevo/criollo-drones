import { useContext, useEffect, useState } from 'react';
import {  
    Block,
    Button,
    BlockTitle,
    Col,
    Row,
    List
} from 'framework7-react';
import Typography from '../../../components/Typography';
import Input from '../../../components/Input';
import Toast from '../../../components/Toast';
import { CalculatorButton } from '../../../components/Buttons';
import { ModelCtx } from '../../../context/index.js';
import ParamsData from './paramsData.jsx';
import ValidationOutput from './validationOutput.jsx';
import DistributionControl from '../DistributionControl';
import { computeDistributionProfile, computeDose } from '../../../entities/API/index.js';
import { set2Decimals } from '../../../utils/index.js';
import timeIcon from '../../../assets/icons/tiempo.png';
import solidRecolectedIcon from '../../../assets/icons/peso_recolectado.png';
import trayAreaIcon from '../../../assets/icons/sup_bandeja.png';
import trayCountIcon from '../../../assets/icons/cant_bandejas.png';
import traySeparationIcon from '../../../assets/icons/dist_bandejas.png';


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

    const [validationOutputs, setValidationOutputs] = useState({
        effective_dose: model.effectiveDose || '',
        dose_diff: model.doseDiff || '',
        dose_diff_p: model.doseDiffP || ''
    });

    const [distributionOutputs, setDistributionOutputs] = useState({
        expected_dose: model.doseSolid || '',
        effective_dose: model.effectiveDose || '',
    });

    useEffect(() => { // Actualizar input de peso recolectado por si se mide con cronometro
        setInputs({
            ...inputs,
            recolected: model.recolected || ''
        });
    }, [model.recolected]);

    const setMainParams = (attr, value) => {
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
                trayData: newTrayData,
                trayCount: value
            }));
            model.update("trayData", newTrayData);
        }

        if(attr === "trayArea" || attr === "traySeparation" || attr === "workWidth"){ // Al cambiar estos parámetros, el perfil debe recalcularse
            setInputs(prevState => ({ 
                ...prevState, 
                profileComputed: false,
                avgDist: null,
                stdDist: null,
                cvDist: null,
                [attr]: value
            }));
            model.update(attr, value);
        }
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
                setDistributionOutputs(prevState => ({
                    ...prevState,
                    effective_dose: avg
                }));
                model.update({
                    profile,
                    avgDist: avg,
                    stdDist: std,
                    cvDist: cv
                });
            }
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
            work_velocity: parseFloat(inputs.workVelocity),
            recolected_time: parseFloat(inputs.recolectedTime),
            work_width: parseFloat(inputs.workWidth),
            expected_dose: parseFloat(inputs.doseSolid)
        };

        const result = computeDose(params);

        if(result.status === "error"){
            Toast("error", "Error al calcular la dosis. Verifique los datos ingresados.");
            console.log("Wrong keys:", result.wrong_keys);
            return;
        }

        setValidationOutputs ({
            ...outputs,
            effective_dose: result.dose,
            dose_diff: result.diffkg,
            dose_diff_p: result.diffp,
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
        recolectado: set2Decimals(tray.collected * 10 / inputs.trayArea) // Convertir a kg/ha
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

            <ValidationOutput {...validationOutputs} productType={inputs.productType} />

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
                <DistributionControl 
                    inputs={inputs}
                    outputs={distributionOutputs}
                    chartData={chartData}
                    productType={inputs.productType}
                    handleTrayAddCollected={handleTrayAddCollected}
                    handleComputeProfile={handleComputeProfile}
                    handleClearDistrForm={handleClearDistrForm}
                />
            }
        </div>
    );
};

export default SolidControl;