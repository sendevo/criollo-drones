import { Card } from "framework7-react";
import { presentationUnits } from "../../entities/API";
import classes from './style.module.css';
import { formatNumber } from '../../utils';

const PrescriptionTable = props => (
    <Card className={classes.Card}>
        <table className={["data-table", classes.SuppliesTable].join(' ')}>
            <thead>
                <tr>
                    <th height="40" className="label-cell" style={{margin:0, padding:0}}>Producto</th>                
                    <th className="label-cell" style={{margin:0, padding:0}}>Dosis</th>
                </tr>
            </thead>
            
            <tbody>
            {
                props.supplies.pr?.map((prod, index) => (
                    <tr key={index}>
                        <td>{prod.name}</td>
                        <td>{formatNumber(prod.dose)} {presentationUnits[prod.presentation]}</td>
                    </tr>
                ))
            }
            </tbody>
        </table>
    </Card>
);

export default PrescriptionTable;