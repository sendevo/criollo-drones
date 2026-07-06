import {  
    Button,
    Col,
    Row
} from 'framework7-react';
import TrayTable from '../../../components/TrayTable/index.jsx';
import Chart from '../../../components/Chart/index.jsx';
import { PatternSelector } from '../../../components/Selectors';
import ResultsProfile from './resultsProfile.jsx';
import { PRODUCT_TYPES } from '../../../entities/Model/index.js';
import WorkWidthPicker from './workWidthPicker.jsx';

const DistributionControl = props => {

    const {
        productType,
        inputs,
        outputs,
        chartData,
        handleTrayAddCollected,
        handleComputeProfile,
        handleClearDistrForm,
        workWidthOptions = [],
        selectedWorkPattern,
        onPatternChange,
        onWorkWidthChange
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
                dataTestId="distribution-chart"
                tooltipSuffix={productType === PRODUCT_TYPES.LIQUID ? " gotas/cm²" : " kg/ha"}/>

            {inputs.profileComputed && workWidthOptions.length > 0 &&
                <PatternSelector
                    pattern={selectedWorkPattern}
                    onChange={onPatternChange}/>
            }

            {inputs.profileComputed && workWidthOptions.length > 0 &&
                <WorkWidthPicker
                    options={workWidthOptions}
                    value={inputs.workWidth}
                    onChange={onWorkWidthChange}/>
            }

            <Row style={{marginBottom:"15px", marginTop:"20px"}}>
                <Col width={20}></Col>
                <Col width={60}>
                    <Button 
                        fill 
                        onClick={handleComputeProfile}
                        style={{textTransform:"none"}}
                        data-testid="compute-profile-btn">
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
                        style={{textTransform:"none", backgroundColor:"red"}}
                        data-testid="clear-distribution-form-btn">
                            Borrar formulario
                    </Button>
                </Col>
                <Col width={20}></Col>
            </Row>
        </div>
    );
};

export default DistributionControl;