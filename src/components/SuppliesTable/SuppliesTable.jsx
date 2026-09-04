import { Card } from "framework7-react";
import { getProductQuantityLabel } from "../../entities/API";
import classes from './style.module.css';
import { formatNumber } from '../../utils';

const formatSolidWithPackages = (value, prod) => {
    const hasPackages = Number.isFinite(prod?.packageSize) && prod.packageSize > 0;
    if(!hasPackages) return `${formatNumber(value)} kg`;

    const packageCount = value / prod.packageSize;
    return `${formatNumber(value)} kg (${formatNumber(packageCount)} envases de ${formatNumber(prod.packageSize)} kg)`;
};

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
                    const isSolid = props.supplies.productType === 'solido';
                    const formatCell = value => isSolid ? formatSolidWithPackages(value, prod) : `${formatNumber(value)} ${unit}`;
                    return (
                        <tr key={index}>
                            <td>{prod.name}</td>
                            {!props.loadBalancing && <td>{formatCell(prod.cpp)}</td>}
                            {!props.loadBalancing && <td>{formatCell(prod.cfc)}</td>}
                            {props.loadBalancing && <td>{formatCell(prod.ceq)}</td>}
                            <td>{formatCell(prod.total)}</td>
                        </tr>
                    )}
                )
            }
            </tbody>
        </table>
    </Card>
);

export default SuppliesTable;