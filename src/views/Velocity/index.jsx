import { Page, Navbar, Block, List, Row, Col, Button } from "framework7-react";
import Input from "../../components/Input";
import { NavbarTitle, BackButton } from "../../components/Buttons";
import DistanceIcon from "../../assets/icons/distancia.png";
import moment from 'moment';
import Timer from '../../entities/Timer';
import Toast from "../../components/Toast";
import { useContext, useState } from "react";
import { FaPlus, FaMinus } from 'react-icons/fa';
import { ModelCtx } from "../../context";
import { set2Decimals } from "../../utils";
import { PlayButton } from "../../components/Buttons";
import classes from './style.module.css';

const InputBlock = props => ( // Input de distancia
    <List form noHairlinesMd className={classes.Form}>
        <Row slot="list">
            <Col width={20}></Col>
            <Col width={60}>
                <Input
                    value={props.distance || ''}
                    label="Dist. recorrida"
                    type="number"
                    unit="m"
                    onChange={props.onChange}
                ></Input>
            </Col>
            <Col width={20}></Col>
        </Row>
    </List>
);

const RecordsTable = props => ( // Tabla de resultados parciales
    <table className={`data-table ${classes.Table}`}>
        <thead>
            <tr>
                <th>#</th>
                <th>Tiempo</th>
                <th>Velocidad</th>
            </tr>
        </thead>
        <tbody>
        {
            props.data.map((d, idx) => (
                <tr key={idx}>
                    <td>{idx+1}</td>
                    <td>{d.time/1000} seg.</td>
                    <td>{d.vel.toFixed(2)} km/h</td>
                </tr>
            ))
        }
        </tbody>
    </table>
);

const OutputBlock = props => ( // Bloque con resultado final a exportar
    <List form noHairlinesMd style={{marginTop:"0px"}}>
        <Row slot="list">
            <Col width={10}></Col>
            <Col width={80}>
                <Input
                    readOnly
                    value={props.output}
                    label="Vel. promedio"
                    type="number"
                    unit="km/h"
                    clearButton={false}
                ></Input>
            </Col>
            <Col width={10}></Col>
        </Row>
    </List>
);

const timer = new Timer(0, false);

const Velocity = props => { // View
    
    const model = useContext(ModelCtx);
    const [time, setTime] = useState(0);
    const [running, setRunning] = useState(false);
    const [distance, setDistance] = useState(50);
    const [data, setData] = useState([]);
    const [pushEnabled, setPushEnabled] = useState(false);

    const toggleRunning = () => {
        if(!running){
            timer.onChange = setTime;
            timer.clear();
            timer.start();
        }else{
            timer.stop();
        }
        setRunning(!running);
        setPushEnabled(running);
    };

    const getTime = () => {
        // unix to min:seg:ms
        return moment(time).format('mm:ss:S');
    };

    const updateDistance = d => {
        if(d > 0){
            setDistance(d);
            setData(data.map(v => ({
                time: v.time, 
                vel: d/v.time*3600
            })));
        }else
            Toast("error", "Ingrese un valor de distancia mayor que 0 m", 2000, "center");
    };

    const pushData = () => { // Agregar dato medido
        if(data.length < 3 && time > 0){
            const temp = [...data];
            temp.push({
                time: time,
                vel: distance/time*3600
            });        
            setData(temp);
            setPushEnabled(false);
        }
    };

    const popData = () => { // Quitar último dato medido
        if(data.length > 0){
            const temp = [...data];
            temp.pop();
            setData(temp);
            setPushEnabled(true);
        }
    };

    const dataAvg = () => data.length > 0 ? data.reduce((r, a) => a.vel + r, 0)/data.length : 0;

    const exportData = () => { 
        const vel = set2Decimals(dataAvg());
        model.update({
            workVelocity: vel,
            velocityMeasured: true
        });
        props.f7router.back();        
    };

    return (
        <Page>
            <Navbar style={{maxHeight:"40px", marginBottom:"0px"}}>
                <NavbarTitle {...props} title="Cronómetro"/>
            </Navbar>
            <Block>
                <img src={DistanceIcon} className={classes.Icon} alt="distance" />
                <InputBlock onChange={v=>updateDistance(parseInt(v.target.value))} distance={distance}/>
            </Block>
            <Block style={{marginTop:"60px", textAlign:"center"}}>
                <p style={{fontSize:"50px", margin:"0px"}}>{getTime()}</p>
                <PlayButton onClick={toggleRunning} running={running} />
            </Block>
            {time > 0 &&
                <Block style={{marginBottom: "0px",textAlign:"center"}}>
                    <Row style={{alignItems:"center"}}>
                        <Col width={20}>
                            <Row>
                                <Button disabled={!pushEnabled} onClick={pushData}>
                                    <FaPlus  color="green" size={30}/>
                                </Button>
                            </Row>
                            <Row>
                                <Button disabled={running || data.length===0} onClick={popData}>
                                    <FaMinus color="red" size={30}/>
                                </Button>
                            </Row>
                        </Col>
                        <Col width={80}>
                            <RecordsTable data={data} />
                        </Col>
                    </Row>
                </Block>
            }

            <Block style={{marginTop:"0px",textAlign:"center"}}>
                <OutputBlock output={dataAvg().toFixed(2)}/>
            </Block>

            <Block style={{textAlign:"center", marginBottom: 15}}>
                <Row>
                    <Col width={20}></Col>
                    <Col width={60}><Button disabled={data.length===0} fill onClick={exportData}>Exportar</Button></Col>
                    <Col width={20}></Col>
                </Row>
            </Block>
            <BackButton {...props} />
        </Page>
    );
};

export default Velocity;