import { set2Decimals } from "../../utils";
import { PRODUCT_TYPES, SEEDING_DENSITY_UNITS } from "../Model";

const isString = value => (typeof value === 'string' || value instanceof String) && value !== "";
const isFloat = value => Number.isFinite(value);
const isPositiveFloat = value => Number.isFinite(value) && value > 0;
const isPositiveInteger = value => Number.isInteger(value) && value > 0;
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
        recolected: v => isPositiveFloat(v),
        recolected_time: v =>  isPositiveFloat(v),
        work_velocity: v => isPositiveFloat(v),
        work_width: v => isPositiveFloat(v),
        expected_dose: v => isPositiveFloat(v)
    },
    densToKgHa: {
        unit: v => isString(v) && Object.values(SEEDING_DENSITY_UNITS).includes(v),
        dens: v => isPositiveFloat(v),
        seedP1000: v => isPositiveFloat(v),
        seedPurity: v => isPositiveFloat(v) && v <= 100, // Pureza
        seedPG: v => isPositiveFloat(v) && v <= 100, // Poder germinativo
        plantingEfficiency: v => isPositiveFloat(v) && v <= 100, // Logro
    },
    densFromKgHa: {
        unit: v => isString(v) && Object.values(SEEDING_DENSITY_UNITS).includes(v),
        kg_ha: v => isPositiveFloat(v),
        seedP1000: v => isPositiveFloat(v),
        seedPurity: v => isPositiveFloat(v) && v <= 100,
        seedPG: v => isPositiveFloat(v) && v <= 100,
        plantingEfficiency: v => isPositiveFloat(v) && v <= 100
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
    sweepDistributionProfile: {
        tray_data: v => Array.isArray(v) && v.length > 0 && v.every(x => isFloat(x)),
        tray_distance: v => isPositiveFloat(v),
        pass_number: v => isPositiveFloat(v)
    },
    computeSuppliesList: {
        A: v => isPositiveFloat(v),
        T: v => isPositiveFloat(v),
        Va: v => isPositiveFloat(v),
        products: v => v?.length > 0 && v.every(x => isPositiveFloat(x.dose) && isString(x.name) && isFloat(x.presentation))
    }
};

export const presentationUnits = [
    "ml/ha", // 0
    "gr/ha", // 1
    "ml/100l", // 2
    "gr/100l", // 3
    "l/ha"
];

const LIQUID_DOSE_MODES = {
    ML_HA: "ml_ha",
    ML_100L: "ml_100l",
    G_HA: "g_ha",
    G_100L: "g_100l",
    L_HA: "l_ha"
};

const LEGACY_PRESENTATION_TO_MODE = {
    0: LIQUID_DOSE_MODES.ML_HA,
    1: LIQUID_DOSE_MODES.G_HA,
    2: LIQUID_DOSE_MODES.ML_100L,
    3: LIQUID_DOSE_MODES.G_100L,
    4: LIQUID_DOSE_MODES.L_HA
};

// Optional compatibility for newer explicit numeric dose-unit mappings.
const NUMERIC_DOSE_UNIT_TO_MODE = {
    0: LIQUID_DOSE_MODES.ML_HA,
    1: LIQUID_DOSE_MODES.ML_100L,
    2: LIQUID_DOSE_MODES.G_HA,
    3: LIQUID_DOSE_MODES.G_100L,
    4: LIQUID_DOSE_MODES.L_HA
};

const normalizeDoseUnitToken = token => {
    if(typeof token !== "string") return "";
    return token
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/á/g, "a");
};

const resolveLiquidDoseMode = prod => {
    if(Number.isInteger(prod?.doseUnit) && NUMERIC_DOSE_UNIT_TO_MODE[prod.doseUnit]) {
        return NUMERIC_DOSE_UNIT_TO_MODE[prod.doseUnit];
    }

    const token = normalizeDoseUnitToken(prod?.doseUnit);
    if(token === "ml/ha") return LIQUID_DOSE_MODES.ML_HA;
    if(token === "ml/100l") return LIQUID_DOSE_MODES.ML_100L;
    if(token === "gr/ha" || token === "g/ha") return LIQUID_DOSE_MODES.G_HA;
    if(token === "gr/100l" || token === "g/100l") return LIQUID_DOSE_MODES.G_100L;
    if(token === "l/ha") return LIQUID_DOSE_MODES.L_HA;

    return LEGACY_PRESENTATION_TO_MODE[prod?.presentation] || LIQUID_DOSE_MODES.ML_HA;
};

