import pdfMake from "pdfmake";
import vfs from "pdfmake/build/vfs_fonts.js";
import moment from 'moment';
import Toast from '../../components/Toast';
import { formatNumber, handleSaveReport, sanitizeTypedValue } from "../../utils";
import { getProductDoseUnit, getProductQuantityLabel } from "../API";
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { PRODUCT_TYPES } from "../Model";

import { logoCriollo, membreteCriollo } from '../../assets/base64';

pdfMake.vfs = vfs;

const styles = { // Definicion de estilos de las secciones del reporte
    header: {
        fontSize: 18,
        bold: true,
        alignment: "center",
        margin: [0, 0, 0, 15] //[left, top, right, bottom]
    },
    subheader: {
        fontSize: 16,
        bold: true,
        margin: [0, 10, 0, 10]
    },
    section: {
        fontSize: 14,
        bold: true,
        margin: [0, 10, 0, 10]
    },
    subsection: {
        fontSize: 14,
        bold: false,
        margin: [0, 10, 0, 10]
    },
    text: {
        fontSize: 12,
        bold: false,
        margin: [0, 3, 0, 3]
    },
    tableHeader: {
        bold: true,
        fontSize: 13,
        color: 'black'
    }
};

const reportHeader = { // Lo que aparece en cada pagina
    image: logoCriollo, // Logo base 64
    width: 50,
    margin: [10,10,10,10],
    alignment: "right"
};

const reportFooter = {
    image: membreteCriollo, // Membrete
    width: 350,
    margin: [15,10,10,10],
    alignment: "left"
};


