import { Block } from 'framework7-react';
import { tableStyle, fieldCellStyle, dataCellStyle } from '../styles.js';
import { PRODUCT_TYPES } from '../../../entities/Model/index.js';


const ParamsData = props => { // Encabezado para mostrar los parámetros operativos

    const {
        doseSolid,
        doseLiquid,
        productType,
        originalWorkWidth,
        workVelocity
    } = props;
    const dose = productType === PRODUCT_TYPES.LIQUID ? doseLiquid : doseSolid;
    const doseUnit = productType === PRODUCT_TYPES.LIQUID ? 'l/ha' : 'kg/ha';
    const doseTestId = productType === PRODUCT_TYPES.LIQUID ? 'liquid-dose-preview' : 'solid-dose-preview';

    return (
        <Block style={{margin: "10px 0px 5px 0px"}}>
            <table style={{...tableStyle, color: 'blue', marginBottom: '15px'}}>
                <tbody>
                    {dose ? 
                        <tr>
                            <td style={fieldCellStyle}><b>Dosis prevista:</b></td>
                            <td 
                                data-testid={doseTestId}
                                style={dataCellStyle}>
                                    {dose?.toFixed(2)} {doseUnit}
                            </td>
                        </tr>
                        : null
                    }
                    {originalWorkWidth ?
                        <tr>
                            <td style={fieldCellStyle}><b>Ancho de faja previsto:</b></td>
                            <td 
                                data-testid="work-width-preview"
                                style={dataCellStyle}>
                                    {originalWorkWidth} m
                            </td>
                        </tr>
                        : null
                    }
                    {workVelocity ?
                        <tr>
                            <td style={fieldCellStyle}><b>Velocidad de trabajo:</b></td>
                            <td 
                                data-testid="work-velocity-preview"
                                style={dataCellStyle}>
                                    {workVelocity} km/h
                            </td>
                        </tr>
                        : null
                    }
                </tbody>
            </table>
        </Block>
    );
};

export default ParamsData;