const getLiquidDoseUnitLabel = prod => {
    const mode = resolveLiquidDoseMode(prod);
    switch(mode) {
        case LIQUID_DOSE_MODES.ML_HA:
            return "ml/ha";
        case LIQUID_DOSE_MODES.ML_100L:
            return "ml/100l";
        case LIQUID_DOSE_MODES.G_HA:
            return "gr/ha";
        case LIQUID_DOSE_MODES.G_100L:
            return "gr/100l";
        case LIQUID_DOSE_MODES.L_HA:
            return "l/ha";
        default:
            return presentationUnits[prod?.presentation] || "";
    }
};

export const getProductDoseUnit = (prod, productType = PRODUCT_TYPES.LIQUID) => {
    if(productType === PRODUCT_TYPES.SOLID) {
        return "kg/ha";
    }

    return getLiquidDoseUnitLabel(prod);
};

export const getProductQuantityLabel = (prod, productType = PRODUCT_TYPES.LIQUID) => {
    if(productType === PRODUCT_TYPES.SOLID) {
        return "kg";
    }

    const mode = resolveLiquidDoseMode(prod);
    return [LIQUID_DOSE_MODES.ML_HA, LIQUID_DOSE_MODES.ML_100L, LIQUID_DOSE_MODES.L_HA].includes(mode) ? "l" : "kg";
};


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
    work_width: "Ancho de faja",
    work_pattern: "Patrón de trabajo",
    recolected: "Peso recolectado",
    recolected_time: "Tiempo",
    work_velocity: "Velocidad de trabajo",
    expected_dose: "Dosis prevista",
    seedVariety: "Variedad",
    seedName: "Nombre de semilla",
    seedP1000: "P1000",
    seedPurity: "Pureza",
    seedPG: "PG",
    plantingEfficiency: "Eficiencia de siembra",
    seedingDensity: "Densidad de siembra",
    seedingDensityUnit: "Unidad de densidad de siembra",
    doseSolid: "Dosis de sólidos"
};

export const getParameterNames = paramList => paramList.map(key => parameterNames[key]).join(", ");

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

const computeProductQuantityForLoad = (prod, loadQuantity, Va, productType) => { // Cantidad de insumo por carga
    if(productType === PRODUCT_TYPES.SOLID) {
        return loadQuantity * prod.dose / Va;
    }

    const mode = resolveLiquidDoseMode(prod);
    switch(mode) {
        case LIQUID_DOSE_MODES.ML_HA:
            return loadQuantity * prod.dose / Va;
        case LIQUID_DOSE_MODES.ML_100L:
            return loadQuantity * prod.dose / 100;
        case LIQUID_DOSE_MODES.G_HA:
            return loadQuantity * prod.dose / Va;
        case LIQUID_DOSE_MODES.G_100L:
            return loadQuantity * prod.dose / 100;
        case LIQUID_DOSE_MODES.L_HA:
            return loadQuantity * prod.dose / Va * 1000;
        default:
            return 0;
    }
};

const computeProductTotalForLot = (prod, area, applicationRate, totalApplication, productType) => {
    if(productType === PRODUCT_TYPES.SOLID) {
        return area * prod.dose;
    }

    const mode = resolveLiquidDoseMode(prod);
    switch(mode) {
        case LIQUID_DOSE_MODES.ML_HA:
            return area * prod.dose;
        case LIQUID_DOSE_MODES.ML_100L:
            return totalApplication * prod.dose / 100;
        case LIQUID_DOSE_MODES.G_HA:
            return area * prod.dose;
        case LIQUID_DOSE_MODES.G_100L:
            return totalApplication * prod.dose / 100;
        case LIQUID_DOSE_MODES.L_HA:
            return area * prod.dose * 1000;
        default:
            return 0;
    }
};

const isLiquidVolumeMode = prod => {
    const mode = resolveLiquidDoseMode(prod);
    return mode === LIQUID_DOSE_MODES.ML_HA || mode === LIQUID_DOSE_MODES.ML_100L || mode === LIQUID_DOSE_MODES.L_HA;
};

const getLiquidVolumeLitersForLoad = (prod, loadQuantity, applicationRate) => {
    if(!isLiquidVolumeMode(prod)) return 0;
    return computeProductQuantityForLoad(prod, loadQuantity, applicationRate, PRODUCT_TYPES.LIQUID) / 1000;
};

