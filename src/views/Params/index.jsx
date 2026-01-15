import { 
    f7, 
    Navbar, 
    Page, 
    List,
    BlockTitle, 
    Row, 
    Col, 
    Button 
} from 'framework7-react';
import { useContext, useEffect, useState } from 'react';
import { NavbarTitle, CalculatorButton, VolumeCalculatorButton, BackButton } from '../../components/Buttons';
import { NozzleSeparationSelector, ProductTypeSelector } from '../../components/Selectors';
import Input from "../../components/Input";
import NozzleMenu from "../../components/NozzleMenu";
import Toast from '../../components/Toast';
import Typography from '../../components/Typography';
import DropletSizeSlider from '../../components/DropletSizeSlider';
import Divider from '../../components/Divider';
import { ModelCtx, WalkthroughCtx } from '../../context';
import {
    computeQa,
    computeQb,
    computeQt,
    computeQNom,
    computeVt,
    computePt,
    computeVa,
    dropletSizeProperties,
    getDropletSizeName
} from '../../entities/API';
import iconDistance from '../../assets/icons/dpicos.png';
import iconNozzles from '../../assets/icons/cant_picos2.png';
import iconVelocity from '../../assets/icons/velocidad.png';
import iconPressure from '../../assets/icons/presion.png';
import iconDensity from '../../assets/icons/densidad.png';
import iconVolume from '../../assets/icons/dosis.png';

const getInputBorderColor = (updated, productType) => {
    if(productType === "fitosanitarios") {
        return updated ? "green" : "#F2D118";
    }else {
        return updated ? "#007bff" : "orange";
    }
};

const Params = props => {

    const model = useContext(ModelCtx);

    const [inputs, setInputs] = useState({
        nozzleSeparation: model.nozzleSeparation || 0.35,
        nozzleNumber: model.nozzleNumber || '',        
        nominalFlow: model.nominalFlow || 0.8,        
        nominalPressure: model.nominalPressure || 3,
        productDensity: 1,
        workVelocity: model.workVelocity || 20,
        workVelocityUpdated: false,
        workPressure: model.workPressure || 2,
        workPressureUpdated: false,
        workVolume: model.workVolume || 56,
        workVolumeUpdated: false,
        productType: model.productType
    });

    const handleProductTypeChange = (value) => {
        if(value === "fitosanitarios" || value === "fertilizante") {
            model.update({
                productType: value,
            });
            setInputs({
                ...inputs,
                productType: value
            });
        }else{
            Toast("error", "Tipo de producto inválido");
        }
    };

    return (
        <Page>            
            <Navbar style={{maxHeight:"40px", marginBottom:"0px"}}>
                <NavbarTitle {...props} title="Parámetros de aplicación"/>
            </Navbar>

            <ProductTypeSelector value={inputs.productType} onChange={handleProductTypeChange}/>

            

            <BackButton {...props} />
        </Page>
    );
};

export default Params;