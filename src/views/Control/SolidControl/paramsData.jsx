import { Block } from 'framework7-react';
import { tableStyle, fieldCellStyle, dataCellStyle } from '../styles.js';


const ParamsData = props => { // Encabezado para mostrar los parámetros operativos

    const {
        doseSolid,
        workWidth,
        workVelocity
    } = props;

    return (
        <Block style={{margin: "10px 0px 5px 0px"}}>
            <table style={tableStyle}>
                <tbody>
                    {doseSolid ? 
                        <tr>
                            <td style={fieldCellStyle}><b>Dosis prevista:</b></td>
                            <td style={dataCellStyle}>{doseSolid?.toFixed(2)} kg/ha</td>
                        </tr>
                        : null
                    }
                    {workWidth ?
                        <tr>
                            <td style={fieldCellStyle}><b>Ancho de labor:</b></td>
                            <td style={dataCellStyle}>{workWidth} m</td>
                        </tr>
                        : null
                    }
                    {workVelocity ?
                        <tr>
                            <td style={fieldCellStyle}><b>Velocidad de trabajo:</b></td>
                            <td style={dataCellStyle}>{workVelocity} m/s</td>
                        </tr>
                        : null
                    }
                </tbody>
            </table>
        </Block>
    );
};

export default ParamsData;