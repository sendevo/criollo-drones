import {  
    Button,
    Col,
    Row
} from 'framework7-react';
import TrayTable from '../../../components/TrayTable/index.jsx';
import Chart from '../../../components/Chart/index.jsx';
import ResultsProfile from './resultsProfile.jsx';
import { PRODUCT_TYPES } from '../../../entities/Model/index.js';

const DistributionControl = props => {

    const {
        productType,
        inputs,
        outputs,
        chartData,
        handleTrayAddCollected,
        handleComputeProfile,
        handleClearDistrForm
    } = props;

    return (
        <div>
            <TrayTable 
                productType={productType}
                trayData={inputs.trayData || inputs.cardData || []} 
                onAddCollected={handleTrayAddCollected}/>

            {inputs.profileComputed &&
                <ResultsProfile 
                    productType={productType}
                    inputs={inputs}
                    outputs={outputs}/>
            }

            <Chart 
                title="Distribución medida"
                data={chartData} 
                tooltipSuffix={productType === PRODUCT_TYPES.LIQUID ? " gotas/cm²" : " kg/ha"}/>

            <Row style={{marginBottom:"15px", marginTop:"20px"}}>
                <Col width={20}></Col>
                <Col width={60}>
                    <Button 
                        fill 
                        onClick={handleComputeProfile}
                        style={{textTransform:"none"}}>
                            Calcular perfil
                    </Button>
                </Col>
                <Col width={20}></Col>
            </Row>

            <Row style={{marginBottom:"15px"}}>
                <Col width={20}></Col>
                <Col width={60}>
                    <Button 
                        fill 
                        onClick={handleClearDistrForm}
                        style={{textTransform:"none", backgroundColor:"red"}}>
                            Borrar formulario
                    </Button>
                </Col>
                <Col width={20}></Col>
            </Row>
        </div>
    );
};

export default DistributionControl;