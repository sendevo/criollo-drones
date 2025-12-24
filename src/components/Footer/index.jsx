import React from 'react';
import logoInta from '../../assets/anclaje_logo_inta.png';
import logoMin from '../../assets/anclaje_logo_ministerio.png';
import logoSec from '../../assets/anclaje_logo_secretaria.png';
import classes from './styles.module.css';

const Footer = () => (
    <div className={classes.Footer}>
        <img src={logoInta} className={classes.Logo} alt="inta"/>
        <img src={logoMin} className={classes.Logo} alt="ministerio"/>
        <img src={logoSec} className={classes.Logo} alt="secretaria"/>
    </div>            
);

export default Footer;