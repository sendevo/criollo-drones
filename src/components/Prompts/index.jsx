import { f7, List, Row } from 'framework7-react';
import ReactDOMServer from 'react-dom/server';
import IconCollected from '../../assets/icons/peso_recolectado.png';
import Input from '../Input';
import { PRODUCT_TYPES } from '../../entities/Model';

export const trayCollectedPrompt = (productType, row, len, callback) => { 
    // Modal ingreso de peso/gotas recolectado de la bandeja/tarjeta

    const elId = `collectedweightinput-${row}`; // Id del input (único)
    
    const content = ReactDOMServer.renderToStaticMarkup(
        <List form noHairlinesMd style={{marginBottom:"0px"}}>
            <Input
                inputId={elId}
                slot="list"
                label={productType === PRODUCT_TYPES.LIQUID ? "Gotas contadas" : "Peso recolectado"}
                icon={IconCollected}
                type="number"
                unit={productType === PRODUCT_TYPES.LIQUID ? "gotas" : "gr"}/>
        </List>
    );

    const returnValue = r => { // Capturar valor ingresado y retornar
        const inputEl = document.getElementById(elId);
        const value = parseFloat(inputEl.value) || 0;
        callback(r, value);
    };

    const buttons = [ // Botones del modal
        {text: "Cancelar"},
        {text: "Aceptar", onClick: () => returnValue(row)}
    ];

    if(row + 1 < len) // Si no es la ultima bandeja, agregar boton de siguiente
        buttons.push({
            text: "Siguiente",
            onClick: ()=>{
                returnValue(row);
                f7.dialog.close();
                trayCollectedPrompt(productType, row + 1, len, callback);
            }
        });

    const title = productType === PRODUCT_TYPES.LIQUID ? `Tarjeta ${row+1}` : `Bandeja ${row+1}`;

    f7.dialog.create({
        title: title,
        content: content,
        buttons: buttons,
        destroyOnClose: true        
    }).open();
};


export const nozzleCollectedPrompt = (row, callback) => { 
    // Modal ingreso de peso recolectado de la bandeja

    const elId = "collectedvolumeinput"; // Id del input
    
    const content = ReactDOMServer.renderToStaticMarkup(
        <List form noHairlinesMd style={{marginBottom:"0px"}}>
            <Input
                slot="list"
                label="Volumen recolectado"
                icon={IconCollected}
                type="number"
                unit="L"
                inputId={elId}
            ></Input>
        </List>
    );

    const returnValue = () => { // Capturar valor ingresado y retornar
        const inputEl = document.getElementById(elId);                    
        callback(row, parseFloat(inputEl.value) || 0);
    };

    const buttons = [ // Botones del modal
        {
            text: "Cancelar"
        },
        {
            text: "Aceptar",
            onClick: returnValue
        }
    ];

    f7.dialog.create({
        title: "Pico controlado "+(row+1),
        content: content,
        buttons: buttons,
        destroyOnClose: true        
    }).open();
};

export const openRecipientSizePrompt = callback => { 
    // Modal ingreso de tamanio de recipiente

    const elId = "recipientsizeinput"; // Id del input
    
    const content = ReactDOMServer.renderToStaticMarkup(
        <List form noHairlinesMd style={{marginBottom:"0px"}}>
            <Row slot="list">                
                <Input
                    label="Capacidad"
                    type="number"
                    unit="l"
                    inputId={elId}
                ></Input>
            </Row>
        </List>
    );

    const buttons = [ // Botones del modal
        {
            text: "Cancelar"
        },
        {
            text: "Aceptar",
            onClick: () => { // Capturar valor ingresado y retornar
                const inputEl = document.getElementById(elId);                    
                callback(parseFloat(inputEl.value) || 0);
            }
        }
    ];

    f7.dialog.create({
        title: "Capacidad del envase",
        content: content,
        buttons: buttons,
        destroyOnClose: true        
    }).open();
};

export const timerCollectedPrompt = (callback, productype) => { 
    // Modal ingreso de peso recolectado para dosis

    const elId = "collectedvolumeinput"; // Id del input
    
    const content = ReactDOMServer.renderToStaticMarkup(
        <List form noHairlinesMd style={{marginBottom:"0px"}}>
            <Input
                slot="list"
                label={productype === PRODUCT_TYPES.LIQUID ? "Volumen recolectado" : "Peso recolectado"}
                icon={IconCollected}
                type="number"
                unit={productype === PRODUCT_TYPES.LIQUID ? "L" : "kg"}
                inputId={elId}>
            </Input>
        </List>
    );

    const returnValue = () => { // Capturar valor ingresado y retornar
        const inputEl = document.getElementById(elId);                    
        callback(parseFloat(inputEl.value) || 0);
    };

    const buttons = [ // Botones del modal
        {
            text: "Cancelar"
        },
        {
            text: "Aceptar",
            onClick: returnValue
        }
    ];

    f7.dialog.create({
        title: "Volumen recolectado",
        content: content,
        buttons: buttons,
        destroyOnClose: true        
    }).open();
};
