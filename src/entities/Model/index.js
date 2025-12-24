import { generateId } from "../../utils";
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from "@capacitor/core";
import nozzles from '../../data/nozzles_droplet_sizes.json';

// A partir de version 1.0.0, se agrega modelo de migraciones
export const APP_NAME = "Criollo Drones";
export const ANDROID_VERSION_CODE = "1"; // Para app store
export const VERSION_NAME = "0.0.1"; // Version visible para el usuario
export const BUILD_DATE = 1766405960722; // 22-12-2025 9:19hs

// Lista de versiones
const DB_NAMES = [
    //"criollo_drones_2" // Descomentar para migraciones posteriores
];


const migrationFunctions = [
    //oldData => oldData // Descomentar para migraciones posteriores
];


class lsPreferences { // Fallback para localStorage en Capacitor
    constructor(){}

    get({key}){
        return new Promise(resolve => {
            const data = localStorage.getItem(key);
            resolve({value:data});
        });
    }

    set({key, value}){
        return new Promise(resolve => {
            localStorage.setItem(key, value);
            resolve();
        });
    }

    clear(){
        return new Promise(resolve => {
            localStorage.clear();
            resolve();
        });
    }
};

const ls = Capacitor.isNativePlatform() ? Preferences : new lsPreferences(); // Usar Capacitor Preferences o localStorage


const get_blank_report = () => {
    return {
        id: generateId(),
        name: "Sin nombre",
        comments: "",
        params:{},
        control: {},
        supplies: {},
        completed: {
            params: false,
            control: false,
            supplies: false
        },
        selected: false // Esto se usa en la vista de listado
    };
};

const defaultFormParams = {
    productType: "fitosanitarios", // Tipo de producto. Puede ser "fitosanitarios" o "fertilizante"
    productDensity: 1, // Densidad del producto (g/l)
    workVelocity: "20.0", // Velocidad de trabajo (km/h)
    velocityMeasured: false, // Para disparar render en vista de parametros
    volumeMeasured: false, // Para disparar render en vista de parametros
    workPressure: "2.0", // Presion de trabajo (bar)
    workVolume: "56.0", // Volumen de aplicacion (l/ha)
    workFlow: 0.65, // Caudal de trabajo efectivo (l/min) por pico
    nominalFlow: 0.8, // Caudal nominal de pico seleccionado
    nominalPressure: 3, // Presion nominal de pico seleccionado
    sprayFlow: null, // Caudal de pulverizacion (caudal de picos multiplicado por n de picos)
    waterEqSprayFlow: null, // Caudal de agua equivalente (para aplicacion con fertilizantes)
    nozzleSeparation: 0.35, // Distancia entre picos (m)
    nozzleNumber: null, // Numero de picos
    nozzleSelection: [-1, -1, -1, -1], // Indices de picos seleccionados

    nutrientConcentration: "100", // Concentracion de nutriente (%)
    nutrientDose: "0.0", // Dosis de nutriente (kg/ha)
    
    // Verificacion de picos
    samplingTimeMs: 30000, // 30000, 60000 o 90000
    collectedData: [], // Datos de jarreo
    verificationOutput: {
        /*
            ready: false, // Verificacion finalizada: muestra resultados
            efAvg: undefined, // Caudal pulverizado promedio
            totalEffectiveFlow: undefined, // Caudal pulverizado efectivo
            expectedSprayVolume: undefined, // model.workVolume
            effectiveSprayVolume: undefined, // Volumen pulverizado efectivo
            diff: undefined, // effectiveSprayVolume - expectedSprayVolume
            diffp: undefined, // diff/model.workVolume*100
            comments: ""
        */
    },

    // Variables de insumos
    workArea: null, // Superficie de lote
    lotName: null, // Nombre del lote
    lotCoordinates: null, // Coordenadas del lote
    gpsEnabled: false, // Habilitacion coordenadas lote
    loadBalancingEnabled: true, // Habilitacion balanceo de carga
    capacity: null, // Capacidad del tanque
    products: [], // Lista de prductos. Formato:
    /*
    {
        key: "id_unico",
        name: "Nombre del producto",
        dose: "0.0",
        presentation: 0 -> ml/ha, 1 -> ml/100L, 2 -> gr/ha, 3 -> gr/100L, 4 -> L/ha
    }
    */
    supplies: {}, // Insumos y cantidades

    currentReport: get_blank_report(),
    reports: [], // Lista de reportes
};

// Esta clase Singleton se encarga de manejar el estado persistente de las variables globales.

export default class CriolloModel {
    constructor(){
        Object.assign(this, defaultFormParams);
        this.reports = []; // Esta variable debe ser persistente
        this.loadDatabase();
    }

    update(param, value){ // Actualizar uno o mas parametros
        let updated = false;
        if(typeof param === "string"){
            this[param] = value;
            updated = true;
        }
        if(typeof param === "object" && typeof value === "undefined"){
            Object.assign(this, param);
            updated = true;
        }
        if(updated)
            this.updateDatabase();
        else{ 
            //console.log("Error: no se pudo actualizar el modelo");
            Function.prototype();
        }
    }

