import { 
    f7, 
    Block, 
    BlockTitle,
    List, 
    Row, 
    Col, 
    Button 
} from "framework7-react";
import { useContext, useEffect, useState } from "react";
import { ModelCtx } from "../../../context";
import { useSound } from "use-sound";
import moment from 'moment';
import { KeepAwake } from '@capacitor-community/keep-awake';
import DistributionControl from '../DistributionControl';
import Input from "../../../components/Input";
import Toast from "../../../components/Toast";
import { PlayButton } from "../../../components/Buttons";
import { ElapsedSelector } from "../../../components/Selectors";
import Typography from "../../../components/Typography";
import NozzlesTable from "../../../components/NozzlesTable";
import Timer from "../../../entities/Timer";
import * as API from '../../../entities/API/index.js';
import { arrayAvg, formatNumber, set2Decimals } from "../../../utils";
import iconFlow from "../../../assets/icons/caudal.png";
import iconNumber from "../../../assets/icons/cant_picos.png";
import oneSfx from '../../../assets/sounds/uno.mp3';
import twoSfx from '../../../assets/sounds/dos.mp3';
import threeSfx from '../../../assets/sounds/tres.mp3';
import readySfx from '../../../assets/sounds/listo.mp3';
import iconReport from '../../../assets/icons/reportes.png';
import cardAreaIcon from '../../../assets/icons/sup_bandeja.png';
import cardCountIcon from '../../../assets/icons/cant_tarjetas.png';
import cardSeparationIcon from '../../../assets/icons/dist_tarjetas.png';


const timer = new Timer(0, true);

