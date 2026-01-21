import { useContext, useState, useEffect } from 'react';
import { 
    Navbar, 
    Page, 
    BlockTitle, 
    Block, 
    Row, 
    Col, 
    List, 
    Button, 
    Checkbox,
    Card, 
    CardContent
} from 'framework7-react';
import Input from '../../components/Input';
import { NavbarTitle, DeleteButton, AddButton, BackButton } from '../../components/Buttons';
import Toast from '../../components/Toast';
import { ModelCtx } from '../../context';
import * as API from '../../entities/API';
import { generateId, getLocation } from '../../utils';
import { PresentationSelector } from '../../components/Selectors';
import iconProduct from '../../assets/icons/calculador.png';
import iconDoseLiq from '../../assets/icons/dosis_liq.png';
import iconDoseSol from '../../assets/icons/dosis_sol.png';
import iconArea from '../../assets/icons/sup_lote.png';
import iconName from '../../assets/icons/reportes.png';
import iconCapacity from '../../assets/icons/capacidad_carga.png';
import Typography from '../../components/Typography';

const Supplies = props => {

    const model = useContext(ModelCtx);

    const [inputs, setInputs] = useState({
        lotName: model.lotName || '', // Nombre de lote
        workArea: model.workArea || '', // Superficie a trabajar (ha)
        gpsEnabled: false, // Habilitar GPS
        lotCoordinates: model.lotCoordinates || [], // Ubicacion del lote
        loadBalancingEnabled: model.loadBalancingEnabled || true, // Habilitar balanceo de carga
        tankCapacity: model.tankCapacity || '' // Capacidad carga
    });

    const [products, setProducts] = useState(model.supplies || []);

    const addProduct = () => {
        const temp = [...products];
        temp.push({
            key: generateId(),
            name: '',
            dose: '',
            presentation: 0 // 0: ml/ha, 1: gr/ha, 2: ml/100L, 3: gr/100L
        });
        model.update("supplies", temp);        
        setProducts(temp);
    };

    const removeProduct = index => {
        const temp = [...products];
        temp.splice(index, 1);
        model.products = temp;
        model.update("supplies", temp);
        setProducts(temp);
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
        }else{ // gpsEnabled no forma parte del modelo
            model.update(attr, value); 
        }
        setInputs(prevState => ({ ...prevState, [attr]: value }));
    };

    const setProductParams = (index, attr, value) => {
        const temp = [...products];
        temp[index][attr] = value;
        model.update("products", temp);
        setProducts(temp);
    };

    const submit = () => {
        console.log("Calculando insumos con los siguientes datos:");
        console.log("Parámetros principales:", inputs);
        console.log("Productos:", products);
        Toast("info", "Función no disponible aún");
    };

    return (
        <Page>            
            <Navbar style={{maxHeight:"40px", marginBottom:"0px"}}>
                <NavbarTitle {...props} title={"Calculador de mezclas"} />
            </Navbar>   

            <BlockTitle style={{marginBottom:"0px", marginTop: "10px"}}>
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

            <BlockTitle style={{marginBottom:"0px", marginTop: "20px"}}>
                <Typography>Datos de aplicación</Typography>
            </BlockTitle>

            <List form noHairlinesMd style={{marginBottom:"10px"}}>
                <Input
                    slot="list"
                    label="Capacidad de carga"
                    name="tankCapacity"
                    type="number"
                    unit={model.productType === "solido" ? "kg" : "l"}
                    icon={iconCapacity}
                    value={inputs.tankCapacity}
                    onChange={v=>setMainParams('tankCapacity', parseFloat(v.target.value))}>
                </Input>
                <div 
                    slot="list" 
                    style={{paddingLeft: 30, paddingBottom: 10}}>
                    <Checkbox
                        checked={inputs.loadBalancingEnabled}
                        onChange={v=>setMainParams('loadBalancingEnabled', v.target.checked)}/>
                    <span style={{
                        paddingLeft: 10, 
                        color: inputs.loadBalancingEnabled ? "#000000" : "#999999", 
                        fontSize: "0.8em"}}>
                            Balancear cargas
                    </span>
                </div>
            </List>
            <Block style={{marginTop: "0px", marginBottom: "0px"}}>
                <BlockTitle style={{marginBottom:"10px", marginTop: "20px"}}>
                        <Typography>Insumos</Typography>
                </BlockTitle>
                {
                    products.map((p, index) =>(
                        <Card key={p.key} style={{margin:"0px 0px 10px 0px"}}>
                            
                            <DeleteButton onClick={()=>removeProduct(index)}/>
                            
                            <CardContent style={{paddingTop: 10}}>
                                <span style={{color:"gray"}}>
                                    Producto {index+1}
                                </span>
                                <List form noHairlinesMd style={{marginBottom:"0px", marginTop: "0px"}}>
                                    <Input
                                        slot="list"
                                        label="Nombre"
                                        type="text" 
                                        icon={iconProduct}                                       
                                        value={p.name || ''}
                                        onInputClear={()=>setProductParams(index, "name", "")}
                                        onChange={v=>setProductParams(index, "name", v.target.value)}>
                                    </Input>
                                    <Input
                                        slot="list"
                                        label="Dosis"
                                        type="number"
                                        unit={API.presentationUnits[p.presentation]}
                                        icon={model.productType === "solido" ? iconDoseSol : iconDoseLiq}
                                        value={p.dose || ''}
                                        onInputClear={()=>setProductParams(index, "dose", "")}
                                        onChange={v=>setProductParams(index, "dose", parseFloat(v.target.value))}>
                                    </Input>
                                </List>
                                <PresentationSelector 
                                    value={p.presentation} 
                                    onChange={v=>{setProductParams(index, "presentation", v)}}/>
                            </CardContent>                    
                        </Card>
                    ))
                }
                {products.length === 0 &&                 
                    <div style={{textAlign: "center", color:"rgb(150,150,150)"}}>
                        <p>Agregue productos a la lista presionando en "+"</p>
                    </div>
                }
            </Block>
            
            <Block style={{margin:0}}>
                <AddButton onClick={()=>addProduct()}/>
            </Block>
               
            <Row style={{marginBottom:"15px"}} className="help-target-supplies-results">
                <Col width={20}></Col>
                <Col width={60}>
                    <Button fill onClick={submit} style={{textTransform:"none"}}>Calcular insumos</Button>
                </Col>
                <Col width={20}></Col>
            </Row>
            <BackButton {...props} />
        </Page>
    );
};

export default Supplies;