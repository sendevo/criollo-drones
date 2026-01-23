import { Card } from 'framework7-react';
import {trayCollectedPrompt} from '../Prompts';

const TrayTable = ({trayData, onAddCollected}) => {

    const handleAddCollected = index => {
        if(onAddCollected){
            console.log("Agregar peso recolectado a bandeja ", index);
            trayCollectedPrompt(index, trayData.length, onAddCollected);
        }
    };

    return (
        <Card>
            <div>
                <table className="data-table" style={{textAlign:"center", minWidth:"0px", tableLayout:"fixed"}} >
                    <colgroup>
                        <col span={1} style={{width: "50%"}} />
                        <col span={1} style={{width: "50%"}} />
                    </colgroup>
                    <thead style={{backgroundColor:"rgb(200,200,200)"}}>
                        <tr style={{maxHeight:"40px!important"}}>
                            <th className="label-cell" style={{margin:0, padding:0}}>Bandeja</th>
                            <th className="label-cell" style={{margin:0, padding:0}}>
                                <div>Peso</div><div>recolectado</div>
                            </th>
                        </tr>
                    </thead>
                </table>
            </div>
            <div style={{maxHeight:"300px",overflow: "auto"}}>
                <table className="data-table" style={{textAlign:"center", minWidth:"0px", tableLayout:"fixed"}} >                        
                    <colgroup>
                        <col span={1} style={{width: "50%"}} />
                        <col span={1} style={{width: "50%"}} />
                    </colgroup>
                    <tbody style={{maxHeight:"300px",overflow: "auto"}}>
                        {
                            trayData.map((tr, idx) => (
                                <tr key={idx} onClick={()=>{handleAddCollected(idx)}} style={{cursor:"pointer"}}>
                                    <td>{idx+1}</td>
                                    <td className="numeric-cell" style={{textAlign: "center"}}>{tr.collected.toFixed(2)} gr</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default TrayTable;