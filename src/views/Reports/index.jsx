import { f7, Navbar, Page, Block, Checkbox, Row, Col, Button } from 'framework7-react';
import { useState, useContext } from 'react';
import moment from 'moment';
import { NavbarTitle, BackButton } from '../../components/Buttons';
import iconEmpty from '../../assets/icons/empty_folder.png';
import { ModelCtx } from '../../context';
import Toast from '../../components/Toast';
import classes from './style.module.css';

const countSelected = array => {
    return array.filter(el => el.selected).length;
};

const Reports = props => {

    const model = useContext(ModelCtx);

    const [reports, setReports] = useState(model.reports || []);
    const [selectedCount, setSelectedCount] = useState(countSelected(model.reports));

    const setSelectedAll = v => {
        //const temp = [...reports];
        const temp = [...model.reports]; 
        temp.forEach(report => {
            report.selected = v;
        });
        setSelectedCount(v ? temp.length : 0);
        setReports(temp);
    };

    const setSelected = (id, v) => {
        const temp = [...reports];
        temp.forEach(report => {
            if (report.id === id)
                report.selected = v;
        });
        setSelectedCount(countSelected(temp));
        setReports(temp);
    };

    const getSelected = () => {
        return reports.filter(report => report.selected);
    };

    const getSingleSelected = () => {
        const selectedIds = getSelected().map(el => el.id);
        if (selectedIds.length === 0) {
            Toast("info", "Seleccione al menos un reporte", 2000, "center");
            return;
        }
        if (selectedIds.length > 1) {
            Toast("info", "Solo puede renombrar un reporte a la vez", 2000, "center");
            return;
        }
        return model.getReport(selectedIds[0]);
    };

    const openSelected = () => {
        const selectedReport = getSingleSelected();
        props.f7router.navigate("/reportDetails/" + selectedReport.id);
    };

    const renameSelected = () => {
        const selectedReport = getSingleSelected();
        f7.dialog.prompt('Indique el nuevo nombre para el reporte seleccionado', 'Editar nombre', newName => {
            const res = model.renameReport(selectedReport.id, newName);
            if(res.status === "success"){
                Toast("success", "Reporte renombrado exitosamente", 2000, "center");
                setSelectedAll(false); // Deseleccionar todos y actualizar vista
            }else
                Toast("error", res.message, 2000, "center");
        }, null, selectedReport.name);
    };

    const deleteSelected = () => {
        f7.dialog.confirm('¿Está seguro que desea eliminar los reportes seleccionados?', 'Eliminar reportes', () => {
            const selectedIds = getSelected().map(el => el.id);
            if (selectedIds.length > 0) {
                for(let i = 0; i < selectedIds.length; i++){
                    const res = model.deleteReport(selectedIds[i]);
                    if(res.status === "error"){
                        Toast("error", res.message, 2000, "center");
                        break;
                    }
                }
                Toast("success", "Reportes eliminados exitosamente", 2000, "center");
                setSelectedAll(false); // Deseleccionar todos y actualizar vista
            }else{
                Toast("info", "Seleccione al menos un reporte", 2000, "center");
            }
        });
    };

    return (
        <Page>
            <Navbar style={{maxHeight:"40px", marginBottom:"0px"}}>
                <NavbarTitle {...props} title="Reportes guardados" />
            </Navbar>
            {
            reports.length > 0 ?
                <Row className={classes.Container}>
                    <table className={classes.Table}>
                        <colgroup>
                            <col span={1} style={{width: "15%"}} />
                            <col span={1} style={{width: "45%"}} />
                            <col span={1} style={{width: "40%"}} />
                        </colgroup>
                        <thead>
                            <tr className={classes.TableRow}>
                                <th className={classes.CheckboxCell}>
                                    <Checkbox
                                        checked={reports.length === selectedCount}
                                        indeterminate={selectedCount > 0 && selectedCount < reports.length}
                                        onChange={e => setSelectedAll(e.target.checked)}
                                    />
                                </th>
                                <th className={classes.NameCell}>Título</th>
                                <th className={classes.DateCell}>Fecha</th>
                            </tr>
                        </thead>
                        <tbody style={{maxHeight:"300px",overflow: "auto"}}>
                            {
                                reports.map(r => (
                                    <tr className={classes.TableRow} key={r.id} style={{backgroundColor: r.selected ? "rgb(230,230,230)" : "white"}}>
                                        <td className={classes.CheckboxCell}>
                                            <Checkbox
                                                checked={r.selected}
                                                onChange={e => setSelected(r.id, e.target.checked)}
                                            />
                                        </td>
                                        <td className={classes.NameCell}>{r.name}</td>
                                        <td className={classes.DateCell}>{moment(r.timestamp).format("DD/MM - HH:mm")}</td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </Row>
                :
                <Block>
                    <div style={{marginTop: "50%"}}>
                        <center>
                            <h2>No hay reportes guardados</h2>
                            <img src={iconEmpty} height="100px" alt="Sin reportes" />
                        </center>
                    </div>
                </Block>
            }
            {
                selectedCount === 1 ?
                <>
                    <Row style={{marginTop:20}}>
                        <Col width={20}></Col>
                        <Col width={60}>
                            <Button fill onClick={renameSelected} color="teal" style={{textTransform:"none"}}>Cambiar nombre</Button>
                        </Col>
                        <Col width={20}></Col>
                    </Row>
                    <Row style={{marginTop:10}}>
                        <Col width={20}></Col>
                        <Col width={60}>
                            <Button fill onClick={openSelected} style={{textTransform:"none"}}>Abrir</Button>
                        </Col>
                        <Col width={20}></Col>
                    </Row>
                </>
                :
                null
            }
            {
                selectedCount > 0 ?
                <Row style={{marginTop:10}}>
                    <Col width={20}></Col>
                    <Col width={60}>
                        <Button fill onClick={deleteSelected} color="red" style={{textTransform:"none"}}>Borrar</Button>
                    </Col>
                    <Col width={20}></Col>
                </Row>
                :
                null
            }
            <BackButton {...props} />
        </Page>
    );
};

export default Reports;