const PDFExport = async (report, share) => {

    const getProductTypeLabel = productType => productType === PRODUCT_TYPES.LIQUID ? "Líquidos" : "Sólidos";

    const reportContent = [ // Composicion de todo el documento
        {
            text: "Criollo Drones",
            style: "header"
        },
        {
            text: "Reporte de la labor",
            style: "subheader"
        },
        {
            text: "   Nombre: " + report.name,
            style: "subheader"
        },
        {
            text: "   Fecha y hora: " + moment(report.timestamp).format("DD/MM/YYYY HH:mm"),
            style: "subheader"
        }
    ];

    if(report.completed.params) {
        
        reportContent.push({
            text: "Parámetros de aplicación",
            style: "subsection"
        });

        reportContent.push({
            layout: 'lightHorizontalLines',
            table: {
                headerRows: 0,
                widths: ['*', '*'],
                body: [
                    [{
                        text: "Producto a aplicar:",
                        style: "tableHeader"
                    }, getProductTypeLabel(report.params.productType)],
                    [{
                        text: "Ancho de faja:",
                        style: "tableHeader"
                    }, formatNumber(report.params.workWidth) + " m"],
                    [{
                        text: "Velocidad de trabajo:",
                        style: "tableHeader"
                    }, formatNumber(report.params.workVelocity) + " km/h"],
                    [{
                        text: "Altura de vuelo:",
                        style: "tableHeader"
                    }, formatNumber(report.params.flightAltitude) + " m"]
                ]
            },
            margin: [0, 0, 0, 15]
        });

        if(report.params.nozzleCnt){
            reportContent[reportContent.length - 1].table.body.push(
                [{
                    text: "Cantidad de picos",
                    style: "tableHeader"
                }, report.params.nozzleCnt]
            );
        }

        const seedData = report.params?.seedMode ? report.params : null;

        if(seedData?.seedMode) {
            const seedRows = [];

            if(seedData.seedVariety) {
                seedRows.push([
                    {
                        text: "Híbrido o variedad:",
                        style: "tableHeader"
                    }, seedData.seedVariety
                ]);
            }
            if(seedData.seedName) {
                seedRows.push([
                    {
                        text: "Semilla:",
                        style: "tableHeader"
                    }, seedData.seedName
                ]);
            }
            if(seedData.seedP1000) {
                seedRows.push([
                    {
                        text: "Peso de 1000 semillas:",
                        style: "tableHeader"
                    }, seedData.seedP1000
                ]);
            }
            if(seedData.seedPurity) {
                seedRows.push([
                    {
                        text: "Pureza:",
                        style: "tableHeader"
                    }, seedData.seedPurity + " %"
                ]);
            }
            if(seedData.seedPG) {
                seedRows.push([
                    {
                        text: "Poder germinativo:",
                        style: "tableHeader"
                    }, seedData.seedPG + " gr"
                ]);
            }
            if(seedData.seedEfficiency) {
                seedRows.push([
                    {
                        text: "Eficiencia de implantación:",
                        style: "tableHeader"
                    }, seedData.seedEfficiency+" %"
                ]);
            }
            if(seedData.seedDensity && seedData.seedDensityUnit !== "Kg/ha") {
                seedRows.push([
                    {
                        text: "Densidad de siembra:",
                        style: "tableHeader"
                    }, sanitizeTypedValue(seedData.seedDensity.toString()) + " " + seedData.seedDensityUnit
                ]);
            }

            if(seedRows.length > 0) {
                reportContent[reportContent.length - 1].table.body.push(...seedRows);    
            }
        }
        if(report.params.productDensity){
            reportContent[reportContent.length - 1].table.body.push(
                [{
                    text: "Densidad del producto",
                    style: "tableHeader"
                }, formatNumber(report.params.productDensity, 2) + " kg/l"]
            );
        }
    }

    if(report.completed.control) {
        const controlRows = [
            [{
                text: "Caudal ef. promedio:",
                style: "tableHeader"
            }, formatNumber(report.control.efAvg)+" l/min"]
        ];

        if(report.control.totalEffectiveFlow) {
            controlRows.push([
                {
                    text: "Caudal pulverizado efectivo:",
                    style: "tableHeader"
                }, formatNumber(report.control.totalEffectiveFlow)+" l/min"
            ]);
        }

        controlRows.push([
            {
                text: "Volumen pulverizado efectivo:",
                style: "tableHeader"
            }, formatNumber(report.control.effectiveSprayVolume) + " l/ha"
        ]);

        if(report.control.expectedSprayVolume) {
            controlRows.push(
                [{
                    text: "Volumen previsto:",
                    style: "tableHeader"
                }, formatNumber(report.control.expectedSprayVolume) + " l/ha"],
                [{
                    text: "Diferencia:",
                    style: "tableHeader"
                }, formatNumber(report.control.diff) + " l/ha, " + formatNumber(report.control.diffp)+" %"]
            );
        }

        if(report.control.comments) {
            controlRows.push([
                {
                    text: "Comentarios: ",
                    style: "tableHeader"
                }, report.control.comments
            ]);
        }

        reportContent.push({
            text: "Verificación de picos",
            style: "section"
        });
        reportContent.push({
            layout: 'lightHorizontalLines',
            table: {
                headerRows: 0,
                widths: ['*', '*'],
                body: controlRows
            },
            margin: [0, 0, 0, 15]
        });
        const rows = [
            [
                {
                    text: "Pico",
                    style: "tableHeader"
                },
                {
                    text: "Caudal efectivo",
                    style: "tableHeader"
                },
                {
                    text: "Desvío",
                    style: "tableHeader"
                },
                {
                    text: "Correcto",
                    style: "tableHeader"
                }
            ]
        ];
        report.control.data.forEach((row, idx) => {
            rows.push([
                idx+1,
                formatNumber(row.ef)+" l/min",
                formatNumber(row.s)+" %",
                row.ok? "v" : "x",
            ]);
        });
        reportContent.push({
            layout: 'lightHorizontalLines',
            table: {
                headerRows: 1,
                widths: ['*', '*', '*', '*'],
                body: rows
            },
            margin: [0, 0, 0, 15]
        });
    }

    if (report.completed.supplies) {
        const isSolid = report.supplies.productType === PRODUCT_TYPES.SOLID;
        const doseUnit = isSolid ? "kg/ha" : "l/ha";
        const capacityUnit = isSolid ? "kg" : "l";

        reportContent.push({
            text: "Parámetros de mezcla",
            style: "section"
        });
        reportContent.push({
            text: "Lote: " + report.supplies.lotName,
            style: "text"
        });
        if(report.supplies.lotCoordinates) {
            reportContent.push({
                text: "Ubicación: " + (report.supplies.lotCoordinates.length > 0 ? "lat: " + report.supplies.lotCoordinates.join(', long:') : " - "),
                style: "text"
            });
        }
        reportContent.push({
            text: "Superficie: " + formatNumber(report.supplies.workArea) + " ha",
            style: "text"
        });
        reportContent.push({
            text: "Dosis: " + formatNumber(report.supplies.workVolume) + " " + doseUnit,
            style: "text"
        });
        reportContent.push({
            text: "Capacidad tanque: " + formatNumber(report.supplies.capacity, 0) + " " + capacityUnit,
            style: "text"
        });
        reportContent.push({
            text: "Cantidad de cargas: " + report.supplies.loadsText,
            style: "text"
        });

        reportContent.push({
            text: "Prescripción",
            style: "subsection"
        });

        const rows1 = [
            [
                {
                    text: "Producto",
                    style: "tableHeader"
                },
                {
                    text: "Dosis",
                    style: "tableHeader"
                }

            ]
        ];

        report.supplies.pr.filter(prod => !prod.isWater).forEach(prod => {            
            rows1.push( [
                prod.name,
                formatNumber(prod.dose, 2) + " " + getProductDoseUnit(prod, report.supplies.productType)
            ]);
        });

        reportContent.push({
            layout: 'lightHorizontalLines',
            table: {
                headerRows: 1,
                widths: ['*', '*'],
                body: rows1
            },
            margin: [0, 0, 0, 15]
        });

        reportContent.push({
            text: "Insumos",
            style: "subsection"
        });

        const rows2 = report.supplies.loadBalancingEnabled ? 
        [
            [
                {
                    text: "Producto",
                    style: "tableHeader"
                },
                {
                    text: "Carga",
                    style: "tableHeader"
                },
                {
                    text: "Total insumos",
                    style: "tableHeader"
                }

            ]
        ] : [
            [
                {
                    text: "Producto",
                    style: "tableHeader"
                },
                {
                    text: "Carga completa",
                    style: "tableHeader"
                },
                {
                    text: "Fracción de carga",
                    style: "tableHeader"
                },
                {
                    text: "Total insumos",
                    style: "tableHeader"
                }

            ]
        ];

        report.supplies.pr.forEach(prod => {
            const unit = getProductQuantityLabel(prod, report.supplies.productType);
            const formatQuantity = value => {
                if(report.supplies.productType === "solido") {
                    const hasPackages = Number.isFinite(prod?.packageSize) && prod.packageSize > 0;
                    const base = formatNumber(value, 1) + " kg";
                    if(!hasPackages) return base;

                    const packages = value / prod.packageSize;
                    return base + " (" + formatNumber(packages, 1) + " envases de " + formatNumber(prod.packageSize, 1) + " kg)";
                }

                return formatNumber(value, 1) + " " + unit;
            };
            rows2.push( report.supplies.loadBalancingEnabled ? [
                prod.name,
                formatQuantity(prod.ceq),
                formatQuantity(prod.total)
            ]:[
                prod.name,
                formatQuantity(prod.cpp),
                formatQuantity(prod.cfc),
                formatQuantity(prod.total)
            ]);
        });

        reportContent.push({
            layout: 'lightHorizontalLines',
            table: {
                headerRows: 1,
                widths: report.supplies.loadBalancingEnabled ? ['*', '*', '*'] : ['*', '*', '*', '*'],
                body: rows2
            },
            margin: [0, 0, 0, 15]
        });

        if(report.supplies.comments){
            if(report.supplies.comments.length > 0){
                reportContent.push({
                    text: "Observaciones:",
                    style: "section"
                });
                reportContent.push({
                    text: report.supplies.comments,
                    style: "text"
                });
            }
        }
    }

    const document = { // Documento
        header: reportHeader,
        footer: reportFooter,
        content: reportContent,
        styles: styles,
        pageMargins: [ 40, 80, 40, 60 ]
    };

    // Generar y guardar
    const fileName = "Reporte Criollo "+moment(report.timestamp).format("DD-MM-YYYY HH-mm")+".pdf";    
    const pdfFile = pdfMake.createPdf(document);

    if(Capacitor.isNativePlatform()){ 
        pdfFile.getBase64(b64 => {
            handleSaveReport(fileName, b64, share, Toast);
        });
    }else{
        pdfFile.download(fileName);
    }
};

export default PDFExport;