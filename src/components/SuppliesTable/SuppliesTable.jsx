import { Card } from "framework7-react";
import { getProductQuantityLabel } from "../../entities/API";
import classes from './style.module.css';
import { formatNumber } from '../../utils';

const SuppliesTable = props => (
    <Card className={classes.Card}>
        <table className={["data-table", classes.SuppliesTable].join(' ')}>
            <thead>
                <tr>
                    <th height="40" className="label-cell" style={{margin:0, padding:0}}>Producto</th>
                    {!props.loadBalancing && <th className="label-cell" style={{margin:0, padding:0}}><div>Carga</div><div>completa</div></th>}
                    {!props.loadBalancing && <th className="label-cell" style={{margin:0, padding:0}}><div>Fracción</div><div>de carga</div></th>}
                    {props.loadBalancing && <th className="label-cell" style={{margin:0, padding:0}}>Carga</th>}
                    <th className="label-cell" style={{margin:0, padding:0}}><div>Total</div><div>insumos</div></th>
                </tr>
            </thead>
            
            <tbody>
            {
                props.supplies.pr?.map((prod, index) => {
                    const unit = getProductQuantityLabel(prod, props.supplies.productType);
                    return (
                        <tr key={index}>
                            <td>{prod.name}</td>
                            {!props.loadBalancing && <td>{prod.presentation > 0 && props.supplies.productType === 'solido' ? Math.ceil(prod.cpp) : formatNumber(prod.cpp)} {unit}</td>}
                            {!props.loadBalancing && <td>{prod.presentation > 0 && props.supplies.productType === 'solido' ? Math.ceil(prod.cfc) : formatNumber(prod.cfc)} {unit}</td>}
                            {props.loadBalancing && <td>{prod.presentation > 0 && props.supplies.productType === 'solido' ? Math.ceil(prod.ceq) : formatNumber(prod.ceq)} {unit}</td>}
                            <td>{prod.presentation > 0 && props.supplies.productType === 'solido' ? Math.ceil(prod.total) : formatNumber(prod.total)} {unit}</td>
                        </tr>
                    )}
                )
            }
            </tbody>
        </table>
    </Card>
);

export default SuppliesTable;