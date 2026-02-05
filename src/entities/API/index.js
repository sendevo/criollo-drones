import { set2Decimals } from "../../utils";

const isString = value => (typeof value === 'string' || value instanceof String) && value !== "";
const isFloat = value => Number.isFinite(value);
const isPositiveFloat = value => Number.isFinite(value) && value > 0;
const toFloat = obj => Object.keys(obj)
    .reduce((acc, key) => {
        // Convert the value to a float if it's a string that can be parsed as a float, else keep it as is
        const value = obj[key];
        acc[key] = typeof value === 'string' && !isNaN(value) ? parseFloat(value) : value;
        return acc;
    }, {});


const schemas = { // Esquemas de validación de parametros
    computeQNom:{
        b: v => isFloat(v),
        c: v => isFloat(v),
        Pnom: v => isFloat(v)
    },
    computeVa:{        
        Pt: v => isFloat(v),
        Vt: v => isPositiveFloat(v),
        d: v => isPositiveFloat(v),
        Dp: v => isPositiveFloat(v),
        Qnom: v => isPositiveFloat(v),
        Pnom: v => isPositiveFloat(v)
    },
    computePt:{
        Va: v => isPositiveFloat(v),
        Vt: v => isPositiveFloat(v),
        d: v => isPositiveFloat(v),
        Dp: v => isPositiveFloat(v),
        Qnom: v => isPositiveFloat(v),
        Pnom: v => isPositiveFloat(v)
    },
    computeVt:{
        Va: v => isPositiveFloat(v),
        Pt: v => isPositiveFloat(v),
        d: v => isPositiveFloat(v),
        Dp: v => isPositiveFloat(v),
        Qnom: v => isPositiveFloat(v),
        Pnom: v => isPositiveFloat(v)
    },
    computeQt: {
        Qnom: v => isPositiveFloat(v),
        Pnom: v => isPositiveFloat(v),
        Pt: v => isPositiveFloat(v)
    },
    computeQd: {
        Dnu: v => isPositiveFloat(v),
        Cnu: v => isPositiveFloat(v) && v <= 100,
        Dp: v => isPositiveFloat(v)
    },
    computeQb: {
        n: v => isPositiveFloat(v),
        Qnom: v => isPositiveFloat(v),
        Pnom: v => isPositiveFloat(v),
        Pt: v => isPositiveFloat(v),
        Dp: v => isPositiveFloat(v)
    },
    computeQa: {
        Dp: v => isPositiveFloat(v),
    },
    computeEffectiveFlow:{
        c: v => isPositiveFloat(v),
        tms: v => isPositiveFloat(v),
        Va: v => isPositiveFloat(v)
    },
    computeSprayVolume:{
        Q: v => isPositiveFloat(v),
        d: v => isPositiveFloat(v),
        vel: v => isPositiveFloat(v)
    },
    computeDose: {
        recolected_time: v =>  isPositiveFloat(v),
        work_velocity: v => isPositiveFloat(v)
    },
    computeDensityFromRecolected: {
        tray_area: v => isPositiveFloat(v),
        recolected: v => isPositiveFloat(v),
        pass_number: v => isPositiveInteger(v)
    },
    computeDistributionProfile:{
        tray_data: v => Array.isArray(v) && v.length > 0 && v.every(x => isFloat(x)),
        tray_distance: v => isPositiveFloat(v),
        pass_number: v => isPositiveFloat(v),
        work_width: v => isPositiveFloat(v),
        work_pattern: v => isString(v) && (v === "circular" || v === "lineal")
    },
    computeSuppliesList: {
        A: v => isPositiveFloat(v),
        T: v => isPositiveFloat(v),
        Va: v => isPositiveFloat(v),
        products: v => v?.length > 0 && v.every(x => isPositiveFloat(x.dose) && isString(x.name) && Number.isInteger(x.presentation))
    }
};

export const presentationUnits = [
    "ml/ha", // 0
    "gr/ha", // 1
    "ml/100l", // 2
    "gr/100l", // 3
    "l/ha"
];


