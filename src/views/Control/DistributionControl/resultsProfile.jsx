import { Block, BlockTitle } from 'framework7-react';
import { tableStyle, fieldCellStyle, dataCellStyle } from '../styles.js';
import { PRODUCT_TYPES } from '../../../entities/Model/index.js';


const ResultsProfile = ({seedMode, inputs, outputs, productType}) => {
    
    const {avgDist, cvDist} = inputs;
    const {expected_dose, effective_dose, adjusted_dose} = outputs;

    const diffp_c = expected_dose > 0 ? ((effective_dose - expected_dose)/expected_dose*100).toFixed(2) : '';

    return(
        <Block style={{margin: "25px 0px 25px 0px"}}>
            <BlockTitle style={{marginBottom: "10px"}}>{seedMode ? "Perfil de siembra" : "Perfil de fertilización"}</BlockTitle>
            <table style={tableStyle}>
                <tbody>
                    {Boolean(effective_dose) &&
                        <tr>
                            <td style={fieldCellStyle}><b>Dosis efectiva:</b></td>
                            <td style={dataCellStyle} data-testid="distribution-effective-dose-output">
                                {effective_dose.toFixed(2) || ''} {productType === PRODUCT_TYPES.LIQUID ? "l/ha" : "kg/ha"} ({diffp_c} %)
                            </td>
                        </tr>
                    }
                    {Boolean(adjusted_dose) &&
                        <tr>
                            <td style={fieldCellStyle}><b>Dosis ajustada:</b></td>
                            <td style={dataCellStyle} data-testid="distribution-adjusted-dose-output">
                                {adjusted_dose.toFixed(2) || ''} {productType === PRODUCT_TYPES.LIQUID ? "l/ha" : "kg/ha"}
                            </td>
                        </tr>
                    }
                    {Boolean(avgDist) &&
                        <tr>
                            <td style={fieldCellStyle}><b>Promedio:</b></td>
                            <td style={dataCellStyle} data-testid="distribution-average-output">
                                {avgDist?.toFixed(2) || ''} {productType === PRODUCT_TYPES.LIQUID ? "gotas/cm²" : "gr"}
                            </td>
                        </tr>               
                    }
                    {Boolean(cvDist) &&
                        <tr>
                            <td style={fieldCellStyle}><b>Coeficiente de variación:</b></td>
                            <td style={dataCellStyle} data-testid="distribution-cv-output">
                                {cvDist?.toFixed(2) || ''} %
                            </td>
                        </tr>
                    }
                </tbody>
            </table>
        </Block>
    );
};

export default ResultsProfile;