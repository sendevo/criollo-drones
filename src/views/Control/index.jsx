import { f7, Page, Navbar, Block, List, Row, Col, Button } from "framework7-react";
import { useContext, useEffect, useState } from "react";
import { ModelCtx, WalkthroughCtx } from "../../context";
import { useSound } from "use-sound";
import moment from 'moment';
import * as API from '../../entities/API/index.js';
import { KeepAwake } from '@capacitor-community/keep-awake';
import Input from "../../components/Input";
import { arrayAvg, formatNumber } from "../../utils";
import { PlayButton, NavbarTitle, BackButton } from "../../components/Buttons";
import Timer from "../../entities/Timer";
import Toast from "../../components/Toast";
import { ElapsedSelector } from "../../components/Selectors";
import NozzlesTable from "../../components/NozzlesTable";
import iconFlow from "../../assets/icons/caudal.png";
import iconNumber from "../../assets/icons/cant_picos.png";
import oneSfx from '../../assets/sounds/uno.mp3';
import twoSfx from '../../assets/sounds/dos.mp3';
import threeSfx from '../../assets/sounds/tres.mp3';
import readySfx from '../../assets/sounds/listo.mp3';
import classes from './style.module.css';
import iconReport from '../../assets/icons/reportes.png';


const timer = new Timer(0, true);