const getLiquidVolumeLitersForTotal = (prod, area, applicationRate, totalApplication) => {
    if(!isLiquidVolumeMode(prod)) return 0;
    return computeProductTotalForLot(prod, area, applicationRate, totalApplication, PRODUCT_TYPES.LIQUID) / 1000;
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
    const dr = recolected/recolected_time*60;
    const ta = work_width*work_velocity/6000;
    return { status: "success", dose, diffkg, diffp, dr, ta };
};

export const densToKgHa = params => {
    const wrong_keys = validate(schemas.densToKgHa, params);
    if(wrong_keys.length > 0) return {status: "error", wrong_keys};

    const { 
        unit, 
        dens,
        seedP1000, 
        seedPurity, 
        seedPG, 
        plantingEfficiency 
    } = params;

    let kg_ha = 0;
    switch(unit) {
        case SEEDING_DENSITY_UNITS.POBL_OBJ:
            kg_ha = dens*seedP1000/seedPurity/seedPG/plantingEfficiency;  
            break;
        case SEEDING_DENSITY_UNITS.SEM_HA:
            kg_ha = dens*seedP1000/seedPurity/10000;
            break;
        case SEEDING_DENSITY_UNITS.SEM_VBLES_HA:
            kg_ha = dens*seedP1000/seedPG/10000;
            break;
        default:
            return {status: "error", wrong_keys: ["unit"]};
    }

    return { status: "success", kg_ha };
}

export const densFromKgHa = params => {
    const wrong_keys = validate(schemas.densFromKgHa, params);
    if(wrong_keys.length > 0) return {status: "error", wrong_keys};

    const { 
        unit, 
        kg_ha,
        seedP1000, 
        seedPurity, 
        seedPG, 
        plantingEfficiency 
    } = params;

    let dens = 0;
    switch(unit) {
        case SEEDING_DENSITY_UNITS.POBL_OBJ:
            dens = kg_ha*seedPurity*seedPG*plantingEfficiency/seedP1000;  
            break;
        case SEEDING_DENSITY_UNITS.SEM_HA:
            dens = kg_ha*seedPurity/seedP1000*10000;
            break;
        case SEEDING_DENSITY_UNITS.SEM_VBLES_HA:
            dens = kg_ha*seedPG/seedP1000*10000;
            break;
        default:
            return {status: "error", wrong_keys: ["unit"]};
    }

    return { status: "success", dens };
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
    const solidProfile = tray_data.map(x => x/pass_number); // Perfil resultante
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
                solidProfile[i] += tray_data[tray_number - s + i]/pass_number;
                solidProfile[tray_number - 1 - i] += tray_data[s - i - 1]/pass_number;                    
            }
        }else{
            for(let i = 0; i < s; i++) {
                solidProfile[i] += tray_data[s - i - 1]/pass_number;
                solidProfile[tray_number - 1 - i] += tray_data[tray_number - s + i]/pass_number;
            } 
        }       
        r++; // Siguiente pasada
        s = get_s(r); // Solapamiento en la siguiente pasada
    }
    // Calcular promedio y desvios
    const sum = solidProfile.reduce((a, b) => a + b, 0);
    const avg = sum / solidProfile.length; // Promedio de la distribución
    const sqdiff = solidProfile.map(x => Math.pow(x - avg, 2));
    const dst = Math.sqrt(sqdiff.reduce((a, b) => a + b, 0) / (solidProfile.length-1)); // Desvio estandar
    const cv = avg === 0 ? 0 : dst/avg*100; // Coeficiente de variacion

    return {status: "success", solidProfile, avg, dst, cv};
};

export const sweepDistributionProfile = params => {
    const p = toFloat(params);

    const wrongKeys = checkParams(schemas.sweepDistributionProfile, p);
    if(wrongKeys && wrongKeys.length > 0) {
        return {
            status: "error",
            wrongKeys: parameterNames[wrongKeys[0]]
        };
    }

    const {tray_data, tray_distance, pass_number} = p;
    const workWidthMin = tray_distance;
    const workWidthMax = tray_data.length * tray_distance;

    const lineal = [];
    const circular = [];

    for(let work_width = workWidthMin; work_width <= workWidthMax + Number.EPSILON; work_width += tray_distance) {
        lineal.push({
            ...computeDistributionProfile({
                tray_data,
                tray_distance,
                pass_number,
                work_width,
                work_pattern: "lineal"
            }),
            work_width
        });

        circular.push({
            ...computeDistributionProfile({
                tray_data,
                tray_distance,
                pass_number,
                work_width,
                work_pattern: "circular"
            }),
            work_width
        });
    }

    return {
        status: "success",
        lineal,
        circular,
        wwRange: {
            min: workWidthMin,
            max: workWidthMax,
            step: tray_distance
        }
    };
};

