import { Block, Radio, Row, Col, BlockTitle } from 'framework7-react';
import Typography from '../Typography';
import { PRODUCT_TYPES } from '../../entities/Model';

const ProductTypeSelector = ({value, onChange}) => {

    const setValue = (e, v) => {
        if(e.target.checked)
            onChange(v);
    };

    return(
        <Block style={{marginTop:"0px", marginBottom:"20px"}}>
            <BlockTitle>
                <Typography variant='subtitle'>Tipo de producto</Typography>
            </BlockTitle>

            <Row>
                <Col style={{textAlign:"center"}}>
                    <Radio 
                        name="input-type" 
                        checked={value===PRODUCT_TYPES.SOLID} 
                        onChange={e=>setValue(e, PRODUCT_TYPES.SOLID)}/> Sólidos
                </Col>
                <Col style={{textAlign:"center"}}>
                    <Radio 
                        name="input-type" 
                        checked={value===PRODUCT_TYPES.LIQUID} 
                        onChange={e=>setValue(e, PRODUCT_TYPES.LIQUID)}/> Líquidos
                </Col>
            </Row>
        </Block>
    );
};

const NozzleSeparationSelector = props => {

    const setValue = (el, value) => {
        if(el.target.checked){
            props.onChange({
                target: {
                    value: value
                }
            });
        }
    };

    return (
        <Block style={{margin:"0px"}}>
            <BlockTitle>
                <Typography variant='subtitle'>Configuración de botalón</Typography>
            </BlockTitle>
            <Row>
                <Col style={{textAlign:"center"}}>
                    <Radio 
                        disabled={props.disabled}
                        name="input-type" 
                        checked={props.value===0.35} 
                        onChange={e=>setValue(e,0.35)}/> 0,35 m
                </Col>
                <Col style={{textAlign:"center"}}>
                    <Radio 
                        disabled={props.disabled}
                        name="input-type" 
                        checked={props.value===0.52} 
                        onChange={e=>setValue(e,0.52)}/> 0,52 m
                </Col>
                <Col style={{textAlign:"center"}}>
                    <Radio 
                        disabled={props.disabled}
                        name="input-type" 
                        checked={props.value===0.7} 
                        onChange={e=>setValue(e,0.7)}/> 0,7 m
                </Col>
            </Row>
        </Block>
    );
};


const label = {
    display:"flex", 
    flexDirection: "column", 
    alignContent:"center", 
    alignItems: "center",
    color: "#777777"
};

const PresentationSelector = props => (
    <div>
        <Row style={{fontSize:"0.8em", marginBottom: 5, marginTop: 10}}>
            <Col width={50}>
                <div style={label}>
                    Líquidos
                </div>
            </Col>
            <Col width={50}>
                <div style={label}>
                    Sólidos
                </div>
            </Col>
        </Row>
        <Row style={{fontSize:"0.7em"}}>
            <Col  width={25}>
                <Radio 
                    name="input-type" 
                    checked={props.value === 0} 
                    onChange={e=>props.onChange(0)}/> ml/ha
            </Col>
            <Col width={25}>
                <Radio 
                    name="input-type" 
                    checked={props.value === 2} 
                    onChange={e=>props.onChange(2)}/> ml/100l
            </Col>
            <Col  width={25}>
                <Radio 
                    name="input-type" 
                    checked={props.value === 1} 
                    onChange={e=>props.onChange(1)}/> gr/ha
            </Col>
            <Col width={25}>
                <Radio 
                    name="input-type" 
                    checked={props.value === 3} 
                    onChange={e=>props.onChange(3)}/> gr/100l
            </Col>
        </Row>
    </div>
);


const ElapsedSelector = props => {

    const setElapsed = (el, value) => {
        if(el.target.checked){
            props.onChange(value);
        }
    };

    return (
        <Block style={{margin:"0px"}} className="help-target-control-sampling">
            <BlockTitle>Tiempo de muestreo</BlockTitle>
            <Row>
                <Col style={{textAlign:"center"}}>
                    <Radio 
                        disabled={props.disabled}
                        name="input-type" 
                        checked={props.value===30000} 
                        onChange={e=>setElapsed(e,30000)}/> 30 seg.
                </Col>
                <Col style={{textAlign:"center"}}>
                    <Radio 
                        disabled={props.disabled}
                        name="input-type" 
                        checked={props.value===60000} 
                        onChange={e=>setElapsed(e,60000)}/> 60 seg.
                </Col>
                <Col style={{textAlign:"center"}}>
                    <Radio 
                        disabled={props.disabled}
                        name="input-type" 
                        checked={props.value===90000} 
                        onChange={e=>setElapsed(e,90000)}/> 90 seg.
                </Col>
            </Row>
        </Block>
    );
};


export { ProductTypeSelector, NozzleSeparationSelector, PresentationSelector, ElapsedSelector };