const LiquidControl = props => {
    
    const model = useContext(ModelCtx);

    const [inputs, setInputs] = useState({
        productType: model.productType || '',

        doseLiquid: model.doseLiquid || '',
        workWidth: model.workWidth || '',
        workVelocity: model.workVelocity || '',
        nozzleCnt: model.nozzleCnt || '',
        nozzleFlow: model.nozzleFlow || '',
        recolectedData: model.recolectedData || [],
        
        cardArea: model.cardArea || '',
        cardCount: model.cardCount || '',
        cardSeparation: model.cardSeparation || '',
        cardData: model.cardData || [],
        
        profileComputed: false
    });

    const [firstRound, setFirstRound] = useState(true); // Muestra indicativo la primera vez
    const [elapsed, setElapsed] = useState(model.samplingTimeMs || 30000); // Duracion: 30, 60 o 90

    // Outputs
    const [outputs, setOutputs] = useState({ // Resultados
        ready: false,
        efAvg: undefined,
        totalEffectiveFlow: undefined,
        effectiveSprayVolume: undefined,
        diff: undefined,
        diffp: undefined,
        comments: ""
    });

    const [distributionOutputs, setDistributionOutputs] = useState({
        expected_dose: model.doseSolid || '',
        effective_dose: model.effectiveDose || '',
    });
    
    // Estado del timer
    const [time, setTime] = useState(model.samplingTimeMs || 30000); 
    const [running, setRunning] = useState(false);        
    
    // Sonidos de alerta
    const [play3] = useSound(threeSfx);
    const [play2] = useSound(twoSfx);
    const [play1] = useSound(oneSfx);
    const [play0] = useSound(readySfx);
    
    const handleElapsedChange = value => {
        timer.setInitial(value);
        model.update("samplingTimeMs", value);
        setTime(value);
        setElapsed(value);        
    };

    const handleNozzleFlowChange = e => { // Al cambiar el valor de caudal, actualizar datos de 
        const wf = parseFloat(e.target.value);
        if(wf){ // Actualizar tabla, solo con valor de caudal valido            
            try{
                const temp = inputs.recolectedData.map(row => ({
                    ...row,
                    ...API.computeEffectiveFlow({
                        c: row.value, 
                        tms: elapsed,
                        Va: wf
                    })
                }));                  
                model.update("nozzleFlow", wf);
                updateData(temp);
                setInputs({
                    ...inputs,
                    nozzleFlow: wf,
                    recolectedData: temp
                });
            }catch(err){
                Toast("error", err.message);
            }
        }
        
        setOutputs({
            ...outputs,
            ready: false
        });
    };

    const handleNozzleCntChange = e => {        
        const temp = [];
        for(let i = 0; i < e.target.value; i++){
            temp.push({
                value: 0,
                updated: false,
                ef: undefined,
                s: undefined,
                c: false
            });
        }
        model.update({
            recolectedData: temp,
            nozzleCnt: e.target.value
        });
        setInputs({
            ...inputs,
            recolectedData: temp,
            nozzleCnt: e.target.value
        });
        setOutputs({
            ...outputs,
            ready: false
        });
    };

    const handleNewCollectedValue = value => {        
        try{
            const res = API.computeEffectiveFlow({ // Funcion para evaluar volumen recolectado
                c: value, 
                tms: elapsed,
                Va: parseFloat(inputs.nozzleFlow)
            });
            return res;
        }catch(err){
            Toast("error", err.message);
        }
    };

    const updateData = newData => {
        model.update("recolectedData", newData);
        const efAvg = arrayAvg(newData, "ef");

        if(efAvg){
            try{
                const effectiveSprayVolume = API.computeSprayVolume({
                    Q: efAvg,
                    d: inputs.workWidth/inputs.nozzleCnt,
                    vel: inputs.workVelocity
                });
                const diff = effectiveSprayVolume - inputs.doseLiquid;
                const diffp = inputs.doseLiquid > 0 ? diff/inputs.doseLiquid*100 : 0;
                const result = {
                    efAvg, 
                    totalEffectiveFlow: inputs.nozzleCnt ? efAvg*inputs.nozzleCnt : undefined,
                    effectiveSprayVolume, 
                    expectedSprayVolume: inputs.doseLiquid, 
                    diff, 
                    diffp, 
                    ready: true
                };
                setOutputs({
                    ...outputs,
                    ...result
                });
            }catch(err){
                Toast("error", err.message);
            }
        }
        setInputs({
            ...inputs,
            recolectedData: newData
        });
    };

    const setComments = comments => {
        const temp = {
            ...outputs,
            comments
        };
        model.update("verificationOutput", temp);
        setOutputs(temp);
    };

    useEffect(() => { // Como esta creado con initial=0, hay que inicializarlo en el valor correcto
        timer.setInitial(elapsed);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onTimeout = () => {
        KeepAwake.allowSleep();
        setRunning(false);        
        setTime(elapsed);        
        if(firstRound){ // Mostrar instructivo la primera vez
            Toast("success", "Ingrese el valor recolectado seleccionando la fila correspondiente", 2000, "center");
            setFirstRound(false);
        }
    };

    const toggleRunning = () => {
        if(inputs.nozzleFlow){
            if(inputs.recolectedData.length > 0) // Solo si hay indicado un numero de picos mayor a 0
            {
                if(!running){
                    timer.onChange = setTime;
                    timer.onTimeout = onTimeout;
                    timer.clear();
                    timer.start();
                    KeepAwake.keepAwake()                
                    .catch(err => {
                        //console.log("Error de KeepAwake");
                        //console.log(err);                    
                        Function.prototype();
                    });
                    setRunning(true);
                }else{
                    timer.stop();
                    timer.clear();
                    setTime(elapsed);            
                    KeepAwake.allowSleep()
                    .catch(err => {
                        //console.log("Error de KeepAwake");
                        //console.log(err);                    
                        Function.prototype();
                    });
                    setRunning(false);
                }
            }else{ // Si no hay datos, no se puede iniciar el timer
                Toast("error", "Indique la cantidad de picos a controlar", 3000, "bottom");
            }
        }else{
            Toast("error", "Indique el caudal de trabajo", 3000, "bottom");
        }
    };

    const getTime = () => {
        if(time === 3000)
            play3();
        if(time === 2000)
            play2();
        if(time === 1000)
            play1();
        if(time < 200)
            play0();
        // formatear de unix a min:seg:ms
        return moment(time).format('mm:ss:S');
    };

    const addResultsToReport = () => {
        const {            
            efAvg,
            effectiveSprayVolume,
            totalEffectiveFlow,
            diff,
            diffp,
            comments
        } = outputs;

        model.addControlToReport({
            efAvg,
            expectedSprayVolume: inputs.doseLiquid,
            effectiveSprayVolume,
            totalEffectiveFlow,
            diff,
            diffp,
            recolectedData: inputs.recolectedData,
            comments
        });

        f7.panel.open();       
    };

    const handleCardAddCollected = (cardIndex, collected) => {
        const updatedCardData = [...inputs.cardData];
        updatedCardData[cardIndex].collected = collected;
        model.update("cardData", updatedCardData);
        setInputs(prevState => ({ 
            ...prevState, 
            cardData: updatedCardData
        }));
    };

    const handleComputeProfile = () => {
        Toast("info", "Functionalidad en desarrollo", 2000);
    };

    const handleClearDistrForm = () => {
        setInputs(prevState => ({ 
            ...prevState, 
            cardData: [],
            cardCount: '',
            cardArea: '',
            cardSeparation: ''
        }));
        model.update({
            cardData: [],
            cardCount: '',
            cardArea: '',
            cardSeparation: ''
        });
    };

    const setMainParams = (attr, value) => {
        if(attr === "cardCount"){ // Actualizar array de datos de tarjetas
            const cardCount = isNaN(value) ? 0 : parseInt(value);
            const newCardData = [];
            for(let i=0; i < cardCount; i++){
                if(inputs.cardData[i]){
                    newCardData.push(inputs.cardData[i]);
                }else{
                    newCardData.push({collected: 0});
                }
            }
            setInputs(prevState => ({ 
                ...prevState, 
                cardData: newCardData,
                cardCount: value
            }));
            model.update({
                cardData: newCardData,
                cardCount: value
            });
        }

        if(attr === "cardArea" || attr === "cardSeparation" || attr === "workWidth"){ // Al cambiar estos parámetros, el perfil debe recalcularse
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

    const chartData = inputs.cardData.map( (tray, index) => ({ 
        name: `Tarj. ${index + 1}`, 
        recolectado: set2Decimals(tray.collected / inputs.cardArea) // Convertir a gotas/cm2
    }));

    return (
        <div>
            <ElapsedSelector value={elapsed} disabled={running} onChange={handleElapsedChange}/>

            <List form noHairlinesMd style={{marginBottom:"10px", marginTop: "10px"}}>    
                <Input
                    slot="list"
                    label="Picos a controlar"
                    name="nozzleCnt"
                    type="number"
                    icon={iconNumber}
                    value={inputs.nozzleCnt}
                    onChange={handleNozzleCntChange}
                    disabled={running}>
                </Input>
                <Input
                    slot="list"
                    label="Caudal de pico"
                    name="nozzleFlow"
                    type="number"
                    unit="l/min"
                    icon={iconFlow}
                    value={inputs.nozzleFlow}
                    onChange={handleNozzleFlowChange}
                    disabled={running}>
                </Input>
            </List>

            {!inputs.doseLiquid &&
                <Block style={{marginTop:"20px", marginBottom:"10px"}}>
                    <Typography sx={{color:"red"}}>Indique la dosis a aplicar en los parámetros de aplicación.</Typography>
                </Block>
            }

            <Block style={{marginTop:"20px", textAlign:"center"}}>
                <p style={{fontSize:"50px", margin:"0px"}}>{getTime()} <PlayButton onClick={toggleRunning} running={running} /></p>
            </Block>

            <Block style={{marginBottom: "20px",textAlign:"center"}}>
                <NozzlesTable 
                    data={inputs.recolectedData} 
                    onDataChange={updateData} 
                    rowSelectDisabled={running || !inputs.nozzleFlow}
                    evalCollected={handleNewCollectedValue}/>
            </Block>

            <List form noHairlinesMd style={{marginBottom:"10px", marginTop: "10px"}}>    
                <Input
                    slot="list"
                    label="Observaciones"
                    name="comments"
                    type="textarea"
                    icon={iconReport}
                    value={outputs.comments}
                    onChange={e => setComments(e.target.value)}>
                </Input>
            </List>

            {outputs.ready && 
                <Block style={{
                        lineHeight: "0.5em",
                        marginBottom: "20px"
                    }}>
                    <p><b>Resultados</b></p>
                    {/*<p>Caudal efectivo promedio: {formatNumber(outputs.efAvg)} l/min</p>*/}
                    {outputs.totalEffectiveFlow && <p>Caudal pulverizado efectivo: {formatNumber(outputs.totalEffectiveFlow)} l/min</p>}
                    <p>Volumen pulverizado efectivo: {formatNumber(outputs.effectiveSprayVolume)} l/ha</p>
                    {inputs.doseLiquid && <p>Diferencia: {formatNumber(outputs.diff)} l/ha ({formatNumber(outputs.diffp)} %)</p>}
                </Block>
            }

            <Block style={{marginTop:"30px", marginBottom:"0px"}}>
                <BlockTitle>
                    <Typography>Control de distribución</Typography>
                </BlockTitle>
            </Block>

            <List form noHairlinesMd style={{marginTop: "0px", marginBottom:"10px"}}>        
                <Input
                    slot="list"
                    label="Superficie de tarjeta"
                    name="cardArea"
                    type="number"
                    unit="cm²"
                    icon={cardAreaIcon}
                    value={inputs.cardArea}
                    onChange={v=>setMainParams('cardArea', Math.abs(parseFloat(v.target.value)))}>
                </Input>

                <Input
                    slot="list"
                    label="Cantidad de tarjetas"
                    name="cardCount"
                    type="number"
                    icon={cardCountIcon}
                    value={inputs.cardCount}
                    onChange={v=>setMainParams('cardCount', Math.abs(parseInt(v.target.value)))}>
                </Input>

                <Input
                    slot="list"
                    label="Separación entre tarjetas"
                    name="cardSeparation"
                    type="number"
                    unit="m"
                    icon={cardSeparationIcon}
                    value={inputs.cardSeparation}
                    onChange={v=>setMainParams('cardSeparation', Math.abs(parseFloat(v.target.value)))}>
                </Input>
            </List>

            {inputs.cardData.length > 0 && inputs.cardArea > 0 && inputs.cardSeparation > 0 &&
                <DistributionControl 
                    inputs={inputs}
                    outputs={distributionOutputs}
                    chartData={chartData}
                    productType={inputs.productType}
                    handleTrayAddCollected={handleCardAddCollected}
                    handleComputeProfile={handleComputeProfile}
                    handleClearDistrForm={handleClearDistrForm}/>
            }

            <Row style={{marginTop:30, marginBottom: 20}}>
                <Col width={20}></Col>
                <Col width={60}>
                    <Button fill style={{textTransform:"none"}} onClick={addResultsToReport}>
                        Agregar a reporte
                    </Button>
                </Col>
                <Col width={20}></Col>
            </Row>
        </div>
    );
};

export default LiquidControl;