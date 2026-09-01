import { useState, useRef, useEffect } from "react";
import { ListInput } from "framework7-react";
import { 
    formatNumericValue, 
    parseNumericValue,
    parseNonNegativeNumber,
    sanitizeTypedValue
} from '../../utils';
import classes from './style.module.css'

const Input = props => {
    const isNumericInput = props.type === 'number' || props.inputMode === 'decimal' || props.inputMode === 'numeric';
 
    const [text, setText] = useState(() =>
        isNumericInput ? formatNumericValue(props.value) : `${props.value ?? ''}`
    );
    const isFocused = useRef(false);
 
    // Sync from props.value, but don't fight the user mid-keystroke.
    useEffect(() => {
        if (isFocused.current) return;
        setText(isNumericInput ? formatNumericValue(props.value) : `${props.value ?? ''}`);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.value, isNumericInput]);
 
    const handleChange = event => {
        const originalValue = event?.target?.value ?? '';
 
        if (!isNumericInput) {
            setText(originalValue);
            props.onChange?.(event);
            return;
        }
 
        // A single "." typed as a keystroke (e.g. from an en-locale numeric
        // keypad) means the user wants a decimal separator, not grouping —
        // grouping dots are only ever inserted programmatically, never typed.
        // Pasted text ("1.000,03") is left untouched, since there dots really
        // do mean thousands-grouping.
        const isSingleTypedDot =
            event?.nativeEvent?.inputType === 'insertText' &&
            event?.nativeEvent?.data === '.';
 
        const valueForSanitizing = isSingleTypedDot
            ? originalValue.replace(/\.(?!.*\.)/, ',') // swap the just-typed dot for a comma
            : originalValue;
 
        const sanitizedText = sanitizeTypedValue(valueForSanitizing);
        setText(sanitizedText);
 
        const parsedNumber = parseNonNegativeNumber(sanitizedText);
 
        props.onChange?.({
            ...event,
            target: { ...event.target, value: parsedNumber }
        });
    };
 
    const handleFocus = event => {
        isFocused.current = true;
        props.onFocus?.(event);
    };
 
    const handleBlur = event => {
        isFocused.current = false;
        setText(isNumericInput ? formatNumericValue(props.value) : `${props.value ?? ''}`);
        props.onBlur?.(event);
    };
 
    const newProps = {
        ...props,
        type: isNumericInput ? 'text' : props.type,
        inputmode: isNumericInput ? 'decimal' : props.inputMode, // note: lowercase key — framework7-react's ListInput only recognizes "inputmode", not camelCase "inputMode"
        min: props.min ?? 0,
        value: text,
        onChange: handleChange,
        onFocus: handleFocus,
        onBlur: handleBlur,
    };
 
    return (
        <div className={classes.Container} style={props.style}>
            <ListInput
                className={classes.Input}
                outline
                floatingLabel
                inputStyle={{ boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.2)" }}
                {...newProps}>
                {props.icon ? (
                    <img
                        className={classes.InputIcon}
                        style={props.borderColor ? {
                            border: "3px solid " + props.borderColor,
                            borderRadius: "10px",
                            marginLeft: -5
                        } : {}}
                        src={props.icon}
                        onClick={props.onIconClick}
                        slot="media" alt="icon"
                    />
                ) : null}
            </ListInput>
            {props.unit ? <span className={classes.UnitLabel}>{props.unit}</span> : null}
        </div>
    );
};
 
export default Input;