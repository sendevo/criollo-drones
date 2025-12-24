import { f7 } from "framework7-react";

/*

    Sobre el funcionamiento de este modulo:

    En cada step, se ejecuta una accion y se muestra un popover con texto de ayuda.

    El popover se mostrará sobre el componente con className=[step.target_el]. Los popups se 
    renderizan automaticamente en el componente Popover.js.
    
    Hay dos tipos de acciones, una para actualizar parametros del modelo y la otra que requiere
    renderizar componentes de react. Primero se ejecuta la actualizacion de parametros y luego 
    la otra, siempre y cuando el step tenga callback === true.
    
    Esta clase (WalkthroughModel) tiene acceso al modelo porque al definir el provider se 
    le pasa como argumento con "setModel(model)".
    
    Para renderizar componentes de la vista o ejecutar acciones, se usan los callbacks. En cada 
    componente donde haya que ejecutar una accion, hay que importar el WalkthroughCtx y asignarle 
    callbacks cuyo nombre coincida con la key del paso correspondiente.

*/

const STEPS = [
    ////// SectionDosif.js
    {
        page: "/params/",
        key: "dist_nozzle",
        text: "Para comenzar, indique la distancia entre picos o boquillas seleccionando el valor predefinido o ingresando la medida en metros.",
        popover_el: "help-popover-dist-nozzle",
        target_el: "help-target-dist-nozzle"
    },
    {
        page: "/params/",
        key: "nozzle_cnt",
        text: "El valor de la cantidad de picos es opcional y permite calcular el caudal de pulverización.",
        popover_el: "help-popover-nozzle-cnt",
        target_el: "help-target-nozzle-cnt"
    },
    {
        page: "/params/",
        key: "nozzle_select",
        text: "Para indicar la capacidad de pico, puede elegir un modelo predefinido de la lista o bien ingresar los parámetros nominales.",
        popover_el: "help-popover-nozzle-select",
        target_el: "help-target-nozzle-select"
    },
    {
        page: "/params/",
        key: "params_1",
        text: "Para determinar los parámetros de pulverización, modifique los valores y presione en el ícono correspondiente a la variable a calcular.",
        popover_el: "help-popover-params-1",
        target_el: "help-target-params-1"
    },
    {
        page: "/params/",
        key: "params_2",
        text: "El color de borde de cada ícono indica el estado del valor: amarillo = sin actualizar, verde = actualizado.",
        popover_el: "help-popover-params-2",
        target_el: "help-target-params-2",
        callback: true
    },
    {
        page: "/params/",
        key: "params_report",
        text: "Finalmente, puede guardar estos resultados en un reporte.",
        popover_el: "help-popover-params-report",
        target_el: "help-target-params-report",
        angle: "on-bottom"
    },
    {
        page: "/control/",
        key: "control_sampling",
        text: "Para realizar la verificación de picos, indique el tiempo de muestreo.",
        popover_el: "help-popover-control-sampling",
        target_el: "help-target-control-sampling"
    },
    {
        page: "/control/",
        key: "control_nozzles",
        text: "Luego, ingrese la cantidad de picos a controlar. Si desea, puede modificar el caudal de trabajo.",
        popover_el: "help-popover-control-nozzles",
        target_el: "help-target-control-nozzles",
        callback: true
    },
    {
        page: "/control/",
        key: "control_play",
        text: "Presione el botón verde para iniciar el timer. Suba el volumen de su móvil para oir las alertas.",
        popover_el: "help-popover-control-play",
        target_el: "help-target-control-play"        
    },
    {
        page: "/control/",
        key: "control_table",
        text: "Ingrese los volúmenes recolectados en las filas correspondientes dentro de la tabla de muestras.",
        popover_el: "help-popover-control-table",
        target_el: "help-target-control-table"
    },
    {
        page: "/control/",
        key: "control_results",
        text: "Al completar la tabla, aparecerán los valores del resultado de la verificación.",
        popover_el: "help-popover-control-results",
        target_el: "help-target-control-results",
        updateModel: {
            collectedData:[
                {
                    value: 0.31,
                    updated: true, 
                    ef: 0.62, 
                    s: -4.62, 
                    ok: true
                },
                {
                    value: 0.4, 
                    updated: true, 
                    ef: 0.8, 
                    s: 18.75, 
                    ok: false
                },
                {
                    value: 0.29, 
                    updated: true, 
                    ef: 0.58, 
                    s: -10.77, 
                    ok: false
                }
            ]
        },
        callback: true
    },
    {
        page: "/control/",
        key: "control_reports",
        text: "Si lo desea, puede guardar el resultado en un reporte.",
        popover_el: "help-popover-control-reports",
        target_el: "help-target-control-reports",
        angle: "on-bottom"
    },
    {
        page: "/supplies/",
        key: "supplies_form",
        text: "Para comenzar, indique un nombre identificador para el lote de trabajo y el área del mismo.",
        popover_el: "help-popover-supplies-form",
        target_el: "help-target-supplies-form"
    },
    {
        page: "/supplies/",
        key: "supplies_gps",
        text: "Si desea, puede habilitar la opción de incluir la geolocalización empleando su ubicación actual.",
        popover_el: "help-popover-supplies-gps",
        target_el: "help-target-supplies-gps"        
    },
    {
        page: "/supplies/",
        key: "supplies_capacity",
        text: "Debe indicar la capacidad del tanque para conocer el volumen de producto por carga.",
        popover_el: "help-popover-supplies-capacity",
        target_el: "help-target-supplies-capacity",
        updateModel: {
            lotName: "Lote 1",            
            workArea: 63,
            capacity: 2500
        },
        callback: true        
    },
    {
        page: "/supplies/",
        key: "supplies_balancing",
        text: "La opción de balanceo de cargas permite equilibrar los litros de carga para usar siempre el mismo volumen.",
        popover_el: "help-popover-supplies-balancing",
        target_el: "help-target-supplies-balancing"        
    },
    {
        page: "/supplies/",
        key: "supplies_add",
        text: 'Puede agregar productos a la lista presionando el botón "+" e indicar nombre de producto, dosis y unidad de la misma',
        popover_el: "help-popover-supplies-add",
        target_el: "help-target-supplies-add",
        updateModel: {            
            products: [{
                key: "abcdefghi",
                name: "Glifosato",
                dose: 30,
                presentation: 2 // 0: ml/ha, 1: gr/ha, 2: ml/100L, 3: gr/100L
            }]
        },
        callback: true
    },
    {
        page: "/supplies/",
        key: "supplies_results",
        text: 'Luego de presionar en "Calcular insumos", se mostrará el detalle de los resultados obtenidos.',
        popover_el: "help-popover-supplies-results",
        target_el: "help-target-supplies-results",
        angle: "on-bottom",
        callback: true 
    }
];