/** Validación de lista de parametros */
const validate = (schema, object) => Object.keys(schema)
    .filter(key => object ? !schema[key](object[key]) : false)
    .map(key => key);

// Nombres de los parametros para mostrar en mensajes de error
const parameterNames = { // Al costado, notación de la documentación
    Qnom: "Caudal nominal", // qn
    Pnom: "Presión nominal", // pn
    Qb: "Caudal de bomba", // qe * numero de picos
    d: "Distancia entre picos",
    n: "Número de picos",
    Pt: "Presión de trabajo", // pe (presión efectiva)
    Va: "Volumen de aplicación", // Q
    Vt: "Velocidad de trabajo", // V
    Dp: "Densidad de producto", // D
    Dnu: "Dosis de nutriente", // Dnu
    Cnu: "Concentración de nutriente", // Cnu
    c: "Volumen recolectado",
    tms: "Tiempo de muestreo",
    A: "Superficie de trabajo", 
    T: "Capacidad del tanque", 
    products: "Lista de productos",
    tray_data: "Datos de bandejas",
    tray_distance: "Distancia entre bandejas",
    pass_number: "Número de pasadas",
    work_width: "Ancho de trabajo",
    work_pattern: "Patrón de trabajo"
};

const getParameterNames = paramList => paramList.map(key => parameterNames[key]).join(", ");

const checkParams = (schema, params) => { // Valida parametros y genera mensaje de error
    const wrongKeys = validate(schema, params);
    if(wrongKeys.length > 0) {
        console.error(`Parámetros incorrectos: ${getParameterNames(wrongKeys)}`);
        return wrongKeys;
    }
    return null;
};


/** Tamaño de gota */
export const dropletSizeProperties = { // Colores de los rangos de tamaño de gota
    "UC": {
        background: "black",
        color: "white",
        description_en: "Ultra coarse",
        description: "Ultra grueso",
        label_es: "UG"
    },
    "XC": {
        background: "white",
        color: "black",
        description_en: "Coarse",
        description: "Extra grueso",
        label_es: "EG"
    },
    "VC": {
        background: "blue",
        color: "white",
        description_en: "Very coarse",
        description: "Muy grueso",
        label_es: "MG"
    },
    "C": {
        background: "green",
        color: "white",
        description_en: "Coarse",
        description: "Grueso",
        label_es: "G"
    },
    "M": {
        background: "yellow",
        color: "black",
        description_en: "Medium",
        description: "Medio",
        label_es: "M"
    },
    "F": {
        background: "orange",
        color: "black",
        description_en: "Fine",
        description: "Fino",
        label_es: "F"
    },
    "VF": {
        background: "red",
        color: "white",
        description_en: "Very fine",
        description: "Muy fino",
        label_es: "MF"
    },
    "XF": {
        background: "purple",
        color: "white",
        description_en: "Extra fine",
        description: "Extra fino",
        label_es: "EF"
    }
};

export const getDropletSizeLabel = (pressure, ranges) => {
    const size = ranges.find(range => pressure >= range.from && pressure <= range.to);
    return size ? (dropletSizeProperties[size.label] ? dropletSizeProperties[size.label].label_es : null) : null;
};

export const getDropletSizeName = (pressure, ranges) => {
    const size = ranges.find(range => pressure >= range.from && pressure <= range.to);
    return size ? (dropletSizeProperties[size.label] ? dropletSizeProperties[size.label].description : null) : null;
};


/** Cálculos de aplicación */

export const computeQNom = params => { // qn (Caudal nominal de pico)
    const p = toFloat(params);
    checkParams(schemas.computeQNom, p);
    const {b, c, Pnom} = p;
    return set2Decimals(b + c * Math.sqrt(Pnom));
}

const K = (Qnom, Pnom) => 600*Qnom/Math.sqrt(Pnom);

