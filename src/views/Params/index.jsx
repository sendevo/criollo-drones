import { 
    Navbar, 
    Page, 
    List,
    Checkbox,
    BlockTitle
} from 'framework7-react';
import { useContext, useState } from 'react';
import { NavbarTitle, BackButton } from '../../components/Buttons';
import { ProductTypeSelector } from '../../components/Selectors';
import Typography from '../../components/Typography';
import Input from '../../components/Input';
import Toast from '../../components/Toast';
import TrayTable from '../../components/TrayTable';
import { ModelCtx } from '../../context';
import { getLocation } from '../../utils';
import iconArea from '../../assets/icons/sup_lote.png';
import iconName from '../../assets/icons/reportes.png';
import iconVel from '../../assets/icons/velocidad.png';
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
        workWidth: model.workWidth || '',
        doseSolid: model.doseSolid || '',
        doseLiquid: model.doseLiquid || '',
        gpsEnabled: false,
        trayArea: model.trayArea || '',
        trayCount: model.trayCount || '',
        traySeparation: model.traySeparation || '',
        trayData: model.trayData || []
    });

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
                <Typography>Datos de operación</Typography>
            </BlockTitle>
        
            <List form noHairlinesMd style={{marginBottom:"10px"}}>
                <Input
                    slot="list"
                    label="Velocidad de trabajo"
                    name="workVelocity"
                    type="number"
                    unit="m/s"
                    icon={iconVel}
                    value={inputs.workVelocity}
                    onChange={v=>setMainParams('workVelocity', Math.abs(parseFloat(v.target.value)))}>
                </Input>
            
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

                {inputs.productType === "liquido" ?
                    <Input
                        slot="list"
                        label="Dosis"
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
                        label="Dosis"
                        name="doseSolid"
                        type="number"
                        unit="kg/ha"
                        icon={iconDoseSol}
                        value={inputs.doseSolid}
                        onChange={v=>setMainParams('doseSolid', Math.abs(parseFloat(v.target.value)))}>
                    </Input>
                }
            </List>

            <BlockTitle>
                <Typography>Distribución</Typography>
            </BlockTitle>

            <List form noHairlinesMd style={{marginBottom:"10px"}}>
                {inputs.productType === "solido" && 
                    <>
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
                            <TrayTable trayData={inputs.trayData} onAddCollected={handleTrayAddCollected}/>
                        }
                    </>
                }
            </List>

            <BackButton {...props} />
        </Page>
    );
};

export default Params;