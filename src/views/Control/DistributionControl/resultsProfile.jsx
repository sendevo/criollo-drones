import { Block, BlockTitle } from 'framework7-react';
import { tableStyle, fieldCellStyle, dataCellStyle } from '../styles.js';
import { PRODUCT_TYPES } from '../../../entities/Model/index.js';


const ResultsProfile = ({inputs, outputs, productType}) => {
    
    const {
        workWidth: effective_work_width,
        avgDist: avg,
        cvDist: cv
    } = inputs;
    
    const {
        expected_dose,
        effective_dose,
    } = outputs;

    const diffp_c = expected_dose > 0 ? ((effective_dose - expected_dose)/expected_dose*100).toFixed(2) : '';

    return(
        <Block style={{margin: "25px 0px 25px 0px"}}>
            <BlockTitle style={{marginBottom: "10px"}}>Perfil de fertilización</BlockTitle>
            <table style={tableStyle}>
                <tbody>
                    {expected_dose ? 
                        <tr>
                            <td style={fieldCellStyle}><b>Dosis prevista:</b></td>
                            <td style={dataCellStyle} data-testid="distribution-expected-dose-output">
                                {expected_dose?.toFixed(2)} {productType === PRODUCT_TYPES.LIQUID ? "l/ha" : "kg/ha"}
                            </td>
                        </tr>
                        : null
                    }
                    {effective_dose ?
                        <>
                            <tr>
                                <td style={fieldCellStyle}><b>Dosis efectiva:</b></td>
                                <td style={dataCellStyle} data-testid="distribution-effective-dose-output">
                                    {effective_dose?.toFixed(2) || ''} {productType === PRODUCT_TYPES.LIQUID ? "l/ha" : "kg/ha"} ({diffp_c} %)
                                </td>
                            </tr>
                            { effective_work_width &&
                            <tr>
                                <td style={fieldCellStyle}><b>Ancho de labor efectivo:</b></td>
                                <td style={dataCellStyle} data-testid="distribution-effective-work-width-output">
                                    {effective_work_width} m
                                </td>
                            </tr>
                            }
                        </>
                        : null
                    }
                    <tr>
                        <td style={fieldCellStyle}><b>Promedio:</b></td>
                        <td style={dataCellStyle} data-testid="distribution-average-output">
                            {avg?.toFixed(2) || ''} {productType === PRODUCT_TYPES.LIQUID ? "ml" : "gr"}
                        </td>
                    </tr>                        
                    <tr>
                        <td style={fieldCellStyle}><b>Coef. variac.:</b></td>
                        <td style={dataCellStyle} data-testid="distribution-cv-output">
                            {cv?.toFixed(2) || ''} %
                        </td>
                    </tr>
                </tbody>
            </table>
        </Block>
    );
};

export default ResultsProfile;