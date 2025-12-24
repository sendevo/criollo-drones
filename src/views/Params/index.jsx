import { 
    f7, 
    Navbar, 
    Page, 
    List,
    BlockTitle, 
    Row, 
    Col, 
    Button 
} from 'framework7-react';
import { useContext, useEffect, useState } from 'react';
import { NavbarTitle, CalculatorButton, VolumeCalculatorButton, BackButton } from '../../components/Buttons';
import { NozzleSeparationSelector, ProductTypeSelector } from '../../components/Selectors';
import Input from "../../components/Input";
import NozzleMenu from "../../components/NozzleMenu";
import Toast from '../../components/Toast';
import Typography from '../../components/Typography';
import DropletSizeSlider from '../../components/DropletSizeSlider';
import Divider from '../../components/Divider';
import { ModelCtx, WalkthroughCtx } from '../../context';
import {
    computeQa,
    computeQb,
    computeQt,
    computeQNom,
    computeVt,
    computePt,
    computeVa,
    dropletSizeProperties,
    getDropletSizeName
} from '../../entities/API';
import iconDistance from '../../assets/icons/dpicos.png';
import iconNozzles from '../../assets/icons/cant_picos2.png';
import iconVelocity from '../../assets/icons/velocidad.png';
import iconPressure from '../../assets/icons/presion.png';
import iconDensity from '../../assets/icons/densidad.png';
import iconVolume from '../../assets/icons/dosis.png';

const getInputBorderColor = (updated, productType) => {
    if(productType === "fitosanitarios") {
        return updated ? "green" : "#F2D118";
    }else {
        return updated ? "#007bff" : "orange";
    }
};