const Control = props => {
    
    const model = useContext(ModelCtx);

    const [firstRound, setFirstRound] = useState(true); // Muestra indicativo la primera vez
    const [elapsed, setElapsed] = useState(model.samplingTimeMs || 30000); // Duracion: 30, 60 o 90
    
    // Inputs
    const [workFlow, setWorkFlow] = useState(model.workFlow || undefined);    
    const [data, setData] = useState(model.collectedData || []); // Datos de la tabla

    // Outputs
    const [outputs, setOutputs] = useState(model.verificationOutput || { // Resultados
        ready: false,
        efAvg: undefined,
        totalEffectiveFlow: undefined,
        expectedSprayVolume: undefined,
        effectiveSprayVolume: undefined,
        diff: undefined,
        diffp: undefined,
        comments: ""
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

    const handleWorkFlowChange = e => { // Al cambiar el valor de caudal, actualizar datos de 
        const wf = parseFloat(e.target.value);
        if(wf){ // Actualizar tabla, solo con valor de caudal valido            
            try{
                const temp = data.map(row => ({
                    ...row,
                    ...API.computeEffectiveFlow({
                        c: row.value, 
                        tms: elapsed,
                        Va: wf
                    })
                }));                  
                model.update("workFlow", wf);
                updateData(temp);
            }catch(err){
                Toast("error", err.message);
            }
        }
        setWorkFlow(e.target.value);
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
        const temp2 = {
            ...outputs,
            ready: false
        };
        model.update("collectedData", temp);
        model.update("verificationOutput", temp2);
        setData(temp);
        setOutputs(temp2);
    };

    const handleNewCollectedValue = value => {        
        try{
            const res = API.computeEffectiveFlow({ // Funcion para evaluar volumen recolectado
                c: value, 
                tms: elapsed,
                Va: parseFloat(workFlow)
            });
            return res;
        }catch(err){
            Toast("error", err.message);
        }
    };

    const updateData = newData => {
        model.update("collectedData", newData);
        const efAvg = arrayAvg(newData, "ef");
        if(efAvg){
            try{
                const effectiveSprayVolume = API.computeSprayVolume({
                    Q: efAvg,
                    d: model.nozzleSeparation,
                    vel: model.workVelocity
                });
                const expectedSprayVolume = model.workVolume;
                const diff = effectiveSprayVolume - expectedSprayVolume;
                const diffp = diff/model.workVolume*100;
                const result = {
                    efAvg, 
                    totalEffectiveFlow: model.nozzleNumber ? efAvg*model.nozzleNumber : undefined,
                    effectiveSprayVolume, 
                    expectedSprayVolume, 
                    diff, 
                    diffp, 
                    ready: true
                };
                model.update("verificationOutput", result);
                setOutputs(result);
            }catch(err){
                Toast("error", err.message);
            }
        }
        setData(newData);
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
        if(workFlow){
            if(data.length > 0) // Solo si hay indicado un numero de picos mayor a 0
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
            expectedSprayVolume,
            effectiveSprayVolume,
            totalEffectiveFlow,
            diff,
            diffp,
            comments
        } = outputs;
        model.addControlToReport({
            efAvg,
            expectedSprayVolume,
            effectiveSprayVolume,
            totalEffectiveFlow,
            diff,
            diffp,
            data,
            comments
        });
        f7.panel.open();       
    };

    const wlk = useContext(WalkthroughCtx);
    Object.assign(wlk.callbacks, {
        control_nozzles: () => {            
            handleNozzleCntChange({target: {value: 3}});
        },
        control_results: () => {
            updateData(model.collectedData);
        }
    });

    return (
        <Page>
            <Navbar style={{maxHeight:"40px", marginBottom:"0px"}}>
                <NavbarTitle title="Verificación de picos" {...props} />
            </Navbar>

            <ElapsedSelector value={elapsed} disabled={running} onChange={handleElapsedChange}/>

            <List form noHairlinesMd style={{marginBottom:"10px", marginTop: "10px"}} className="help-target-control-nozzles">    
                <Input
                    slot="list"
                    label="Picos a controlar"
                    name="nozzleCnt"
                    type="number"
                    icon={iconNumber}
                    value={data.length === 0 ? undefined : data.length}
                    onChange={handleNozzleCntChange}
                    disabled={running}>
                </Input>
                <Input
                    slot="list"
                    label="Caudal de pico"
                    name="workFlow"
                    type="number"
                    unit="l/min"
                    icon={iconFlow}
                    value={workFlow}
                    onChange={handleWorkFlowChange}
                    disabled={running}>
                </Input>
                {model.sprayFlow && <div slot="list">
                    <span style={{fontSize: "0.85em", color: "rgb(100, 100, 100)", marginLeft: "50px"}}>
                        Caudal pulverizado: {model.sprayFlow} l/min
                    </span>
                </div>}
            </List>

            <Block style={{marginTop:"20px", textAlign:"center"}} className="help-target-control-play">
                <p style={{fontSize:"50px", margin:"0px"}}>{getTime()} <PlayButton onClick={toggleRunning} running={running} /></p>
            </Block>

            <Block style={{marginBottom: "20px",textAlign:"center"}}>
                <NozzlesTable 
                    data={data} 
                    onDataChange={updateData} 
                    rowSelectDisabled={running || !workFlow}
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
                <Block className={classes.OutputBlock}>
                    <p className="help-target-control-results"><b>Resultados</b></p>
                    {/*<p>Caudal efectivo promedio: {formatNumber(outputs.efAvg)} l/min</p>*/}
                    {outputs.totalEffectiveFlow && <p>Caudal pulverizado efectivo: {formatNumber(outputs.totalEffectiveFlow)} l/min</p>}
                    <p>Volumen pulverizado efectivo: {formatNumber(outputs.effectiveSprayVolume)} l/ha</p>
                    <p>Diferencia: {formatNumber(outputs.diff)} l/ha ({formatNumber(outputs.diffp)} %)</p>
                    <Row style={{marginTop:30, marginBottom: 20}} className="help-target-control-reports">
                        <Col width={20}></Col>
                        <Col width={60}>
                            <Button fill style={{textTransform:"none"}} onClick={addResultsToReport}>
                                Agregar a reporte
                            </Button>
                        </Col>
                        <Col width={20}></Col>
                    </Row>
                </Block>
            }
            <BackButton {...props} />
        </Page>
    );
};

export default Control;