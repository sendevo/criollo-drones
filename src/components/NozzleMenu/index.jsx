import { Menu, MenuDropdown, MenuDropdownItem, MenuItem } from 'framework7-react';
import Divider from '../../components/Divider';
import { getLastNonEmptyRowIndex } from '../../utils';
import nozzles from '../../data/nozzles_droplet_sizes.json';
import nozzleIcons from './nozzleIcons';
import classes from './style.module.css';

const SelectedOption = props => (
    props.selection ? 
        <div className={classes.SelectedOptionContainer}>
            {props.selection.img && 
                <img className={classes.SelectedOptionIcon} src={nozzleIcons[props.selection.img]} alt={"icon"} />}
            <span className={classes.SelectedOptionText}>{props.selection.name}</span>
        </div> 
    : 
    <span className={classes.SelectedOptionText}>
        Elegir...
    </span>  
);


const dividerStyle = {
    marginTop:0, 
    marginBottom:0, 
    backgroundColor: "#aaa", 
    padding: "0px"
};

const NozzleMenu = ({productType, selection, onOptionSelected}) => { 

    const getChild = path => path.reduce((acc, idx) => {
            if (!acc || !Array.isArray(acc.childs) || idx < 0) return null;
            return acc.childs[idx];
        }, { childs: nozzles });

    const hideNozzleTypes = productType === "fertilizante";

    // Filtrar picos de calculo de tamaño de gota
    const filterNozzleTypes = level => hideNozzleTypes ? level.filter(nozzle => !Array.isArray(nozzle.droplet_sizes)) : level;

    const nz = [...nozzles];
    if(hideNozzleTypes){
        nz.splice(1);
    }

    const levels = [
            nz,
            filterNozzleTypes(selection[0] > -1 ? getChild([selection[0]])?.childs || [] : []),
            filterNozzleTypes(selection[1] > -1 ? getChild([selection[0], selection[1]])?.childs || [] : []),
            filterNozzleTypes(selection[2] > -1 ? getChild([selection[0], selection[1], selection[2]])?.childs || [] : [])
    ];

    const handleClick = (level, index) => {
        let newSelection = [...selection];
        newSelection[level] = index;

        for (let i = level + 1; i < newSelection.length; i++)
            newSelection[i] = -1;

        onOptionSelected(newSelection);
    };

    return (
        <div className={classes.MenuContainer}>
            <Menu className={classes.Menu}>
                {levels.map((lvl, idx) => {
                    return lvl.length > 0 ? 
                    <MenuItem 
                        key={idx} 
                        className={classes.MenuItem}
                        text={<SelectedOption selection={lvl[selection[idx]]} />} 
                        dropdown>
                            <MenuDropdown 
                                contentHeight='300px'
                                left={idx === 0}
                                center={idx > 0 && idx < levels.length - 1} 
                                right={idx === getLastNonEmptyRowIndex(levels)}>
                                {
                                    lvl.map((op, idx2) => (
                                        <div key={idx2}>
                                            <MenuDropdownItem 
                                                className={op.name.length > 15 ? classes.MenuDropdownItemBW : classes.MenuDropdownItem}
                                                key={idx2} 
                                                onClick={()=>handleClick(idx, idx2)}>
                                                {op.name}
                                                {op.img && <img src={nozzleIcons[op.img]} alt="icon" height="25px"/>}
                                            </MenuDropdownItem>
                                            <Divider sx={dividerStyle} />
                                        </div>
                                    ))
                                }
                            </MenuDropdown>
                        </MenuItem>
                    : 
                    null
                })}
            </Menu>
        </div>
    );
};

export default NozzleMenu;