import pdfMake from "pdfmake";
import vfs from "pdfmake/build/vfs_fonts.js";
import moment from 'moment';
import Toast from '../../components/Toast';
import { formatNumber, handleSaveReport } from "../../utils";
import { presentationUnits } from "../API";
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

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
            style: "section"
        });
        reportContent.push({
            text: "Producto a aplicar: " + report.params.productType,
            style: "text"
        });
        reportContent.push({
            text: "Pico",
            style: "subsection"
        });
        reportContent.push({
            layout: 'lightHorizontalLines',
            table: {
                headerRows: 0,
                widths: ['*', '*'],
                body: [
                    [{
                        text: "Pico seleccionado:",
                        style: "tableHeader"
                    }, report.params.nozzleName ? report.params.nozzleName : "Otro"],
                    [{
                        text: "Caudal nominal:",
                        style: "tableHeader"
                    }, formatNumber(report.params.nominalFlow) + " l/min"],
                    [{
                        text: "Presión nominal:",
                        style: "tableHeader"
                    }, formatNumber(report.params.nominalPressure) + " bar"]
                ]
            },
            margin: [0, 0, 0, 15]
        });

        reportContent.push({
            text: "Parámetros de pulverización",
            style: "subsection"
        });
        reportContent.push({
            layout: 'lightHorizontalLines',
            table: {
                headerRows: 0,
                widths: ['*', '*'],
                body: [
                    [{
                        text: "Distancia entre picos:",
                        style: "tableHeader"
                    }, formatNumber(report.params.nozzleSeparation)+" m"],
                    [{
                        text: "Velocidad de trabajo:",
                        style: "tableHeader"
                    }, formatNumber(report.params.workVelocity) + " m/s"],
                    [{
                        text: "Presión de trabajo:",
                        style: "tableHeader"
                    }, formatNumber(report.params.workPressure) + " bar"],
                    [{
                        text: "Volumen de aplicación:",
                        style: "tableHeader"
                    }, formatNumber(report.params.workVolume) + " l/ha"]
                ]
            },
            margin: [0, 0, 0, 15]
        });
        if(report.params.waterEqSprayFlow && report.params.productType === "fertilizante") {
            reportContent[reportContent.length - 1].table.body.push(
                [{
                    text: "Caudal equivalente en agua",
                    style: "tableHeader"
                }, formatNumber(report.params.waterEqSprayFlow) + " l/ha"]
            );
        }
        if(report.params.dropletSizeLabel){
            reportContent[reportContent.length - 1].table.body.push(
                [{
                    text: "Tamaño de gota",
                    style: "tableHeader"
                }, report.params.dropletSizeLabel]
            );
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
        reportContent.push({
            text: "Verificación de picos",
            style: "section"
        });
        reportContent.push({
            layout: 'lightHorizontalLines',
            table: {
                headerRows: 0,
                widths: ['*', '*'],
                body: [
                    [{
                        text: "Caudal ef. promedio:",
                        style: "tableHeader"
                    }, formatNumber(report.control.efAvg)+" l/min"],
                    [{
                        text: "Volumen pulverizado:",
                        style: "tableHeader"
                    }, formatNumber(report.control.effectiveSprayVolume) + " l/ha"],
                    [{
                        text: "Volumen previsto:",
                        style: "tableHeader"
                    }, formatNumber(report.control.expectedSprayVolume) + " l/ha"],
                    [{
                        text: "Diferencia:",
                        style: "tableHeader"
                    }, formatNumber(report.control.diff) + " l/ha, " + formatNumber(report.control.diffp)+" %"],
                    [{
                        text: "Comentarios: ",
                        style: "tableHeader"
                    }, report.control.comments ? report.control.comments : " - "]
                ]
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

        reportContent.push({
            text: "Parámetros de mezcla",
            style: "section"
        });
        reportContent.push({
            text: "Lote: " + report.supplies.lotName,
            style: "text"
        });
        reportContent.push({
            text: "Superficie: " + formatNumber(report.supplies.workArea) + " ha",
            style: "text"
        });
        reportContent.push({
            text: "Volumen pulverizado: " + formatNumber(report.supplies.workVolume) + " l/ha",
            style: "text"
        });
        reportContent.push({
            text: "Capacidad tanque: " + formatNumber(report.supplies.capacity, 0) + " litros",
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

        report.supplies.pr.forEach(prod => {            
            rows1.push( [
                prod.name,
                formatNumber(prod.dose, 2) + " " + presentationUnits[prod.presentation]
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
            const literPresIndex = [0,2,4].includes(prod.presentation);
            const unit = literPresIndex ? " l" : " kg";
            rows2.push( report.supplies.loadBalancingEnabled ? [
                prod.name,
                formatNumber(prod.ceq, 1) + unit,
                formatNumber(prod.total, 1) + unit
            ]:[
                prod.name,
                formatNumber(prod.cpp, 1) + unit,
                formatNumber(prod.cfc, 1) + unit,
                formatNumber(prod.total, 1) + unit
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