export const computeVa = params => { // Q (volumen de aplicación)
    const p = toFloat(params);
    checkParams(schemas.computeVa, p);
    const { Pt, Vt, d, Qnom, Pnom, Dp } = p;
    const Va = Math.sqrt(Pt/Dp) * K(Qnom, Pnom) / Vt / d;
    return set2Decimals(Va);
};

export const computePt = params => { // pe (presión de trabajo)
    const p = toFloat(params);
    checkParams(schemas.computePt, p);
    const { Va, Vt, d, Qnom, Pnom, Dp } = p;
    const sqPt = Va * Vt * d / K(Qnom, Pnom);
    const Pt = set2Decimals(sqPt*sqPt)*Dp;
    return Pt;
};

export const computeVt = params => { // V (velocidad de trabajo)
    const p = toFloat(params);
    checkParams(schemas.computeVt, p);
    const { Va, Pt, d, Qnom, Pnom, Dp } = p;
    const Vt = K(Qnom, Pnom) * Math.sqrt(Pt/Dp) / Va / d;
    return set2Decimals(Vt);
};

export const computeQt = params => { // qe (Caudal efectivo)
    const p = toFloat(params);
    checkParams(schemas.computeQt, p);
    const { Qnom, Pnom, Pt } = p;
    const Qt = Math.sqrt(Pt/Pnom)*Qnom;
    return set2Decimals(Qt);
};

export const computeQd = params => { // Caudal de pulverizado ajustado por concentración
    const p = toFloat(params);
    checkParams(schemas.computeQd, p);
    const { Dnu, Cnu, Dp } = p;
    const Qd = Dnu * 100 / Cnu / Dp; // Caudal ajustado
    return set2Decimals(Qd);
};

export const computeQb = params => { // Caudal de bomba o pulverizado (qe * numero de picos)
    const p = toFloat(params);
    checkParams(schemas.computeQb, p);
    const Qb = computeQt(p)*p.n / Math.sqrt(p.Dp);
    return set2Decimals(Qb);
};

export const computeQa = params => { // Caudal equivalente en agua
    const p = toFloat(params);
    checkParams(schemas.computeVa, p);
    const Va = computeVa(p);
    const { Dp } = p;
    return Va*Math.sqrt(Dp);
};

export const computeEffectiveFlow = params => {
    const p = toFloat(params);
    checkParams(schemas.computeEffectiveFlow, p);
    const { c, tms, Va } = p;
    const th = 10; // Umbral en porcentaje
    const ef = set2Decimals(c / tms * 60000); // Caudal efectivo
    const s = set2Decimals((ef - Va) / Va * 100); // Desviacion estandar
    const ok = Math.abs(s) <= th; // Correcto 
    return { ef, s, ok };
};

export const computeSprayVolume = params => {
    const p = toFloat(params);
    checkParams(schemas.computeSprayVolume, p);
    const { Q, d, vel } = p;
    const vol = 600*Q / (d * vel);
    return set2Decimals(vol);
};

const computeProductVolume = (prod, vol, Va) => { // Cantidad de insumo (gr, ml o l) por volumen de agua
    switch(prod.presentation) {
        case 0: // ml/ha
        case 1: // ml/100L
            return vol*prod.dose/Va;
        case 2: // gr/ha
        case 3: // gr/100L
            return vol*prod.dose/100;
        case 4: // L/ha
            return vol*prod.dose/Va*1000;
        default:
            return 0;
    }   
};

export const computeDose = params => { 
    // Dosis a partir de tiempo y velocidad de avance
    const wrong_keys = validate(schemas.computeDose, params);
    if(wrong_keys.length > 0) return {status: "error", wrong_keys};
    const { recolected, work_velocity, recolected_time, work_width, expected_dose } = params;
    const distance = work_velocity*recolected_time*10/36;
    const dose = recolected/distance/work_width*10000;
    const diffkg = dose-expected_dose;
    const diffp = diffkg/expected_dose*100;
    return { status: "success", dose, diffkg, diffp };
};

