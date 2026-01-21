import { 
    Navbar, 
    Page, 
} from 'framework7-react';
import { useContext, useEffect, useState } from 'react';
import { NavbarTitle, BackButton } from '../../components/Buttons';
import { ProductTypeSelector } from '../../components/Selectors';
import Toast from '../../components/Toast';
import Typography from '../../components/Typography';
import { ModelCtx } from '../../context';

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
        productType: model.productType
    });

    const handleProductTypeChange = (value) => {
        if(value === "solido" || value === "liquido") {
            const prevInputs = { ...inputs, productType: value };
            model.update({ productType: value });
            setInputs({
                ...prevInputs,
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