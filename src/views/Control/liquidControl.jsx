import React, { useContext } from 'react';
import { ModelCtx } from '../../context';
import Typography from '../../components/Typography';


const LiquidControl = props => {

    const model = useContext(ModelCtx);

    return (
        <div style={{padding:"20px"}}>
            <Typography sx={{marginBottom:"10px", fontSize: "18px"}}>Control de prestación - Líquidos</Typography>
        </div>
    );
};

export default LiquidControl;