    getNozzleName(selection) { // Obtener nombre del pico seleccionado
        let current = nozzles;
        for (let i = 0; i < selection.length; i++) {
            const level = selection[i];
            if (level === -1) break;

            if (Array.isArray(current)) {
                if (level >= 0 && level < current.length) {
                    current = current[level];
                } else {
                    return null;
                }
            } else if (current.childs && Array.isArray(current.childs)) {
                if (level >= 0 && level < current.childs.length) {
                    current = current.childs[level];
                } else {
                    return null;
                }
            } else {
                return null;
            }
        }

        return current && typeof current === 'object' ? current.long_name : null;
    }

    getNozzle = selection => {
        if (!Array.isArray(selection) || selection.length === 0) 
            return null;
        let level = selection.findIndex(x => x === -1); // Max prof. de seleccion
        if (level === -1) 
            level = selection.length;
        const node = selection
            .slice(0, level) // Tomar los niveles seleccionados
            .reduce((acc, idx) => { // Nodo seleccionado
                if (!acc || !Array.isArray(acc.childs) || idx < 0)  // Si no hay seleccion
                    return null;
                return acc.childs[idx];
            }, { childs: nozzles });
        if(node){
            const hasParameters = node.b !== undefined && node.c !== undefined;
            return hasParameters ? node : null; // Retornar solo si tiene parametros para evitar error de calculo
        }
        return null;
    }

    /// Persistencia de parametros
    updateDatabase(){ // Guardar datos en localStorage
        const key = DB_NAMES[DB_NAMES.length - 1]; // Ultima version
        const value = JSON.stringify(this);
        ls.set({key, value});
    }

    async loadDatabase(){ // Recuperar datos de localStorage
        const jobs = DB_NAMES.map(name => ls.get({ key: name }));
        const results = await Promise.all(jobs);
        
        let currentIndex = -1;
        let currentData = null;

        for (let i = DB_NAMES.length - 1; i >= 0; i--) {
            const result = results[i];
            if (result.value) {
                currentIndex = i;
                try {
                    currentData = JSON.parse(result.value);
                } catch (e) {
                    console.error(`Fallo la lectura de datos para ${DB_NAMES[i]}`, e);
                    return null;
                }
                break;
            }
        }

        if (currentIndex === -1) {
            console.log("No se encontró una base de datos existente.");
            currentData = { ...defaultFormParams }; // Crear datos por defecto
            return null;
        }

        for (let i = currentIndex; i < DB_NAMES.length - 1; i++) {
            if(i >= migrationFunctions.length){
                console.warn(`Falta la migración de ${DB_NAMES[i]} a ${DB_NAMES[i+1]}`);
                break;
            }
            const migrationFn = migrationFunctions[i];
            if (typeof migrationFn !== "function") {
                console.warn(`Falta la migración de ${DB_NAMES[i]} a ${DB_NAMES[i+1]}`);
                break;
            }
            currentData = migrationFn(currentData);
            console.log(`Migrando datos de ${DB_NAMES[i]} a ${DB_NAMES[i+1]}`);
        }

        await ls.set({
            key: DB_NAMES[DB_NAMES.length - 1],
            value: JSON.stringify(currentData)
        });

        for (let i = 0; i < DB_NAMES.length - 1; i++) // Limpiar versiones anteriores
            await ls.set({ key: DB_NAMES[i], value: null });

        Object.assign(this, currentData); // Actualizar el modelo con los datos cargados
    }

    clearForms() { // Limpiar formularios
        Object.assign(this, defaultFormParams);
        this.updateDatabase();
    }

    /// Reportes
    addParamsToReport(params) {
        this.currentReport.params = params;
        this.currentReport.completed.params = true;
    }

    addControlToReport(control) {
        this.currentReport.control = control;
        this.currentReport.completed.control = true;
    }

    addSuppliesToReport(results) {
        if(results.lotName.length > 1)
            this.currentReport.name = results.lotName;
        this.currentReport.supplies = results;
        this.currentReport.completed.supplies = true;             
    }

    getReport(id){
        const index = this.reports.findIndex(report => report.id === id);
        return index !== -1 ? this.reports[index] : null;
    }

    saveReport(){ // Guardar (finalizar) reporte
        this.currentReport.timestamp = Date.now();
        this.reports.push(this.currentReport);
        this.clearReport();
    }

    clearReport(){ // Limpiar reporte actual
        this.currentReport = get_blank_report();
        this.updateDatabase();
    }

    renameReport(id, name){
        const index = this.reports.findIndex(report => report.id === id);
        if(index !== -1){
            this.reports[index].name = name;
            this.updateDatabase();
            return {
                status: "success"
            };
        }else{
            return {
                status: "error",
                message: "Problema al renombrar reporte"
            };
        }
    }

    deleteReport(id){
        const index = this.reports.findIndex(report => report.id === id);
        if(index !== -1){
            this.reports.splice(index, 1);
            this.updateDatabase();
            return {
                status: "success"
            };
        }else{
            return {
                status: "error",
                message: "No se encontró el reporte"
            };
        }
    }
}