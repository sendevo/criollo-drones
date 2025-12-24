import { Menu, MenuDropdown, MenuDropdownItem, MenuItem } from 'framework7-react';
import nozzles from '../../data/nozzles';
import nozzleIcons from './nozzleIcons';
import classes from './style.module.css';

const SelectedOption = props => (
    props.selection ? 
    <div className={classes.SelectedOptionContainer}>
        {props.selection.img && <img className={classes.SelectedOptionIcon} src={nozzleIcons[props.selection.img]} alt={"icon"} />}
        <span className={classes.SelectedOptionText} >{props.selection.name} </span>
    </div> 
    : 
    "Elegir..."
);

const NozzleMenu = ({selection, onOptionSelected}) => { 

    const level1 = selection[0] > -1 ? nozzles[selection[0]]?.childs : [];
    const level2 = selection[1] > -1 && nozzles[selection[0]]?.childs[selection[1]]?.childs ? nozzles[selection[0]]?.childs[selection[1]]?.childs : [];
    const level3 = selection[2] > -1 && nozzles[selection[0]]?.childs[selection[1]]?.childs[selection[2]]?.childs ? nozzles[selection[0]].childs[selection[1]]?.childs[selection[2]]?.childs : [];

    const handleClick = (lvl, idx) => {
        switch(lvl){
            case 0:
                onOptionSelected([idx, -1, -1, -1]);
                break;
            case 1:
                onOptionSelected([selection[0], idx, -1, -1], nozzles[selection[0]]?.childs[idx].childs ? null : nozzles[selection[0]]?.childs[idx]);
                break;
            case 2: 
                onOptionSelected([selection[0], selection[1], idx, -1], nozzles[selection[0]]?.childs[selection[1]]?.childs[idx]?.childs ? null : nozzles[selection[0]]?.childs[selection[1]]?.childs[idx]);
                break;
            case 3:
                onOptionSelected([selection[0], selection[1], selection[2], idx], nozzles[selection[0]]?.childs[selection[1]]?.childs[selection[2]]?.childs[idx]);
                break;
            default:
                break;
        }
    };

    return (
        <div className={classes.MenuContainer}>
            <Menu>
                <MenuItem className={classes.MenuItem} text={<SelectedOption selection={nozzles[selection[0]]} />} dropdown>
                    <MenuDropdown left>
                        {
                            nozzles.map((op, idx) => (
                                <MenuDropdownItem 
                                    key={idx} 
                                    text={op.name} 
                                    onClick={()=>handleClick(0, idx)}>
                                    {op.img && <img src={nozzleIcons[op.img]} alt="icon" height="25px"/>}
                                </MenuDropdownItem>
                            ))
                        }
                    </MenuDropdown>
                </MenuItem>
                {
                    level1.length > 0 && 
                    <MenuItem className={classes.MenuItem} text={<SelectedOption selection={level1[selection[1]]} />} dropdown>
                        <MenuDropdown center contentHeight="200px">
                            {
                                level1.map((op, idx) => (
                                    <MenuDropdownItem 
                                        key={idx} 
                                        text={op.name} 
                                        onClick={()=>handleClick(1, idx)}>
                                        {op.img && <img src={nozzleIcons[op.img]} alt="icon" height="25px"/>}
                                    </MenuDropdownItem>
                                ))
                            }
                        </MenuDropdown>
                    </MenuItem>
                }
                {
                    level2.length > 0 && 
                    <MenuItem className={classes.MenuItem} text={<SelectedOption selection={level2[selection[2]]} />} dropdown>
                        <MenuDropdown center contentHeight="200px">                        
                            {
                                level2.map((op, idx) => (
                                    <MenuDropdownItem 
                                        key={idx} 
                                        text={op.name} 
                                        onClick={()=>handleClick(2, idx)}>
                                        {op.img && <img src={nozzleIcons[op.img]} alt="icon" height="25px"/>}
                                    </MenuDropdownItem>
                                ))
                            }
                        </MenuDropdown>
                    </MenuItem>
                }
                {
                    level3.length > 0 && 
                    <MenuItem className={classes.MenuItem} text={<SelectedOption selection={level3[selection[3]]} />} dropdown>
                        <MenuDropdown right contentHeight="200px">                        
                            {
                                level3.map((op, idx) => (
                                    <MenuDropdownItem 
                                        key={idx} 
                                        text={op.name} 
                                        onClick={()=>handleClick(3, idx)}>
                                        {op.img && <img src={nozzleIcons[op.img]} alt="icon" height="25px"/>}
                                    </MenuDropdownItem>
                                ))
                            }
                        </MenuDropdown>
                    </MenuItem>
                }            
            </Menu>
        </div>
    );
};

export default NozzleMenu;