const Params = props => {

    const model = useContext(ModelCtx);

    const [inputs, setInputs] = useState({
        nozzleSeparation: model.nozzleSeparation || 0.35,
        nozzleNumber: model.nozzleNumber || '',        
        nominalFlow: model.nominalFlow || 0.8,        
        nominalPressure: model.nominalPressure || 3,
        productDensity: 1,
        workVelocity: model.workVelocity || 20,
        workVelocityUpdated: false,
        workPressure: model.workPressure || 2,
        workPressureUpdated: false,
        workVolume: model.workVolume || 56,
        workVolumeUpdated: false,
        productType: model.productType
    });

    const [nozzleSelection, setNozzleSelection] = useState(model.nozzleSelection || [-1, -1, -1, -1]);

    const nozzle = model.getNozzle(nozzleSelection); // Sin seleccion retorna null

    const {
        nozzleSeparation,
        productType,
        nozzleNumber,
        nominalFlow,
        nominalPressure,
        productDensity,
        workVelocity,
        workVelocityUpdated,
        workPressure,
        workPressureUpdated,
        workVolume,
        workVolumeUpdated
    } = inputs;

    const equationsUpdated = workPressureUpdated && workVelocityUpdated && workVolumeUpdated;

    let withinRange = false; // Condicional para mostrar el slider de tamaño de gota
    if(nozzle)
        if(Array.isArray(nozzle.droplet_sizes)) 
            withinRange = nozzle?.droplet_sizes[0].from < workPressure && nozzle?.droplet_sizes[nozzle?.droplet_sizes.length - 1].to > workPressure;

    // El caudal total de pulverizacion se calcula ante cualquier cambio de variable
    // pero solo si esta indicado el numero de picos
    let sprayFlow = model.sprayFlow;
    try{
        sprayFlow = computeQb({
            n: nozzleNumber,
            Qnom: nominalFlow,
            Pnom: nominalPressure,
            Pt: workPressure,
            Dp: productDensity
        });
        model.update("sprayFlow", sprayFlow);
    }catch(e){
        model.update("sprayFlow", null);
        //console.error("Error al calcular el caudal de pulverización:", e.message);
    }

    // Calcular caudal equivalente en agua
    let waterEqSprayFlow = model.waterEqSprayFlow;
    try {
        waterEqSprayFlow = computeQa({
            Dp: productDensity,
            Pt: workPressure,
            Vt: workVelocity,
            d: nozzleSeparation,
            Qnom: nominalFlow,
            Pnom: nominalPressure
        });
        model.update("waterEqSprayFlow", waterEqSprayFlow);
    }catch(e){
        model.update("waterEqSprayFlow", null);
        //console.error("Error al calcular el caudal equivalente en agua:", e.message);
    }

    // El caudal de pulverizacion de cada pico se calcula ante cualquier cambio de variable
    // pero no se usa en esta seccion, sino en verificacion de picos
    try{
        const workFlow = computeQt({
            Qnom: nominalFlow,
            Pnom: nominalPressure,
            Pt: workPressure
        });      
        model.update("workFlow", workFlow);
    }catch(e){
        model.update("workFlow", null);
    }

    // Ante cualquier cambio, borrar formularios de verificacion y de insumos
    model.update({
        collectedData: [],
        verificationOutput: {
            ready: false,
            efAvg: undefined,
            expectedSprayVolume: undefined,
            effectiveSprayVolume: undefined,
            diff: undefined,
            diffp: undefined
        },
        lotName: "",
        lotCoordinates: [],
        workArea: '',
        capacity: '',
        products: []
    });

    useEffect(() => {
        if(model.velocityMeasured)
            setInputs(prevState => ({
                ...prevState,
                workVelocity: model.workVelocity,
                workVelocityUpdated: true,
                workPressureUpdated: false,
                workVolumeUpdated: false
            }));
        
    }, [model.workVelocity, model.velocityMeasured]);   

    useEffect(() => {
        if(model.volumeMeasured)
            setInputs(prevState => ({
                ...prevState,
                workVolume: model.workVolume,
                workVelocityUpdated: false,
                workPressureUpdated: false,
                workVolumeUpdated: true
            }));
    }, [model.workVolume, model.volumeMeasured]);

    const handleProductTypeChange = value => {
        const prevInputs = {
            ...inputs,
            productType: value,
            workPressureUpdated: false,
            workVelocityUpdated: false,
            workVolumeUpdated: false
        };
        if(value === "fitosanitarios"){
            prevInputs.productDensity =  1;
            setNozzleSelection([-1, -1, -1, -1]); // Reiniciar la seleccion de picos
        }else{
            prevInputs.nozzleNumber = '';
            setNozzleSelection([0, -1, -1, -1]); // Dejar por defecto norma ISO
        }
        if(value === "fitosanitarios" || value === "fertilizante") {
            model.update({
                productType: value,
            });
        }
        setInputs({...prevInputs});  
    };

    const handleNozzleSelected = selection => {        
        setNozzleSelection(selection);
        const nz = model.getNozzle(selection);
        model.update("nozzleSelection", selection);
        if(nz){
            try{
                const qn = computeQNom({
                    b: nz.b,
                    c: nz.c,
                    Pnom: nominalPressure
                });
                model.update({
                    nominalFlow: qn,
                    nozzleName: nz.long_name
                });
                setInputs({
                    ...inputs,
                    nominalFlow: qn,
                    workPressureUpdated: false,
                    workVelocityUpdated: false,
                    workVolumeUpdated: false
                });  
            }catch(err){
                Toast("error", err.message);
            }
        }
    };

    const handleNozzleSeparationChange = e => {
        let ns = parseFloat(e.target.value);
        if(ns < 0)
            ns = 0;
        setInputs({
            ...inputs,
            nozzleSeparation: ns,
            nozzleNumber: '',
            workPressureUpdated: false,
            workVelocityUpdated: false,
            workVolumeUpdated: false
        });
        model.update({
            nozzleSeparation: ns, 
            nozzleNumber: '',
            sprayFlow: null
        });
    };

    const handleNozzleNumberChange = e => {
        let n = parseInt(e.target.value);
        if(n < 0)
            n = '';
        setInputs({
            ...inputs,
            nozzleNumber: n
        });
        model.update("nozzleNumber", n);
    };

    const handleNominalFlowChange = e => {        
        const nf = e.target.value;
        setInputs({
            ...inputs,
            nominalFlow: nf,                        
            workPressureUpdated: false,
            workVelocityUpdated: false,
            workVolumeUpdated: false
        });
        setNozzleSelection([-1, -1, -1, -1]);
        model.update({
            nominalFlow: nf,
            nozzleSelection: [-1, -1, -1, -1],
            nozzleName: null
        });
    };

    const handleNominalPressureChange = e => {
        const np = e.target.value;
        setInputs({
            ...inputs,
            nominalPressure: np,
            workPressureUpdated: false,
            workVelocityUpdated: false,
            workVolumeUpdated: false
        });
        model.update("nominalPressure", np);
    };

    const handleProductDensityChange = e => {
        let density = parseFloat(e.target.value);
        if(density < 0)
            density = '';
        setInputs({
            ...inputs,
            productDensity: density,
            workPressureUpdated: false,
            workVelocityUpdated: false,
            workVolumeUpdated: false
        });
        model.update("productDensity", density);
    };

    // Verificar si se deben limpiar los otros campos al actualizar uno
    const clearOthers = workVelocityUpdated && workPressureUpdated && workVolumeUpdated;

    const handleWorkVelocityChange = e => {
        const wv = e.target.value;
        setInputs({
            ...inputs,
            workVelocity: wv,
            workVelocityUpdated: true,
            workPressureUpdated: workPressureUpdated && !clearOthers,
            workVolumeUpdated: workVolumeUpdated && !clearOthers
        });
        model.update("workVelocity", wv);
    };

    const handleWorkPressureChange = e => {
        const wp = e.target.value;
        setInputs({
            ...inputs,
            workPressure: wp,
            workPressureUpdated: true,
            workVelocityUpdated: workVelocityUpdated && !clearOthers,
            workVolumeUpdated: workVolumeUpdated && !clearOthers
        });
        model.update("workPressure", wp);
    };

    const handleWorkVolumeChange = e => {
        const wv = e.target.value;
        setInputs({
            ...inputs,
            workVolume: wv,
            workVolumeUpdated: true,
            workPressureUpdated: workPressureUpdated && !clearOthers,
            workVelocityUpdated: workVelocityUpdated && !clearOthers
        });
        model.update("workVolume", wv);
    };

    const computeWorkVelocity = () => {
        try{
            const newVel = computeVt({
                Va: workVolume,
                Pt: workPressure,
                d: nozzleSeparation,
                Dp: productDensity,
                Qnom: nominalFlow,
                Pnom: nominalPressure
            });
            model.update({
                workVelocity: newVel,
                velocityMeasured: false
            });
            setInputs({
                ...inputs,
                workVelocity: newVel.toFixed(1),
                workPressure: parseFloat(workPressure).toFixed(1),
                workVolume: parseFloat(workVolume).toFixed(1),
                workVelocityUpdated: true,
                workPressureUpdated: true,
                workVolumeUpdated: true
            });
        } catch(err) {
            Toast("error", err.message);
        }
    };

    const computeWorkPressure = () => {
        try{
            const newPres = computePt({
                Va: workVolume,
                Vt: workVelocity,            
                d: nozzleSeparation,
                Dp: productDensity,
                Qnom: nominalFlow,
                Pnom: nominalPressure
            });
            model.update("workPressure", newPres);
            setInputs({
                ...inputs,
                workPressure: newPres.toFixed(1),
                workVelocity: parseFloat(workVelocity).toFixed(1),
                workVolume: parseFloat(workVolume).toFixed(1),
                workVelocityUpdated: true,
                workPressureUpdated: true,
                workVolumeUpdated: true
            });
        } catch(err) {
            Toast("error", err.message);
        }
    };

    const computeWorkVolume = () => {
        try{
            const newVol = computeVa({
                Pt: workPressure,
                Vt: workVelocity,
                Dp: productDensity,
                d: nozzleSeparation,
                Qnom: nominalFlow,
                Pnom: nominalPressure
            });
            model.update({
                workVolume: newVol,
                volumeMeasured: false
            });
            setInputs({
                ...inputs,
                workVolume: newVol.toFixed(1),
                workVelocity: parseFloat(workVelocity).toFixed(1),
                workPressure: parseFloat(workPressure).toFixed(1),
                workVelocityUpdated: true,
                workPressureUpdated: true,
                workVolumeUpdated: true
            });
        } catch(err) {
            Toast("error", err.message);
        }
    };

    const addParamsToReport = () => {
        let dropletSizeLabel;
        if(productType === "fitosanitarios" && nozzle?.droplet_sizes) {
            dropletSizeLabel = getDropletSizeName(workPressure, nozzle?.droplet_sizes);
        }
        model.addParamsToReport({
            nozzleSeparation,
            nominalFlow,
            nominalPressure,
            workVelocity,
            workPressure,
            workVolume,
            waterEqSprayFlow,
            productDensity,
            productType,
            dropletSizeLabel,
            nozzleName: model.nozzleName
        });
        f7.panel.open();
    };

    // Callbacks del modo ayuda
    const wlk = useContext(WalkthroughCtx);
    Object.assign(wlk.callbacks, {params_2: computeWorkVelocity});
    
    return (
        <Page>            
            <Navbar style={{maxHeight:"40px", marginBottom:"0px"}}>
                <NavbarTitle {...props} title="Parámetros de aplicación"/>
            </Navbar>

            <ProductTypeSelector value={productType} onChange={handleProductTypeChange}/>

            { productType==="fertilizante" && 
                <div>
                    
                    <Divider/>

                    <BlockTitle style={{marginBottom: "5px", marginTop: "5px"}}>
                        <Typography variant='subtitle'>Propiedades del caldo</Typography>
                    </BlockTitle>

                    <List form noHairlinesMd style={{marginBottom:"10px"}}>
                        <Input
                            slot="list"
                            label="Densidad de producto"
                            name="workDensity"
                            type="number"
                            unit="kg/l"
                            icon={iconDensity}
                            value={productDensity}
                            onChange={handleProductDensityChange}>
                        </Input>
                    </List>
                </div>
            }

            <Divider/>

            <NozzleSeparationSelector value={nozzleSeparation} onChange={handleNozzleSeparationChange}/>

            <List form noHairlinesMd style={{marginBottom:"10px", marginTop: "12px"}}>    
                <Input
                    className="help-target-dist-nozzle"
                    slot="list"
                    label="Distancia entre picos"
                    name="nozzleSeparation"
                    type="number"
                    unit="m"
                    icon={iconDistance}
                    value={nozzleSeparation}
                    onChange={handleNozzleSeparationChange}>
                </Input>

                <Input
                    className="help-target-nozzle-cnt"
                    slot="list"
                    label="Cantidad de picos"
                    name="nozzleNumber"
                    type="number"                    
                    icon={iconNozzles}
                    value={nozzleNumber}
                    onChange={handleNozzleNumberChange}>
                </Input>
            </List>

            <Divider/>

            <BlockTitle style={{marginBottom: "5px", marginTop: "5px"}}>
                <Typography variant='subtitle'>Pico</Typography>
            </BlockTitle>
            
            <center className="help-target-nozzle-select">
                <NozzleMenu 
                    productType={productType}
                    onOptionSelected={handleNozzleSelected} 
                    selection={nozzleSelection} />
            </center>

            {/*
            <div style={{paddingLeft:"20px"}}>
                <Typography variant="small" sx={{color:"#000"}}>Selección: {model.getNozzleName(nozzleSelection)}</Typography>
            </div>
            */}

            <List form noHairlinesMd style={{marginBottom:"5px", marginTop: "0px"}}>    
                <Row slot="list">
                    <Col>
                        <Input
                            label="Caudal nominal"
                            name="nominalFlow"
                            type="number"
                            unit="l/min"                    
                            value={nominalFlow}
                            onChange={handleNominalFlowChange}>
                        </Input>
                    </Col>
                    <Col>
                        <Input
                            label="Presión nominal"
                            name="nominalPressure"
                            type="number"
                            unit="bar"                    
                            value={nominalPressure}
                            onChange={handleNominalPressureChange}>
                        </Input>
                    </Col>
                </Row>
            </List>

            <Divider/>

            <BlockTitle style={{marginBottom: "5px", marginTop: "10px"}}>
                <Typography variant='subtitle'>Parámetros de pulverización</Typography>
            </BlockTitle>

            <List form noHairlinesMd style={{marginBottom:"10px"}}>

                <Row slot="list" className="help-target-params-1 help-target-params-2">
                    <Col width="80">
                        <Input
                            slot="list"
                            borderColor={getInputBorderColor(workVelocityUpdated, productType)}
                            label="Velocidad de avance"
                            name="workVelocity"
                            type="number"
                            unit="km/h"
                            icon={iconVelocity}
                            value={workVelocity}
                            onIconClick={computeWorkVelocity}
                            onChange={handleWorkVelocityChange}>
                        </Input>        
                    </Col>
                    <Col width="20" style={{paddingTop:"7x", marginRight:"10px"}}>
                        <CalculatorButton href="/velocity/" tooltip="Medir velocidad"/>
                    </Col>
                </Row>
                
                <Row slot="list" className="help-target-params-1 help-target-params-2">
                    <Col width={"80"}>
                        <Input
                            slot="list"
                            borderColor={getInputBorderColor(workPressureUpdated, productType)}
                            label="Presión de trabajo"
                            name="workPressure"
                            type="number"
                            unit="bar"
                            icon={iconPressure}
                            value={workPressure}
                            onIconClick={computeWorkPressure}
                            onChange={handleWorkPressureChange}>
                        </Input>
                    </Col>
                </Row>
                {sprayFlow && equationsUpdated &&
                    <div slot="list">
                        <span style={{fontSize: "0.85em", color: "rgb(100, 100, 100)", marginLeft: "50px"}}>
                            Caudal pulverizado: {sprayFlow.toFixed(2)} l/min
                        </span>
                    </div>
                }

                <Row slot="list" className="help-target-params-1 help-target-params-2">
                    <Col width={"80"}>
                        <Input
                            slot="list"
                            borderColor={getInputBorderColor(workVolumeUpdated, productType)}
                            label="Volumen de aplicación"
                            name="workVolume"
                            type="number"
                            unit="l/ha"
                            icon={iconVolume}
                            value={workVolume}
                            onIconClick={computeWorkVolume}
                            onChange={handleWorkVolumeChange}>
                        </Input>  
                    </Col>
                    {productType === "fertilizante" &&
                        <Col width="20" style={{paddingTop:"7px", marginRight:"10px"}}>
                            <VolumeCalculatorButton href="/volume/" tooltip="Ajustar caudal"/>
                        </Col>
                    }
                </Row>

                {waterEqSprayFlow && productType === "fertilizante" && equationsUpdated &&
                    <div slot="list">
                        <span style={{fontSize: "0.9em", color: "rgb(100, 100, 250)", marginLeft: "50px"}}>
                            Volumen equivalente en agua: {waterEqSprayFlow.toFixed()} l/ha
                        </span>
                    </div>
                }
            </List>

            { nozzle?.droplet_sizes &&
                <div>
                    <Divider/>
                    {withinRange && 
                        <BlockTitle style={{marginBottom: "5px", marginTop: "10px"}}>
                            <Typography variant='subtitle'>Tamaño de gota: {getDropletSizeName(workPressure, nozzle?.droplet_sizes)}</Typography>
                        </BlockTitle>
                    }
                    <div style={{paddingLeft:"20px", paddingRight:"20px", marginBottom:"10px"}}>
                        {withinRange ? // Ver si la presion de trabajo esta dentro del rango de tamaños de gota
                            <DropletSizeSlider
                                min={nozzle?.droplet_sizes[0].from}
                                max={nozzle?.droplet_sizes[nozzle?.droplet_sizes.length - 1].to}
                                ranges={nozzle.droplet_sizes.map(range => ({
                                        ...range,
                                        label: dropletSizeProperties[range.label] ? dropletSizeProperties[range.label].label_es : range.label, // Usar etiqueta en español
                                        ...dropletSizeProperties[range.label] // Agregar color y fondo
                                    }))}
                                    value={workPressure}/>                            
                        :
                            <Typography variant="small" sx={{ marginBottom: '5px', color: "#000" }}>
                                Presión de trabajo fuera de rango
                            </Typography>
                        
                        }
                    </div>
                </div>
            }

            <Divider/>

            <Row style={{marginTop:20, marginBottom: 20}}>
                <Col width={20}></Col>
                <Col width={60} className="help-target-params-report">
                    <Button 
                        fill    
                        style={{textTransform:"none"}} 
                        disabled={!(workVelocityUpdated && workPressureUpdated && workVolumeUpdated)} 
                        onClick={addParamsToReport}>
                            Agregar a reporte
                    </Button>
                </Col>
                <Col width={20}></Col>
            </Row>

            <BackButton {...props} />
        </Page>
    );
};

export default Params;