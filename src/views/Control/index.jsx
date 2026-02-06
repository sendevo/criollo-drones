import { Navbar, Page } from 'framework7-react';
import { useContext, useState, useEffect} from 'react';
import { NavbarTitle, BackButton } from '../../components/Buttons';
import { ModelCtx } from '../../context';
import { PRODUCT_TYPES } from '../../entities/Model';
import LiquidControl from './LiquidControl';
import SolidControl from './SolidControl';


const Control = props => {

    const model = useContext(ModelCtx);

    const [inputs, setInputs] = useState({
        productType: model.productType,
        recolected: model.recolected || '',
        recolectedTime: model.recolectedTime || ''
    });

    useEffect(() => { // Actualizar input de peso recolectado por si se mide con cronometro
        setInputs({
            ...inputs,
            recolected: model.recolected || ''
        });
    }, [model.recolected]);

    useEffect(() => { // Actualizar input de peso recolectado por si se mide con cronometro
        setInputs({
            ...inputs,
            recolectedTime: model.recolectedTime || ''
        });
    }, [model.recolectedTime]);

    
    return (
        <Page>            
            <Navbar style={{maxHeight:"40px", marginBottom:"0px"}}>
                <NavbarTitle {...props} title="Verificación de prestación"/>
            </Navbar>

            { inputs.productType === PRODUCT_TYPES.LIQUID ? 
                <LiquidControl {...props} /> 
                : 
                <SolidControl {...props} /> 
            }

            <BackButton {...props} />
        </Page>
    );
};

export default Control;