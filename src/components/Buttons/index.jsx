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

export const NAVBAR_STYLE = { minHeight:"40px", marginBottom:"0px", height:"auto" };

export const BackButton = props => (
    <Block className={classes.BackButtonContainer}>
        <Link tooltip="Volver" 
            data-test-id="backbutton"
            name="back"
            onClick={() => props.f7router.back()}
            className={classes.RoundButton} 
            style={props.gray?{color:"black", backgroundColor:"rgba(200,200,200,.8)"}:{}}>
            <FaArrowLeft />
        </Link>
    </Block>   
); 

export const NavbarTitle = props => (
    <Link 
        style={{
            color:"black",
            fontSize:"0.9em",
            padding:"4px 5px",
            display:"flex",
            alignItems:"center",
            width:"100%",
            minHeight:"40px",
            whiteSpace:"normal"
        }}
        tooltip="Volver"
        onClick={() => props.f7router.back()}>
        <span style={{flexShrink:0}}>
            <FaArrowLeft />
        </span>
        <Typography variant="title" sx={{paddingLeft:"10px", lineHeight:"1.1", whiteSpace:"normal"}}>{props.title}</Typography>
    </Link>
);

export const ActionButton = ({
    icon: Icon,
    children,
    tooltip,
    onClick,
    color = "rgba(10, 10, 250, .7)",
    size = 20,
    iconColor,
    round = true,
    align = "center",
    containerStyle,
    buttonStyle,
    className,
    variant = "link",
    ...props
}) => {
    const testId = props["data-testid"];
    const content = children ?? (Icon ? <Icon size={size} color={iconColor} /> : null);
    const buttonClassName = round ? [classes.RoundButton, className].filter(Boolean).join(" ") : className;

    if (variant === "span") {
        return (
            <span
                {...props}
                role="button"
                tabIndex={0}
                onClick={onClick}
                onKeyDown={event => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onClick?.(event);
                    }
                }}
                style={{
                    minHeight: 50,
                    display: "inline-block",
                    cursor: "pointer",
                    ...containerStyle
                }}>
                {content}
            </span>
        );
    }

    return (
        <Block style={{ textAlign: align, margin: "0px", padding: "0px", ...containerStyle }}>
            <Link
                {...props}
                tooltip={tooltip}
                data-testid={testId}
                onClick={onClick}
                className={buttonClassName}
                style={{
                    backgroundColor: round ? color : "transparent",
                    color: round ? "white" : iconColor || color,
                    width: round ? undefined : "auto",
                    height: round ? undefined : "auto",
                    padding: round ? undefined : "0px",
                    ...buttonStyle
                }}>
                {content}
            </Link>
        </Block>
    );
};

export const CalculatorButton = props => (
    <ActionButton icon={FaCalculator} {...props} />
);

export const TimerButton = props => (
    <ActionButton icon={FaStopwatch} {...props} />
);

export const DeleteButton = props => (
    <ActionButton
        {...props}
        icon={FaTrash}
        round={false}
        align="right"
        tooltip="Quitar"
        iconColor="darkred"
        size={15}
        containerStyle={{ textAlign: "right", padding: "5px", height: "5px" }}
        buttonStyle={{ color: "darkred", width: "auto", height: "auto", padding: "0px" }}
    />
);

export const AddButton = props => (
    <ActionButton
        {...props}
        icon={FaPlus}
        color="green"
        tooltip="Agregar producto"
        data-testid="add-product-btn"
        buttonStyle={{ margin: "0px 0px 20px 0px" }}
    />
);

export const PlayButton = ({ running, ...props }) => (
    <ActionButton
        {...props}
        variant="span"
        icon={running ? FaStop : FaPlay}
        iconColor={running ? "red" : "green"}
        size={40}
        containerStyle={{ minHeight: 50 }}
        buttonStyle={{ color: running ? "red" : "green" }}
    />
);
