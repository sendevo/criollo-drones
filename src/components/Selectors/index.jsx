import { Block, Radio, Row, Col, BlockTitle } from 'framework7-react';
import Typography from '../Typography';
import { PRODUCT_TYPES } from '../../entities/Model';
import { openRecipientSizePrompt } from '../Prompts';

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
                        data-test-id="product-type-solid-radio"
                        name="input-type" 
                        checked={value===PRODUCT_TYPES.SOLID} 
                        onChange={e=>setValue(e, PRODUCT_TYPES.SOLID)}/> Sólidos
                </Col>
                <Col style={{textAlign:"center"}}>
                    <Radio 
                        data-test-id="product-type-liquid-radio"
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

const PresentationSelector = ({value, onChange, productType}) => {
    const setLiquidValue = selectedValue => {
        onChange(selectedValue);
    };

    const setBulkValue = checked => {
        if(checked) {
            onChange(0);
        }
    };

    const openPackagePrompt = checked => {
        if(checked) {
            openRecipientSizePrompt(v => onChange(v), productType === PRODUCT_TYPES.SOLID ? "kg" : "l");
        }
    };

    if(productType === PRODUCT_TYPES.SOLID) {
        return (
            <Row style={{fontSize:"0.8em", marginTop: 10}}>
                <Col width={33}>
                    <div style={label}>
                        Presentación
                    </div>
                </Col>
                <Col width={33} style={{textAlign:"center"}}>
                    <Radio
                        name="input-type"
                        checked={value === 0}
                        onChange={e=>setBulkValue(e.target.checked)}/> A granel
                </Col>
                <Col width={33} style={{textAlign:"center"}}>
                    <Radio
                        name="input-type"
                        checked={value > 0}
                        onChange={e=>openPackagePrompt(e.target.checked)}/> En envase
                    {value > 0 ? <br/> : null}
                    {value > 0 ? <span style={{color:"darkgray"}}> (de {value} kg)</span> : null}
                </Col>
            </Row>
        );
    }

    return (
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
                        checked={value === 0} 
                        onChange={e=>setLiquidValue(0)}/> ml/ha
                </Col>
                <Col width={25}>
                    <Radio 
                        name="input-type" 
                        checked={value === 2} 
                        onChange={e=>setLiquidValue(2)}/> ml/100l
                </Col>
                <Col  width={25}>
                    <Radio 
                        name="input-type" 
                        checked={value === 1} 
                        onChange={e=>setLiquidValue(1)}/> gr/ha
                </Col>
                <Col width={25}>
                    <Radio 
                        name="input-type" 
                        checked={value === 3} 
                        onChange={e=>setLiquidValue(3)}/> gr/100l
                </Col>
            </Row>
        </div>
    );
};


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

const PatternSelector = props => {

    const setPattern = (el, value) => {
        if(el.target.checked) {
            props.onChange(value);
        }
    };

    return (
        <Block style={{margin:"0px"}}>
            <BlockTitle>
                <Typography variant='subtitle'>Patrón de fertilización</Typography>
            </BlockTitle>
            <Row>
                <Col style={{textAlign:"center"}}>
                    <Radio
                        name="input-type"
                        checked={props.pattern === "lineal"}
                        onChange={e=>setPattern(e, "lineal")}/> Ida y vuelta
                </Col>
                <Col style={{textAlign:"center"}}>
                    <Radio
                        name="input-type"
                        checked={props.pattern === "circular"}
                        onChange={e=>setPattern(e, "circular")}/> En círculos
                </Col>
            </Row>
        </Block>
    );
};


export {
    ProductTypeSelector,
    NozzleSeparationSelector,
    PresentationSelector,
    ElapsedSelector,
    PatternSelector
};