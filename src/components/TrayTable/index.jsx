import { Card } from 'framework7-react';
import { FaArrowCircleLeft, FaArrowCircleRight, FaStopCircle } from 'react-icons/fa';
import {trayCollectedPrompt} from '../Prompts';
import { PRODUCT_TYPES } from '../../entities/Model';

const TrayTable = ({productType, trayData, onAddCollected}) => {

    const handleAddCollected = index => {
        if(onAddCollected){
            //console.log("Agregar peso recolectado a bandeja ", index);
            trayCollectedPrompt(productType, index, trayData.length, onAddCollected);
        }
    };

    return (
        <Card>
            <div>
                <table className="data-table" style={{textAlign:"center", minWidth:"0px", tableLayout:"fixed"}} >
                    <colgroup>
                        <col span={1} style={{width: "30%"}} />
                        <col span={1} style={{width: "30%"}} />
                        <col span={1} style={{width: "40%"}} />
                    </colgroup>
                    <thead style={{backgroundColor:"rgb(200,200,200)"}}>
                        <tr style={{maxHeight:"40px!important"}}>
                            <th className="label-cell" style={{margin:0, padding:0}}>{productType === PRODUCT_TYPES.LIQUID ? "Tarjeta" : "Bandeja"}</th>
                            <th className="label-cell" style={{margin:0, padding:0}}>Lado</th>
                            <th className="label-cell" style={{margin:0, padding:0}}>
                                <div>
                                    {productType === PRODUCT_TYPES.LIQUID ? "Cantidad de gotas" : "Peso recolectado (gr)"}
                                </div>
                            </th>
                        </tr>
                    </thead>
                </table>
            </div>
            <div style={{maxHeight:"300px",overflow: "auto"}}>
                <table className="data-table" style={{textAlign:"center", minWidth:"0px", tableLayout:"fixed"}} >                        
                    <colgroup>
                        <col span={1} style={{width: "30%"}} />
                        <col span={1} style={{width: "30%"}} />
                        <col span={1} style={{width: "40%"}} />
                    </colgroup>
                    <tbody style={{maxHeight:"300px",overflow: "auto"}}>
                        {
                            trayData.map((tr, idx) => {
                                const unit = productType === PRODUCT_TYPES.LIQUID ? " gotas" : " gr";
                                const value = tr.collected.toFixed(productType === PRODUCT_TYPES.LIQUID ? 0 : 2);
                                const side = tr.side || (idx === (trayData.length - 1) / 2 ? "middle" : (idx < trayData.length / 2 ? "left" : "right"));
                                return (
                                    <tr
                                        key={idx}
                                        onClick={()=>{handleAddCollected(idx)}}
                                        style={{cursor:"pointer"}}
                                        data-testid={`tray-input-row-${idx + 1}`}>
                                        <td>{idx+1}</td>
                                        <td className="label-cell">
                                            {
                                                side === "middle"
                                                    ? <FaStopCircle size={20}/>
                                                    : side === "left"
                                                        ? <FaArrowCircleLeft size={20}/>
                                                        : <FaArrowCircleRight size={20}/>
                                            }
                                        </td>
                                        <td 
                                            className="numeric-cell"
                                            data-testid={`tray-collected-output-${idx + 1}`}
                                            style={{textAlign: "center"}}>
                                                {value} {unit}
                                        </td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default TrayTable;