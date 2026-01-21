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
import { Geolocation } from '@capacitor/geolocation';
import Input from '../../components/Input';
import { NavbarTitle, DeleteButton, AddButton, BackButton } from '../../components/Buttons';
import Toast from '../../components/Toast';
import { ModelCtx } from '../../context';
import * as API from '../../entities/API';
import { generateId } from '../../utils';
import { PresentationSelector } from '../../components/Selectors';
import iconProduct from '../../assets/icons/calculador.png';
import iconDose from '../../assets/icons/recolectado.png';
import iconVolume from '../../assets/icons/dosis.png';
import iconArea from '../../assets/icons/sup_lote.png';
import iconName from '../../assets/icons/reportes.png';
import iconCapacity from '../../assets/icons/capacidad_carga.png';
import Typography from '../../components/Typography';


const getPosition = () => {
    return new Promise( (resolve, reject) => {        

        const getCoords = () => {
            Geolocation.getCurrentPosition().then( position => {            
                const coords = [position.coords.latitude, position.coords.longitude];
                resolve(coords);
            }).catch( error => {
                reject(error);
            });
        };

        Geolocation.checkPermissions().then(permissions => {                        
            if(permissions.location === "granted"){ 
                getCoords(); 
            }else{
                Toast("info", "Permisos de ubicación no otorgados", 2000, "center");
                Geolocation.requestPermissions().then(res => {
                    //console.log(res);
                    getCoords();
                }).catch(() => {
                    //console.log("No se pudo obtener coordenadas");
                    Function.prototype();
                });
            }
        });
        /*
        navigator.geolocation.getCurrentPosition( position => {
            const coords = [position.coords.latitude, position.coords.longitude];
            resolve(coords);
            // El valor de model.lotCoordinates se actualiza al hacer submit
        });
        */
    });
};