export const computeDensityFromRecolected = params => { 
    // Densidad a partir de lo recolectado en bandeja
    const wrong_keys = validate(schemas.computeDensityFromRecolected, params);
    if(wrong_keys.length > 0) return {status: "error", wrong_keys};
    const {recolected, pass_number, tray_area} = params;
    const density = recolected/pass_number/tray_area*10;
    return {status: "success", density};
};

export const computeDistributionProfile = params => {
    
    const p = toFloat(params);

    const wrongKeys = checkParams(schemas.computeDistributionProfile, p);
    
    if(wrongKeys && wrongKeys.length > 0) {
        return {
            status:"error",
            wrongKeys: parameterNames[wrongKeys[0]]
        };
    }

    const {tray_data, tray_distance, pass_number, work_width, work_pattern} = p;
    const tray_number = tray_data.length;
    const profile = tray_data.map(x => x/pass_number); // Perfil resultante
    const tw = tray_distance * tray_number; // Ancho maximo (hasta donde llegan las bandejas)

    // Solapamiento
    let r = 1; // Numero de pasada hacia los laterales
    const get_s = r => Math.floor((tw - r * work_width) / tray_distance);
    let s = get_s(r);   
    while(s > 0) { // Mientras haya solapamiento                       
        // Si es patron circular, siempre se solapa en el mismo sentido
        // si el patron es ida y vuelta, se suma una vez de cada lado
        const side = work_pattern === "circular" ? "left" : r%2===0 ? "left" : "right";
        if(side === "left"){
            for(let i = 0; i < s; i++) {
                profile[i] += tray_data[tray_number - s + i]/pass_number;
                profile[tray_number - 1 - i] += tray_data[s - i - 1]/pass_number;                    
            }
        }else{
            for(let i = 0; i < s; i++) {
                profile[i] += tray_data[s - i - 1]/pass_number;
                profile[tray_number - 1 - i] += tray_data[tray_number - s + i]/pass_number;
            } 
        }       
        r++; // Siguiente pasada
        s = get_s(r); // Solapamiento en la siguiente pasada
    }
    // Calcular promedio y desvios
    const sum = profile.reduce((a, b) => a + b, 0);
    const avg = sum / profile.length; // Promedio de la distribución
    const sqdiff = profile.map(x => Math.pow(x - avg, 2));
    const dst = Math.sqrt(sqdiff.reduce((a, b) => a + b, 0) / (profile.length-1)); // Desvio estandar
    const cv = avg === 0 ? 0 : dst/avg*100; // Coeficiente de variacion

    return {status: "success", profile, avg, dst, cv};
};

export const computeSuppliesList = params => { // Lista de insumos y cargas para mezcla   
    const p = toFloat(params);
    checkParams(schemas.computeSuppliesList, p);
    const { A, T, Va, products } = p;
    const Nc = A*Va/T; // Cantidad de cargas
    const Ncc = Math.floor(Nc); // Cantidad de cargas completas
    const Vf = (Nc - Ncc)*T; // Volumen fraccional [L]
    const Ncb = Math.ceil(Nc); // Cantidad de cargas balanceadas
    const Vcb = A*Va/Ncb; // Volumen de cargas balanceadas
    const Vftl = Vf/T < 0.2; // Detectar volumen fraccional total menor a 20%
    // Calcular cantidades de cada producto
    const pr = products.map(prod => ({
        ...prod, // Por comodidad, dejar resto de los detalles en este arreglo
        cpp: computeProductVolume(prod, T, Va)/1000, // Cantidad por carga completa [l o kg]
        cfc: computeProductVolume(prod, Vf, Va)/1000, // Cantidad por carga fraccional [l o kg]
        ceq: computeProductVolume(prod, Vcb, Va)/1000, // Cantidad por carga equilibrada [l o kg]
        total: computeProductVolume(prod, T, Va)*Nc/1000, // Cantidad total de insumo [l o kg]
    }));
    return {pr, Nc, Ncc, Vf, Ncb, Vcb, Vftl};
};