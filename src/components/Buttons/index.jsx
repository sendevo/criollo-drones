import { Link, Block } from 'framework7-react';
import { 
    FaPlay, 
    FaStop, 
    FaArrowLeft, 
    FaPlus, 
    FaStopwatch, 
    FaTrash,
    FaCalculator 
} from 'react-icons/fa';
import classes from './style.module.css';
import Typography from '../Typography';

export const BackButton = props => (
    <Block className={classes.BackButtonContainer}>
        <Link tooltip="Volver" 
            onClick={() => props.f7router.back()}
            className={classes.RoundButton} 
            style={props.gray?{color:"black", backgroundColor:"rgba(200,200,200,.8)"}:{}}>
            <FaArrowLeft />
        </Link>
    </Block>   
); 

export const NavbarTitle = props => (
    <Link 
        style={{color:"black", fontSize:"0.9em", padding:"0px 5px"}}
        tooltip="Volver"
        onClick={() => props.f7router.back()}>
        <FaArrowLeft />
        <Typography variant="title" sx={{paddingLeft:"10px"}}>{props.title}</Typography>
    </Link>
);

export const CalculatorButton = props => (
    <Block style={{textAlign: "center", margin:"0px", padding:"0px"}}>
        <Link {...props} className={classes.RoundButton} style={{backgroundColor:props.color}}>
            <FaStopwatch size={20}/>
        </Link>
    </Block>   
);

export const VolumeCalculatorButton = props => (
    <Block style={{textAlign: "center", margin:"0px", padding:"0px"}}>
        <Link {...props} className={classes.RoundButton} style={{backgroundColor:props.color}}>
            <FaCalculator size={20}/>
        </Link>
    </Block>   
);

export const DeleteButton = props => (
    <div style={{textAlign:"right", padding:"5px", height:"5px"}}>
        <Link
            tooltip="Quitar" 
            onClick={props.onClick}>
            <FaTrash size={15} color={"darkred"}/>
        </Link>   
    </div>
);

export const AddButton = props => (
    <Block style={{textAlign: "right", margin:"0px", padding:"0px"}}>
        <Link 
            tooltip="Agregar producto" 
            onClick={props.onClick}
            className={classes.RoundButton}
            style={{backgroundColor:"green", margin:"0px 0px 20px 0px"}}>
            <FaPlus size={20}/>
        </Link>
    </Block>   
);

export const PlayButton = props => ( // Boton de control del cronometro
    <span style={{minHeight:50}} onClick={props.onClick}>
        {
            props.running ? 
                <FaStop color="red" size={40}/>
            :
                <FaPlay color="green" size={40}/>
        }
    </span>
);