const POPOVER_DELAY = 700;
const SCROLL_DELAY = 500;

export default class WalkthroughModel {
    constructor(){
        this.steps = STEPS;        
        this.currentIndex = -1;
        this.currentStep = null;
        this.model = null;
        this.callbacks = {};
    }

    setModel(model){
        this.model = model;
    }

    start() {
        this.currentIndex = -1;
        this.currentStep = null;
        this.next();
    }

    finish() {        
        //f7.popover.close("."+this.steps[this.currentIndex].popover_el);
        f7.views.main.router.navigate('/');
    }

    next() {

        this.currentIndex++;
        
        if(this.currentIndex >= this.steps.length){
            this.finish();
            return;
        }
        
        this.currentStep = this.steps[this.currentIndex];
        
        if(this.currentIndex > 0){
            if(this.currentStep.page !== this.steps[this.currentIndex-1].page){
                f7.views.main.router.navigate(this.currentStep.page);
            }
            //f7.popover.close("."+this.steps[this.currentIndex-1].popover_el);    
        }else
            f7.views.main.router.navigate(this.currentStep.page);

        if(this.currentStep.updateModel)
            this.model.update(this.currentStep.updateModel);

        if(this.currentStep.callback)
            if(this.callbacks[this.currentStep.key])
                this.callbacks[this.currentStep.key]();

        setTimeout(() => {
            const r = document.getElementsByClassName(this.currentStep.target_el);
            if(r.length > 0){
                r[0].scrollIntoView({block: "center", behavior: "smooth"});
                setTimeout(()=>{
                    try{
                        f7.popover.open("."+this.currentStep.popover_el, "."+this.currentStep.target_el, true);    
                    }catch(e){
                        //console.log(e);
                        Function.prototype();
                    }
                }, POPOVER_DELAY);
            }else{
                //console.log("Error de ayuda, elemento no existe: "+this.currentStep.target_el);
                this.next();
            }
        }, SCROLL_DELAY);
    }
}