import { generateId } from "../../utils";
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from "@capacitor/core";

// A partir de version 1.0.0, se agrega modelo de migraciones
export const APP_NAME = "Criollo Drones";
export const ANDROID_VERSION_CODE = "1"; // Para app store
export const VERSION_NAME = "0.0.1"; // Version visible para el usuario
export const BUILD_DATE = 1766405960722; // 22-12-2025 9:19hs

export const PRODUCT_TYPES = {
    SOLID: "solido",
    LIQUID: "liquido"
};

// Lista de versiones
const DB_NAMES = [
    "criollo_drones_1"
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
        supplies: [],
        completed: {
            params: false,
            control: false,
            supplies: false
        },
        selected: false // Esto se usa en la vista de listado
    };
};

const defaultFormParams = {
    productType: PRODUCT_TYPES.SOLID, // Tipo de producto.
    lotCoordinates: [], // Coordenadas del lote
    lotName: '', // Nombre del lote
    workArea: '', // Superficie a trabajar (ha)
    workVelocity: '', // Velocidad de trabajo (m/s)
    recolected: '', // Cantidad recolectada (kg o l)
    recolectedTime: '', // Tiempo de recolección (s)
    workWidth: '', // Ancho de trabajo (m)
    flightAltitude: '', // Altitud de vuelo (m)
    doseSolid: '', // Dosis para productos solidos (kg/ha)
    doseLiquid: '', // Dosis para productos liquidos (l/ha)

    nozzleCnt: '', // Cantidad de picos
    nozzleSeparation: '', // Separacion entre picos (m)
    recolectedData: [], // Datos de jarreo
    nozzleFlow: '', // Caudal de pico (l/min)

    samplingTimeMs: '', // Tiempo de muestreo verif. picos (ms)
    effectiveDose: '', // Dosis efectiva (kg/ha o l/ha)
    doseDiff: '', // Diferencia con dosis prevista (kg/ha o l/ha)
    doseDiffP: '', // Diferencia con dosis prevista (%)

    trayArea: '', // Superficie de bandejas (m²)
    trayCount: '', // Cantidad de bandejas
    traySeparation: '', // Separacion entre bandejas (m)
    trayData: [], // Datos de bandejas de muestreo
    solidProfile: [], // Perfil de distribucion (gr por bandeja)
    avgDist: '', // Promedio de distribucion (gr)
    stdDist: '', // Desviacion estandar de distribucion (gr)
    cvDist: '', // Coeficiente de variacion de distribucion (%)

    cardArea: '', // Superficie de tarjeta o espejo (cm²)
    cardCount: '', // Cantidad de tarjetas o espejos
    cardSeparation: '', // Separacion entre tarjetas o espejos (m)
    cardData: [], // Datos de tarjeta o espejo
    cardProfile: [], // Perfil de distribucion tarjetas/espejos (gotas por espejo o tarjeta)

    tankCapacity: '', // Capacidad del tanque (kg / l)
    loadBalancingEnabled: false, // Balanceo de cargas activado/desactivado
    supplies: [], // Insumos y cantidades

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