const Supplies = props => {

    const model = useContext(ModelCtx);

    const [{
        lotName, 
        gpsEnabled, 
        lotCoordinates, 
        loadBalancingEnabled,
        workVolume,
        workArea, 
        capacity
    }, setInputs] = useState({
        lotName: model.lotName || '', // Nombre de lote
        gpsEnabled: false, // Habilitar GPS
        lotCoordinates: model.lotCoordinates || [], // Ubicacion del lote
        loadBalancingEnabled: model.loadBalancingEnabled || true, // Habilitar balanceo de carga
        workVolume: model.workVolume || '', // Volumen de aplicación
        workArea: model.workArea || '', // Superficie
        capacity: model.capacity || '' // Capacidad carga
    });

    const [products, setProducts] = useState(model.products || []);

    useEffect( () => {
        if(model.productType === "fertilizante"){
            const temp = [{
                key: generateId(),
                name: 'Fertilizante',
                dose: model.workVolume, // Dosis
                presentation: 4 // L/Ha
            }];
            model.update("products", temp);
            setProducts(temp);
        }
    }, []);

    const addProduct = () => {
        const temp = [...products];
        temp.push({
            key: generateId(),
            name: '',
            dose: '',
            presentation: 0 // 0: ml/ha, 1: gr/ha, 2: ml/100L, 3: gr/100L
        });
        model.update("products", temp);        
        setProducts(temp);
    };

    const removeProduct = index => {
        const temp = [...products];
        temp.splice(index, 1);
        model.products = temp;
        model.update("products", temp);
        setProducts(temp);
    };

    const setMainParams = (attr, value) => {
        model.update(attr, value);
        if(attr === "gpsEnabled"){
            if(value){
                getPosition().then( coords => {
                    setInputs(prevState => ({ ...prevState, lotCoordinates: coords }));
                });
            }
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
        const params = {
            A: workArea, 
            T: capacity,
            Va: workVolume,
            products
        };
        try{
            const res = API.computeSuppliesList(params);
            model.update({
                supplies: res,
                lotCoordinates: gpsEnabled ? lotCoordinates : null
            });
            props.f7router.navigate("/suppliesList/");
        }catch(err){
            Toast("error", err.message, 3000, "bottom");
        }
    };

    return (
        <Page>            
            <Navbar style={{maxHeight:"40px", marginBottom:"0px"}}>
                <NavbarTitle {...props} title={"Calculador de mezclas"} />
            </Navbar>   
            <BlockTitle 
                style={{marginBottom:"0px", marginTop: "0px"}}
                className="help-target-supplies-form">
                    <Typography variant="subtitle">Datos del lote</Typography>                    
            </BlockTitle>
            <List form noHairlinesMd style={{marginBottom:"10px"}}>    
                <Input
                    slot="list"
                    label="Lote"
                    name="lotName"
                    type="text"
                    icon={iconName}
                    value={lotName}
                    onChange={v=>setMainParams('lotName', v.target.value)}>
                </Input>
                <Input
                    className="help-target-supplies-form"
                    slot="list"
                    label="Superficie"
                    name="workArea"
                    type="number"
                    unit="ha"
                    icon={iconArea}
                    value={workArea}
                    onChange={v=>setMainParams('workArea', parseFloat(v.target.value))}>
                </Input>
                <div 
                    slot="list" 
                    style={{paddingLeft: 30, paddingBottom: 10}}
                    className="help-target-supplies-gps">
                    <Checkbox
                        checked={gpsEnabled}
                        onChange={v=>setMainParams('gpsEnabled', v.target.checked)}/>
                    <span style={{paddingLeft: 10, color: gpsEnabled ? "#000000" : "#999999", fontSize: "0.8em"}}>Geoposición [{lotCoordinates[0]?.toFixed(4) || '?'}, {lotCoordinates[1]?.toFixed(4) || '?'}] </span>
                </div>
            </List>

            <BlockTitle className="help-target-supplies-capacity" style={{marginBottom:"0px", marginTop: "0px"}}>
                <Typography variant="subtitle">Datos de aplicación</Typography>
            </BlockTitle>
            <List form noHairlinesMd style={{marginBottom:"10px"}}>
                <Input
                    className="help-target-load-number"
                    slot="list"
                    label="Volumen de aplicación"
                    name="capacity"
                    type="number"
                    unit="l/ha"
                    icon={iconVolume}
                    value={workVolume}
                    onChange={v=>setMainParams('workVolume', parseFloat(v.target.value))}
                    ></Input>
                <Input
                    className="help-target-load-number"
                    slot="list"
                    label="Capacidad de carga"
                    name="capacity"
                    type="number"
                    unit="l"
                    icon={iconCapacity}
                    value={capacity}
                    onChange={v=>setMainParams('capacity', parseFloat(v.target.value))}
                    ></Input>
                <div 
                    slot="list" 
                    style={{paddingLeft: 30, paddingBottom: 10}}
                    className="help-target-supplies-balancing">
                    <Checkbox
                        checked={loadBalancingEnabled}
                        onChange={v=>setMainParams('loadBalancingEnabled', v.target.checked)}/>
                    <span style={{paddingLeft: 10, color: loadBalancingEnabled ? "#000000" : "#999999", fontSize: "0.8em"}}>Balancear cargas</span>
                </div>
            </List>
            <Block style={{marginTop: "0px", marginBottom: "0px"}}>
                <BlockTitle 
                    className="help-target-supplies-add" 
                    style={{marginBottom:"0px", marginTop: "0px"}}>
                        {model.productType === "fitosanitarios" ?
                            <Typography variant="subtitle">Lista de insumos</Typography>
                            :
                            <Typography variant="subtitle">Insumos</Typography>
                        }
                </BlockTitle>
                {
                    products.map((p, index) =>(
                        <Card key={p.key} style={{margin:"0px 0px 10px 0px"}}>
                            {model.productType === "fitosanitarios" && 
                                <DeleteButton onClick={()=>removeProduct(index)}/>
                            }
                            <CardContent style={{paddingTop:model.productType === "fitosanitarios" ? 0 : 10}}>
                                <span style={{color:"gray"}}>
                                    {model.productType === "fitosanitarios" ? (
                                        <>Producto {index+1}</>
                                    ) : (
                                        <>Fertilizante</>
                                    )}
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
                                        className="help-target-add-products"
                                        slot="list"
                                        label="Dosis"
                                        type="number"
                                        unit={API.presentationUnits[p.presentation]}
                                        icon={iconDose}
                                        value={p.dose || ''}
                                        onInputClear={()=>setProductParams(index, "dose", "")}
                                        onChange={v=>setProductParams(index, "dose", parseFloat(v.target.value))}>
                                    </Input>
                                </List>
                                {model.productType === "fitosanitarios" && (
                                    <PresentationSelector value={p.presentation} onChange={v=>{setProductParams(index, "presentation", v)}}/>
                                )}
                            </CardContent>                    
                        </Card>
                    ))
                }
                {
                    products.length > 0 || model.productType === "fertilizante" ? 
                        null
                    :                        
                        <div style={{textAlign: "center", color:"rgb(150,150,150)"}}>
                            <p>Agregue productos a la lista presionando en "+"</p>
                        </div>
                }
            </Block>
            {model.productType === "fitosanitarios" && 
                <Block style={{margin:0}}>
                    <AddButton onClick={()=>addProduct()}/>
                </Block>
            }   
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