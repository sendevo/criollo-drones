import { Block } from 'framework7-react';
import { tableStyle, fieldCellStyle, dataCellStyle } from '../styles.js';


const ValidationOutput = props => { // Resultado de verificacion de dosis
    
    const {
        effective_dose,
        dose_diff,
        dose_diff_p,
    } = props;

    return (
        <Block style={{margin: "10px 0px 5px 0px"}}>
            <table style={tableStyle}>
                <tbody>
                    {effective_dose ? 
                        <tr>
                            <td style={fieldCellStyle}><b>Dosis efectiva:</b></td>
                            <td style={dataCellStyle}>{effective_dose?.toFixed(2)} kg/ha</td>
                        </tr>
                        : null
                    }
                    {dose_diff ?
                        <tr>
                            <td style={fieldCellStyle}><b>Diferencia con dosis prevista:</b></td>
                            <td style={dataCellStyle}>{dose_diff?.toFixed(2)} kg/ha ({dose_diff_p?.toFixed(2)}%)</td>
                        </tr>
                        : null
                    }
                </tbody>
            </table>
        </Block>
    );
};

export default ValidationOutput;