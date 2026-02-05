import React, { useState, useEffect } from 'react';
import { App, View, f7 } from 'framework7-react';
import { App as cApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import * as Views from './views';
import ReportsPanel from './components/ReportsPanel';
import Toast from './components/Toast';
import { ModelProvider } from './context';
import './index.css';

// Navegacion
const pushState = page => window.history.pushState(null, null, page);

const f7params = {
    name: 'Criollo Drones',
    id: 'com.inta.criollodrones',    
    theme: 'md',
    dialog: {
        buttonOk: 'Aceptar',
        buttonCancel: 'Cancelar'
    },    
    routes: [
        { // Menu principal
            path: '/',
            component: Views.Home,
            options: {
                transition: "f7-cover"        
            }
        },
        { // Menu informativo
            path: '/info/', 
            component: Views.Info,
            on:{pageInit: ()=>pushState("info")},
            options: {
                transition: "f7-cover"        
            }
        },
        { // Seccion acerca de
            path: '/about/',
            component: Views.About,
            on:{pageInit: ()=>pushState("about")},
            options: {
                transition: "f7-cover"        
            }
        },
        { // Seccion de parametros
            path: '/params/',
            component: Views.Params,
            on:{pageInit: ()=>pushState("params")},
            options: {
                transition: "f7-cover"        
            }
        },
        { // Seccion de control de prestacion
            path: '/control/',
            component: Views.Control,
            on:{pageInit: ()=>pushState("control")},
            options: {
                transition: "f7-cover"        
            }
        },
        { // Ajuste de caudal
            path: '/volume/',
            component: Views.Volume,
            on:{pageInit: ()=>pushState("volume")},
            options: {
                transition: "f7-cover"        
            }
        },
        {  // Calculo de velocidad
            path: '/velocity/',
            component: Views.Velocity,
            on:{pageInit: ()=>pushState("velocity")},
            options: {
                transition: "f7-cover"        
            }
        },
        {
            // Calculo de peso recolectado
            path: '/recolected/',
            component: Views.Recolected,
            on:{pageInit: ()=>pushState("recolected")},
            options: {
                transition: "f7-cover"        
            }
        },
        { // Seguridad y prevencion
            path: '/security/',
            component: Views.Security,
            on:{pageInit: ()=>pushState("security")},
            options: {
                transition: "f7-cover"        
            }
        },
        { // Calculo de insumos
            path: '/supplies/',
            component: Views.Supplies,
            on:{pageInit: ()=>pushState("supplies")},
            options: {
                transition: "f7-cover"        
            }
        },
        { // Lista de insumos
            path: '/suppliesList/',
            component: Views.SuppliesList,
            on:{pageInit: ()=>pushState("suppliesList")},
            options: {
                transition: "f7-cover"        
            }
        },
        { // Lista de reportes
            path: '/reports/',
            component: Views.Reports,
            on:{pageInit: ()=>pushState("reports")},
            options: {
                transition: "f7-cover"        
            }
        },
        { // Detalle de reporte
            path: '/reportDetails/:id',
            component: Views.ReportDetails,
            on:{pageInit: ()=>pushState("reportDetails")},
            options: {
                transition: "f7-cover"        
            }
        }
    ]
};

let exitWatchDog = 0;

if(Capacitor.isNativePlatform())
    cApp.addListener('backButton', () => {
        // Salir en vista principal
        if(f7.view.main.router.url === '/'){
            if(Date.now() - exitWatchDog > 3000){
                Toast('info', 'Presione nuevamente para salir');
                exitWatchDog = Date.now();
            }else{
                try{
                    // variable expuesta en ModelContext.js
                    window.criollomodel.clearForms();
                }catch(err){
                    //console.log(err);
                    Function.prototype();
                }
                cApp.exitApp();
            }            
        }else{
            f7.view.main.router.back();
        }
    });
else
    window.addEventListener("popstate", () => {    
        f7.view.main.router.back();
    }, false);

const Criollo = () => {

    const [showBackground, setShowBackground] = useState(false);

    useEffect(() => {
        const checkWidth = () => setShowBackground(window.innerWidth > 600);
        checkWidth();
        window.addEventListener('resize', checkWidth);
        return () => window.removeEventListener('resize', checkWidth);
    }, []);

    return (
        <App {...f7params}>
            <ModelProvider>
                {showBackground && (
                    <div
                        style={{
                            background: "lightgray",
                            filter: 'brightness(1.2) blur(6px) contrast(0.8)',
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center top',
                            backgroundSize: 'cover',
                            zIndex: -1,
                        }}/>
                )}
                <div className="app-container">
                    <View main url="/" className="app"/>
                </div>
                <ReportsPanel />
            </ModelProvider>
        </App>
    );
};

export default Criollo;