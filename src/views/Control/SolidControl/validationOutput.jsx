import { Block } from 'framework7-react';
import { tableStyle, fieldCellStyle, dataCellStyle } from '../styles.js';


const ValidationOutput = props => { // Resultado de verificacion de dosis
    
    const {
        effective_dose,
        dose_diff,
        dose_diff_p,
        download_rate,
        treated_area
    } = props;

    return (
        <Block style={{margin: "10px 0px 5px 0px"}}>
            <table style={tableStyle}>
                <tbody>
                    {effective_dose ? 
                        <tr>
                            <td style={{...fieldCellStyle, fontSize:"14px"}}><b>Dosis efectiva:</b></td>
                            <td style={{...dataCellStyle, fontSize:"14px"}} data-testid="solid-effective-dose-output">
                                {effective_dose?.toFixed(2)} kg/ha
                            </td>
                        </tr>
                        : null
                    }
                    {dose_diff ?
                        <tr>
                            <td style={fieldCellStyle}><b>Diferencia con dosis prevista:</b></td>
                            <td style={dataCellStyle} data-testid="solid-dose-diff-output">
                                {dose_diff?.toFixed(2)} kg/ha ({dose_diff_p?.toFixed(2)}%)
                                {Number(dose_diff_p) > 10 ? (
                                    <div style={{ color: '#d32f2f', fontSize: '12px', marginTop: '2px' }}>
                                        Se recomienda ajustar dosis
                                    </div>
                                ) : null}
                            </td>
                        </tr>
                        : null
                    }
                    {download_rate ?
                        <tr>
                            <td style={fieldCellStyle}><b>Tasa de descarga:</b></td>
                            <td style={dataCellStyle} data-testid="solid-download-rate-output">
                                {download_rate?.toFixed(2)} kg/min
                            </td>
                        </tr>
                        : null
                    }
                    {treated_area ?
                        <tr>
                            <td style={fieldCellStyle}><b>Superficie tratada:</b></td>
                            <td style={dataCellStyle} data-testid="solid-treated-area-output">
                                {treated_area?.toFixed(2)} ha/min
                            </td>
                        </tr>
                        : null

                    }
                </tbody>
            </table>
        </Block>
    );
};

export default ValidationOutput;