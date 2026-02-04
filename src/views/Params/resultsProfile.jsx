import { useContext } from 'react';
import { Block, BlockTitle } from 'framework7-react';
import { ModelCtx } from '../../context';

const dataCellStyle = {
    textAlign: "right",
    frontSize: "90%"
};

const fieldCellStyle = {
    textAlign: "left",
    frontSize: "90%"
};

const ResultsProfile = ({results}) => {

    const model = useContext(ModelCtx);

    const {expectedDose, effectiveDose, expectedWorkWidth} = model;
    const {fitted_dose, avg, cv, work_width} = results;    
    const diffp_c = expectedDose > 0 ? ((effectiveDose - expectedDose)/expectedDose*100).toFixed(2) : '';
    const diffp_f = expectedDose > 0 ? ((fitted_dose - expectedDose)/expectedDose*100).toFixed(2) : '';

    return(
        <Block style={{margin: "25px 0px 25px 0px"}}>
            <BlockTitle style={{marginBottom: "10px"}}>Perfil de fertilización</BlockTitle>
            <table style={
                {
                    padding: "0px !important",
                    margin: "0 auto",
                    width: "100%"
                }}>
                <tbody>
                    {expectedDose ? 
                        <tr>
                            <td style={fieldCellStyle}><b>Dosis prevista:</b></td>
                            <td style={dataCellStyle}>{expectedDose?.toFixed(2)} kg/ha</td>
                        </tr>
                        : null
                    }
                    {effectiveDose ?
                        <>
                            <tr>
                                <td style={fieldCellStyle}><b>Dosis efectiva:</b></td>
                                <td style={dataCellStyle}>{effectiveDose?.toFixed(2) || ''} kg/ha ({diffp_c} %)</td>
                            </tr>
                            { expected_work_width &&
                            <tr>
                                <td style={fieldCellStyle}><b>Ancho de labor efectivo:</b></td>
                                <td style={dataCellStyle}>{expectedWorkWidth} m</td>
                            </tr>
                            }
                        </>
                        : null
                    }
                    {fitted_dose && fitted_dose !== effectiveDose ?
                        <>
                            <tr>
                                <td style={fieldCellStyle}><b>Dosis ajustada:</b></td>
                                <td style={dataCellStyle}>{fitted_dose?.toFixed(2) || ''} kg/ha ({diffp_f} %)</td>
                            </tr>
                            { work_width &&
                                <tr>
                                    <td style={fieldCellStyle}><b>Ancho de labor ajustado:</b></td>
                                    <td style={dataCellStyle}>{work_width} m</td>
                                </tr>
                            }
                        </>
                        : null
                    }
                    <tr>
                        <td style={fieldCellStyle}><b>Promedio:</b></td>
                        <td style={dataCellStyle}>{avg?.toFixed(2) || ''} gr</td>
                    </tr>                        
                    <tr>
                        <td style={fieldCellStyle}><b>Coef. variac.:</b></td>
                        <td style={dataCellStyle}>{cv?.toFixed(2) || ''} %</td>
                    </tr>
                </tbody>
            </table>
        </Block>
    );
};

export default ResultsProfile;