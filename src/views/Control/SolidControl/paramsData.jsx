import { Block } from 'framework7-react';
import { tableStyle, fieldCellStyle, dataCellStyle } from '../styles.js';


const ParamsData = props => { // Encabezado para mostrar los parámetros operativos

    const {
        doseSolid,
        originalWorkWidth,
        workVelocity
    } = props;

    return (
        <Block style={{margin: "10px 0px 5px 0px"}}>
            <table style={tableStyle}>
                <tbody>
                    {doseSolid ? 
                        <tr>
                            <td style={fieldCellStyle}><b>Dosis prevista:</b></td>
                            <td 
                                data-testid="solid-dose-preview" 
                                style={dataCellStyle}>
                                    {doseSolid?.toFixed(2)} kg/ha
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