export const computeSuppliesList = params => { // Lista de insumos y cargas para mezcla   
    const p = toFloat(params);
    checkParams(schemas.computeSuppliesList, p);
    const { A, T, Va, products, productType = PRODUCT_TYPES.LIQUID } = p;
    const totalApplication = A * Va;
    const Nc = totalApplication / T; // Cantidad teórica de cargas
    const Ncc = Math.floor(Nc); // Cargas completas
    const Vf = Math.max(0, totalApplication - Ncc * T); // Carga fraccional
    const Ncb = Math.ceil(Nc); // Cargas equilibradas
    const Vcb = Ncb > 0 ? totalApplication / Ncb : 0; // Tamaño de carga equilibrada
    const Vftl = Vf > 0 && Vf / T < 0.2; // Carga fraccional menor al 20%

    const normalizeQuantity = value => productType === PRODUCT_TYPES.SOLID ? value : value / 1000;

    // Calcular cantidades por carga y total por producto.
    const pr = products.map(prod => {
        const quantityPerFullLoad = computeProductQuantityForLoad(prod, T, Va, productType);
        const quantityPerFractionalLoad = computeProductQuantityForLoad(prod, Vf, Va, productType);
        const quantityPerBalancedLoad = computeProductQuantityForLoad(prod, Vcb, Va, productType);
        const quantityTotalLot = computeProductTotalForLot(prod, A, Va, totalApplication, productType);

        const normalizedCpp = normalizeQuantity(quantityPerFullLoad);
        const normalizedCfc = normalizeQuantity(quantityPerFractionalLoad);
        const normalizedCeq = normalizeQuantity(quantityPerBalancedLoad);
        const normalizedTotal = normalizeQuantity(quantityTotalLot);

        const packageSize = productType === PRODUCT_TYPES.SOLID ? Number(prod.presentation) : 0;
        const hasPackages = productType === PRODUCT_TYPES.SOLID && Number.isFinite(packageSize) && packageSize > 0;

        return {
            ...prod,
            cpp: normalizedCpp,
            cfc: normalizedCfc,
            ceq: normalizedCeq,
            total: normalizedTotal,
            packageSize: hasPackages ? packageSize : 0,
            cppPackages: hasPackages ? normalizedCpp / packageSize : null,
            cfcPackages: hasPackages ? normalizedCfc / packageSize : null,
            ceqPackages: hasPackages ? normalizedCeq / packageSize : null,
            totalPackages: hasPackages ? normalizedTotal / packageSize : null,
        };
    });

    if (productType === PRODUCT_TYPES.LIQUID) {
        const getMixtureProductVolumeForLoad = loadQuantity => products
            .reduce((acc, prod) => acc + getLiquidVolumeLitersForLoad(prod, loadQuantity, Va), 0);

        const totalProductVolumeLiters = products
            .reduce((acc, prod) => acc + getLiquidVolumeLitersForTotal(prod, A, Va, totalApplication), 0);

        const water = {
            key: 'water',
            name: 'Agua',
            dose: 0,
            presentation: 4,
            cpp: set2Decimals(Math.max(0, T - getMixtureProductVolumeForLoad(T))),
            cfc: set2Decimals(Math.max(0, Vf - getMixtureProductVolumeForLoad(Vf))),
            ceq: set2Decimals(Math.max(0, Vcb - getMixtureProductVolumeForLoad(Vcb))),
            total: set2Decimals(Math.max(0, totalApplication - totalProductVolumeLiters)),
            isWater: true
        };

        pr.push(water);
    }

    return {
        pr,
        Nc,
        Ncc,
        Vf,
        Ncb,
        Vcb,
        Vftl,
        productType,
        totalApplication,
        theoreticalLoads: Nc,
        unbalanced: {
            fullLoads: Ncc,
            fractionalLoad: Vf
        },
        balanced: {
            loads: Ncb,
            loadSize: Vcb
        }
    };
};