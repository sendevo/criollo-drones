import { f7, List, Row } from 'framework7-react';
import ReactDOMServer from 'react-dom/server';
import IconCollected from '../../assets/icons/recolectado.png';
import Input from '../Input';
import React from 'react';

const nozzleCollectedPrompt = (row, callback) => { 
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

const openRecipientSizePrompt = callback => { 
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

const timerCollectedPrompt = (callback) => { 
    // Modal ingreso de peso recolectado para dosis

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


export { nozzleCollectedPrompt, timerCollectedPrompt, openRecipientSizePrompt };

