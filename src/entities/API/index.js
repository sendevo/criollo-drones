/** Misc */
const round2 = x => Math.round(x*100)/100;
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
    products: "Lista de productos"
};

const getParameterNames = paramList => paramList.map(key => parameterNames[key]).join(", ");

const checkParams = (schema, params) => { // Valida parametros y genera mensaje de error
    const wrongKeys = validate(schema, params);
    if(wrongKeys.length > 0) 
        throw new Error(`Parámetros incorrectos: ${getParameterNames(wrongKeys)}`);
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
    return round2(b + c * Math.sqrt(Pnom));
}

const K = (Qnom, Pnom) => 600*Qnom/Math.sqrt(Pnom);

export const computeVa = params => { // Q (volumen de aplicación)
    const p = toFloat(params);
    checkParams(schemas.computeVa, p);
    const { Pt, Vt, d, Qnom, Pnom, Dp } = p;
    const Va = Math.sqrt(Pt/Dp) * K(Qnom, Pnom) / Vt / d;
    return round2(Va);
};

export const computePt = params => { // pe (presión de trabajo)
    const p = toFloat(params);
    checkParams(schemas.computePt, p);
    const { Va, Vt, d, Qnom, Pnom, Dp } = p;
    const sqPt = Va * Vt * d / K(Qnom, Pnom);
    const Pt = round2(sqPt*sqPt)*Dp;
    return Pt;
};

export const computeVt = params => { // V (velocidad de trabajo)
    const p = toFloat(params);
    checkParams(schemas.computeVt, p);
    const { Va, Pt, d, Qnom, Pnom, Dp } = p;
    const Vt = K(Qnom, Pnom) * Math.sqrt(Pt/Dp) / Va / d;
    return round2(Vt);
};

export const computeQt = params => { // qe (Caudal efectivo)
    const p = toFloat(params);
    checkParams(schemas.computeQt, p);
    const { Qnom, Pnom, Pt } = p;
    const Qt = Math.sqrt(Pt/Pnom)*Qnom;
    return round2(Qt);
};

export const computeQd = params => { // Caudal de pulverizado ajustado por concentración
    const p = toFloat(params);
    checkParams(schemas.computeQd, p);
    const { Dnu, Cnu, Dp } = p;
    const Qd = Dnu * 100 / Cnu / Dp; // Caudal ajustado
    return round2(Qd);
};

export const computeQb = params => { // Caudal de bomba o pulverizado (qe * numero de picos)
    const p = toFloat(params);
    checkParams(schemas.computeQb, p);
    const Qb = computeQt(p)*p.n / Math.sqrt(p.Dp);
    return round2(Qb);
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
    const ef = round2(c / tms * 60000); // Caudal efectivo
    const s = round2((ef - Va) / Va * 100); // Desviacion estandar
    const ok = Math.abs(s) <= th; // Correcto 
    return { ef, s, ok };
};

export const computeSprayVolume = params => {
    const p = toFloat(params);
    checkParams(schemas.computeSprayVolume, p);
    const { Q, d, vel } = p;
    const vol = 600*Q / (d * vel);
    return round2(vol);
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