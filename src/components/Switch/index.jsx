import { Toggle } from "framework7-react";
import classes from "./style.module.css";

const TextSwitch = ({
    active = false,
    activeText = "",
    inactiveText = "",
    onToggle,
    style,
    ...props
}) => {
    const handleToggle = (checked) => {
        onToggle?.(checked);
    };

    return (
        <div className={classes.Container} style={style}>
            {inactiveText && (
                <span className={`${classes.Label} ${!active ? classes.ActiveLabel : ""}`}>
                    {inactiveText}
                </span>
            )}
            <Toggle
                checked={active}
                onToggleChange={handleToggle}
                {...props}
            />
            {activeText && (
                <span className={`${classes.Label} ${active ? classes.ActiveLabel : ""}`}>
                    {activeText}
                </span>
            )}
        </div>
    );
};

export default TextSwitch;