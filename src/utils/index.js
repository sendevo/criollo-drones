import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Geolocation } from '@capacitor/geolocation';


export const set2Decimals = value => Math.round(value * 100) / 100;

export const parseNumericValue = value => {
    if (value === '' || value === null || value === undefined) return '';

    const text = String(value).trim();
    if (!text) return '';

    const sign = text.startsWith('-') ? -1 : 1;
    const sanitized = text.replace(/-/g, '').replace(/\s/g, '');

    if (sanitized.includes(',') && sanitized.includes('.')) {
        const decimalIndex = Math.max(sanitized.lastIndexOf(','), sanitized.lastIndexOf('.'));
        const integerPart = sanitized.slice(0, decimalIndex).replace(/[.]/g, '').replace(/[,]/g, '');
        const fractionPart = sanitized.slice(decimalIndex + 1).replace(/[.]/g, '').replace(/[,]/g, '');
        const normalized = `${integerPart}.${fractionPart}`;
        const parsed = Number(normalized);
        return Number.isFinite(parsed) ? parsed * sign : '';
    }

    if (sanitized.includes(',')) {
        const parsed = Number(sanitized.replace(/\./g, '').replace(',', '.'));
        return Number.isFinite(parsed) ? parsed * sign : '';
    }

    if (sanitized.includes('.')) {
        const parts = sanitized.split('.');

        if (parts.length > 2) {
            const parsed = Number(parts.join(''));
            return Number.isFinite(parsed) ? parsed * sign : '';
        }

        const [integerPart, decimalPart] = parts;
        if (decimalPart && decimalPart.length <= 2 && integerPart.length > 0) {
            const parsed = Number(sanitized);
            return Number.isFinite(parsed) ? parsed * sign : '';
        }

        const parsed = Number(integerPart + decimalPart);
        return Number.isFinite(parsed) ? parsed * sign : '';
    }

    const parsed = Number(sanitized);
    return Number.isFinite(parsed) ? parsed * sign : '';
};

export const parseNonNegativeNumber = value => {
    const parsed = parseNumericValue(value);
    if (parsed === '') return '';
    return Math.abs(parsed);
};

export const formatNumericValue = value => {
    if (value === '' || value === null || value === undefined) return '';

    const number = typeof value === 'number' ? value : parseNumericValue(value);
    if (number === '' || !Number.isFinite(number)) return '';

    const rounded = Number(number.toFixed(10));
    const [integerPart, decimalPart = ''] = rounded.toString().split('.');
    const groupedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const trimmedDecimal = decimalPart.replace(/0+$/, '');

    return trimmedDecimal ? `${groupedInteger},${trimmedDecimal}` : groupedInteger;
};

export const formatNumber = (value, decimals = 2) => {
    const v = value === "number" ? value : parseFloat(value);
    return v.toFixed(decimals).replace('.', ',');
}
export const generateId = () => "_" + Math.random().toString(36).substr(2) + Date.now();

export const arrayAvg = (arr, attr) => arr.reduce((a, b) => a + b[attr], 0) / arr.length;

export const getClosest = (array, attr, value) => {
    const diffArr = array.map(v => Math.abs(value - v[attr]));
    const closestValue = Math.min(...diffArr);
    const index = diffArr.findIndex(v => v === closestValue);
    return array[index];
};


export const uniformRandom = (min, max) => {
    return Math.random() * (max - min) + min;
};

export const selectRandomFromArray = (array) => {
    const index = Math.floor(Math.random() * array.length);
    return array[index];
};

export const importAll = r => {
    let images = {};
    r.keys().forEach(item => {
        images[item.replace('./', '')] = r(item);
    });
    return images
};

export const getLastNonEmptyRowIndex = matrix => {
    for (let i = matrix.length - 1; i >= 0; i--) {
        if (matrix[i].some(cell => cell !== null && cell !== undefined && cell !== '')) {
            return i;
        }
    }
    return -1;
}

export const requestLocationPermissions = () => {
    return new Promise( (resolve, reject) => {        
        Geolocation.checkPermissions().then(permissions => {                        
            if(permissions.location === "granted"){ 
                resolve();
            }else{
                Geolocation.requestPermissions()
                .then( res => {
                    if(res.location === "granted"){
                        resolve();
                    }else{
                        reject("Permisos de ubicación no otorgados");
                    }
                })
                .catch( err => {
                    reject(err);
                });
            }
        });
    });
};

export const getLocation = () => {
    return new Promise( (resolve, reject) => {        
        requestLocationPermissions()
        .then( () => {
            Geolocation.getCurrentPosition()
            .then( position => {
                const coords = [position.coords.latitude, position.coords.longitude];
                resolve(coords);
            })
            .catch( err => {
                reject({...err, type: "getLocation" });
            });
        })
        .catch( err => {
            reject({...err, type: "locationPermissions" });
        });
    });
};


// Métodos para guardar y compartir archivos
const shareFile = async (fileName, directory = Directory.Documents, feedback = () => {}) => {
    try {
        const {uri} = await Filesystem.getUri({
            path: fileName,
            directory,
        });

        await Share.share({
            title: 'Reporte',
            text: 'Aquí tienes el reporte solicitado',
            url: uri,
            dialogTitle: 'Compartir reporte',
        });

        feedback("success", "Reporte compartido", 2000, "center");
    } catch (error) {
        console.error("Error al compartir:", error.message);
        feedback("error", "Reporte no compartido", 2000, "center");
    }
};

// Guardar archivo en el sistema de archivos y opcionalmente compartirlo
const saveFile = async (fileName, base64pdf, share = false, feedback = () => {}) => {
    try {
        await Filesystem.writeFile({
            path: fileName,
            data: base64pdf,
            directory: Directory.Documents,
            recursive: true,
            replace: true,
        });

        if (share) {
            feedback("info", "Generando reporte...", 2000, "center");
            await shareFile(fileName, Directory.Documents, feedback);
        } else {
            feedback("success", `Reporte guardado en Documentos: ${fileName}`, 2000, "center");
        }
    } catch (err) {
        console.error("Error al guardar:", err);
        feedback("error", "Error al guardar el reporte", 2000, "center");
    }
};

export const handleSaveReport = async (fileName, base64pdf, share = false, feedback = () => {}) => {
    try {
        const permissions = await Filesystem.checkPermissions();

        if (permissions.publicStorage === 'granted') {
            await saveFile(fileName, base64pdf, share, feedback);
        } else {
            feedback("info", "Permisos de almacenamiento no otorgados", 2000, "center");
            const res = await Filesystem.requestPermissions();
            if (res.publicStorage === 'granted') {
                await saveFile(fileName, base64pdf, share, feedback);
            }
        }
    } catch (err) {
        console.error("Permisos/guardar error:", err);
        feedback("error", "No se pudo guardar el reporte", 2000, "center");
    }
};