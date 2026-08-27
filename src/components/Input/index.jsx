import { ListInput } from "framework7-react";
import { formatNumericValue, parseNonNegativeNumber } from '../../utils';
import classes from './style.module.css'

const Input = props => {
    const isNumericInput = props.type === 'number' || props.inputMode === 'decimal' || props.inputMode === 'numeric';

    const handleChange = event => {
        if (!isNumericInput) {
            props.onChange?.(event);
            return;
        }

        const originalValue = event?.target?.value ?? '';
        const sanitizedValue = parseNonNegativeNumber(originalValue);

        const nextEvent = {
            ...event,
            target: {
                ...event.target,
                value: sanitizedValue
            }
        };

        props.onChange?.(nextEvent);
    };

    const numericValue = isNumericInput ? formatNumericValue(props.value) : `${props.value ?? ''}`;

    const newProps = {
        ...props,
        type: isNumericInput ? 'text' : props.type,
        inputMode: isNumericInput ? 'decimal' : props.inputMode,
        min: props.min ?? 0,
        value: numericValue,
        onChange: handleChange,
    };

    return (
        <div className={classes.Container} style={props.style}>
            <ListInput
                className={classes.Input}
                outline
                floatingLabel
                inputStyle={{boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.2)"}}
                {...newProps}>
                {
                props.icon ?
                    <img className={classes.InputIcon} 
                        style={props.borderColor ? {
                            border: "3px solid "+props.borderColor, 
                            borderRadius: "10px", 
                            marginLeft: -5                        
                        } : {}}
                        src={props.icon} 
                        onClick={props.onIconClick}
                        slot="media" alt="icon"/>
                :
                    null
                }   
            </ListInput>
            {props.unit ? <span className={classes.UnitLabel}>{props.unit}</span> : null}
        </div>
    );
}

export default Input;