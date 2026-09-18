import { useContext, useEffect, useMemo, useState } from 'react';
import { f7, Page, PageContent, Block, Navbar, BlockTitle, Row, Col, Radio, List, Button, Card, CardContent } from 'framework7-react';
import { FaPlay, FaStop } from 'react-icons/fa';
import { NavbarTitle, BackButton, ActionButton, NAVBAR_STYLE } from '../../components/Buttons';
import Input from '../../components/Input';
import Footer from '../../components/Footer';
import Toast from '../../components/Toast';
import { ModelCtx } from '../../context';
import { PRODUCT_TYPES } from '../../entities/Model';
import * as API from '../../entities/API';
import { formatNumber, parseNonNegativeNumber, sanitizeTypedValue } from '../../utils';
import timerIcon from '../../assets/icons/tiempo.png';
import sampleIcon from '../../assets/icons/concentracion.png';
import moment from 'moment';

const PRESET_INTERVALS = [30, 60, 90];
const defaultSeconds = 30;

const CompatTest = props => {

    const model = useContext(ModelCtx);

    const modelSelectedSeconds = Number(model.compatTestSelectedSeconds);
    const initialSelectedSeconds = Number.isFinite(modelSelectedSeconds) && modelSelectedSeconds > 0
        ? modelSelectedSeconds
        : defaultSeconds;

    const modelEndTs = Number(model.compatTestEndTs);
    const modelRunning = Boolean(model.compatTestRunning) && Number.isFinite(modelEndTs) && modelEndTs > Date.now();
    const initialTimeMs = modelRunning
        ? Math.max(0, modelEndTs - Date.now())
        : Math.round(initialSelectedSeconds * 1000);

    const [selectedSeconds, setSelectedSeconds] = useState(initialSelectedSeconds);
    const [customSeconds, setCustomSeconds] = useState(model.compatTestCustomSeconds || '');
    const [timeMs, setTimeMs] = useState(initialTimeMs);
    const [running, setRunning] = useState(modelRunning);
    const [endTs, setEndTs] = useState(modelRunning ? modelEndTs : '');
    const [observations, setObservations] = useState(model.compatTestObservations || '');
    const [sampleVolume, setSampleVolume] = useState(model.compatTestSampleVolume ?? '');
    const [sampleMix, setSampleMix] = useState([]);
    const [selectedSampleProductKey, setSelectedSampleProductKey] = useState(null);
    const [editedSampleProductAmount, setEditedSampleProductAmount] = useState('');
    const [showExportButton, setShowExportButton] = useState(false);

    const displayTime = useMemo(() => moment(Math.max(0, timeMs)).format('mm:ss:S'), [timeMs]);

    const getSelectedSampleProduct = () => sampleMix.find(prod => (prod.key || prod.name) === selectedSampleProductKey) || null;

    const calculateMix = () => {
        const parsedSampleVolume = parseNonNegativeNumber(sampleVolume);
        const workVolumeCandidates = [
            model.workVolume,
            model.doseLiquid,
            model.effectiveDose,
            model.doseSolid,
            model.verificationOutput?.effectiveSprayVolume,
            model.verificationOutput?.expectedSprayVolume
        ];
        const applicationVolume = workVolumeCandidates
            .map(value => parseNonNegativeNumber(value))
            .find(value => Number.isFinite(value) && value > 0);

        if (!Number.isFinite(parsedSampleVolume) || parsedSampleVolume <= 0) {
            Toast('error', 'Ingrese un volumen de muestra válido', 2500, 'bottom');
            return;
        }

        if (!Number.isFinite(applicationVolume) || applicationVolume <= 0) {
            Toast('error', 'Complete el volumen de aplicación para calcular la mezcla', 3000, 'bottom');
            return;
        }

        const products = Array.isArray(model.products) ? model.products : [];
        if (products.length === 0) {
            Toast('error', 'Agregue al menos un producto para calcular la mezcla', 2500, 'bottom');
            return;
        }

        const result = API.computeSuppliesList({
            A: 1,
            T: parsedSampleVolume,
            Va: applicationVolume,
            productType: PRODUCT_TYPES.LIQUID,
            products
        });

        const productRows = (result.pr || []).filter(prod => !prod.isWater && prod.name);
        setSampleMix(productRows);
        setSelectedSampleProductKey(null);
        setEditedSampleProductAmount('');
        setShowExportButton(false);
        model.update({ compatTestSampleVolume: sampleVolume });
    };

    const updateInterval = (seconds, customValue = customSeconds) => {
        const safeSeconds = Number.isFinite(seconds) && seconds > 0 ? seconds : defaultSeconds;
        const valueMs = Math.round(safeSeconds * 1000);
        setSelectedSeconds(safeSeconds);
        setTimeMs(valueMs);
        setRunning(false);
        setEndTs('');
        model.update({
            compatTestSelectedSeconds: safeSeconds,
            compatTestCustomSeconds: customValue,
            compatTestRunning: false,
            compatTestEndTs: '',
            compatTestObservations: observations
        });
    };

    const handlePresetChange = value => {
        if (running) return;
        setCustomSeconds('');
        updateInterval(value, '');
    };

    const handleCustomChange = event => {
        if (running) return;
        const value = event.target.value;
        setCustomSeconds(value);
        const seconds = parseFloat(value);
        if (Number.isFinite(seconds) && seconds > 0) {
            updateInterval(seconds, value);
        } else {
            model.update({ compatTestCustomSeconds: value });
        }
    };

    const toggleRunning = () => {
        if (!running) {
            const durationMs = Math.round(selectedSeconds * 1000);
            const endTimestamp = Date.now() + durationMs;
            setTimeMs(durationMs);
            setEndTs(endTimestamp);
            setRunning(true);
            model.update({
                compatTestRunning: true,
                compatTestEndTs: endTimestamp,
                compatTestSelectedSeconds: selectedSeconds,
                compatTestCustomSeconds: customSeconds,
                compatTestObservations: observations
            });
        } else {
            setTimeMs(Math.round(selectedSeconds * 1000));
            setRunning(false);
            setEndTs('');
            model.update({
                compatTestSelectedSeconds: selectedSeconds,
                compatTestCustomSeconds: customSeconds,
                compatTestRunning: false,
                compatTestEndTs: '',
                compatTestObservations: observations
            });
        }
    };

    useEffect(() => {
        if (!running || !Number.isFinite(Number(endTs))) {
            return;
        }

        const endTimestamp = Number(endTs);

        const tick = () => {
            const remaining = Math.max(0, endTimestamp - Date.now());
            setTimeMs(remaining);

            if (remaining <= 0) {
                setRunning(false);
                setEndTs('');
                model.update({
                    compatTestSelectedSeconds: selectedSeconds,
                    compatTestCustomSeconds: customSeconds,
                    compatTestRunning: false,
                    compatTestEndTs: '',
                    compatTestObservations: observations
                });
            }
        };

        tick();
        const id = setInterval(tick, 100);
        return () => clearInterval(id);
    }, [running, endTs]);

    useEffect(() => {
        if (!Boolean(model.compatTestRunning)) return;
        const initialEndTs = Number(model.compatTestEndTs);
        if (Number.isFinite(initialEndTs) && initialEndTs <= Date.now()) {
            model.update({
                compatTestRunning: false,
                compatTestEndTs: ''
            });
        }
    }, []);

    const handleObservationsChange = e => {
        const value = e.target.value;
        setObservations(value);
        model.update({ compatTestObservations: value });
    };

    const handleSampleVolumeChange = e => {
        const value = e.target.value;
        setSampleVolume(value);
        setSampleMix([]);
        setSelectedSampleProductKey(null);
        setEditedSampleProductAmount('');
        setShowExportButton(false);
        model.update({ compatTestSampleVolume: value });
    };

    const handleSelectSampleProduct = prod => {
        const key = prod.key || prod.name;
        const promptId = `compat-product-dose-${key}`;
        const promptValue = Number.isFinite(Number(prod.cpp)) ? Number(prod.cpp).toFixed(2) : '0';

        const applyPromptValue = () => {
            const inputEl = document.getElementById(promptId);
            const nextValue = parseNonNegativeNumber(inputEl?.value);
            if (!Number.isFinite(nextValue) || nextValue <= 0) {
                Toast('error', 'Ingrese una cantidad válida para exportar', 2500, 'bottom');
                return;
            }

            setSelectedSampleProductKey(key);
            setEditedSampleProductAmount(String(nextValue));
            setSampleMix(prev => prev.map(row => ((row.key || row.name) === key ? { ...row, cpp: nextValue } : row)));
            setShowExportButton(Math.abs(nextValue - (Number(prod.cpp) || 0)) > 0.0001);
        };

        const bindPromptFormatting = () => {
            const inputEl = document.getElementById(promptId);
            if (!inputEl) return;

            inputEl.setAttribute('inputmode', 'decimal');
            inputEl.addEventListener('input', event => {
                const originalValue = event?.target?.value ?? '';
                const isSingleTypedDot = event?.inputType === 'insertText' && event?.data === '.';
                const valueForSanitizing = isSingleTypedDot ? originalValue.replace(/\.(?!.*\.)/, ',') : originalValue;
                const sanitizedText = sanitizeTypedValue(valueForSanitizing);
                if (sanitizedText !== originalValue) {
                    inputEl.value = sanitizedText;
                }
            });
        };

        f7.dialog.create({
            title: prod.name,
            content: `
                <div class="list no-hairlines-md" style="margin-bottom:0;">
                    <ul>
                        <li class="item-content item-input">
                            <div class="item-inner">
                                <div class="item-title item-label">Cantidad</div>
                                <div class="item-input-wrap">
                                    <input id="${promptId}" type="number" min="0" step="0.01" value="${promptValue}" />
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            `,
            buttons: [
                { text: 'Cancelar' },
                { text: 'Aceptar', onClick: applyPromptValue }
            ],
            on: {
                opened: bindPromptFormatting
            },
            destroyOnClose: true
        }).open();
    };

    const handleExportSampleMix = () => {
        const selectedProduct = getSelectedSampleProduct();
        const nextValue = parseNonNegativeNumber(editedSampleProductAmount);
        const sampleVol = parseNonNegativeNumber(sampleVolume);
        const applicationVolume = [
            model.workVolume,
            model.doseLiquid,
            model.effectiveDose,
            model.doseSolid,
            model.verificationOutput?.effectiveSprayVolume,
            model.verificationOutput?.expectedSprayVolume
        ].map(value => parseNonNegativeNumber(value)).find(value => Number.isFinite(value) && value > 0);

        if (!selectedProduct || !Number.isFinite(nextValue) || nextValue <= 0) {
            Toast('error', 'Ingrese una cantidad válida para exportar', 2500, 'bottom');
            return;
        }

        if (!Number.isFinite(sampleVol) || sampleVol <= 0 || !Number.isFinite(applicationVolume) || applicationVolume <= 0) {
            Toast('error', 'Complete el volumen de muestra y de aplicación para exportar', 2600, 'bottom');
            return;
        }

        const productIndex = model.products.findIndex(prod => (prod.key || prod.name) === (selectedProduct.key || selectedProduct.name));
        if (productIndex === -1) {
            Toast('error', 'No se encontró el producto en la lista principal', 2600, 'bottom');
            return;
        }

        const baseDose = Number(model.products[productIndex]?.dose || 0);
        const baseSampleDose = Number(selectedProduct.cpp || 0);
        const equivalentDose = Number.isFinite(baseDose) && baseDose > 0 && Number.isFinite(baseSampleDose) && baseSampleDose > 0
            ? baseDose * (nextValue / baseSampleDose)
            : (nextValue * applicationVolume) / sampleVol;

        const updatedProducts = model.products.map((prod, index) =>
            index === productIndex ? { ...prod, dose: equivalentDose } : prod
        );

        model.update('products', updatedProducts);
        setSampleMix(prev => prev.map(prod => (prod.key || prod.name) === (selectedProduct.key || selectedProduct.name) ? {
            ...prod,
            cpp: nextValue
        } : prod));
        setShowExportButton(false);
        setSelectedSampleProductKey(null);
        setEditedSampleProductAmount('');
        Toast('success', 'Proporciones exportadas', 2000, 'bottom');
        f7.view.main.router.back();
    };

    return (
        <Page name="info">
            <Navbar style={NAVBAR_STYLE}>
                <NavbarTitle {...props} title={"Prueba de compatibilidad"}/>
            </Navbar>
            
            <Block style={{ marginTop: '10px', marginBottom: '10px' }}>
                <BlockTitle>Tiempo de muestreo</BlockTitle>
                <Row>
                    {PRESET_INTERVALS.map(seconds => (
                        <Col key={seconds} style={{ textAlign: 'center' }}>
                            <Radio
                                disabled={running}
                                name="compat-time"
                                checked={selectedSeconds === seconds && customSeconds === ''}
                                onChange={() => handlePresetChange(seconds)}
                            /> {seconds} seg.
                        </Col>
                    ))}
                </Row>
            </Block>

            <List form noHairlinesMd style={{ marginTop: '0px', marginBottom: '10px' }}>
                <Input
                    slot="list"
                    icon={timerIcon}
                    label="Otro intervalo"
                    name="customInterval"
                    type="number"
                    unit="seg"
                    value={customSeconds}
                    disabled={running}
                    onChange={handleCustomChange}
                />
            </List>

            <Block style={{marginTop:"20px", textAlign:"center"}}>
                <p style={{fontSize:"50px", margin:"0px"}}>{displayTime}</p>
                <ActionButton
                    variant="span"
                    icon={running ? FaStop : FaPlay}
                    iconColor={running ? "red" : "green"}
                    size={40}
                    onClick={toggleRunning}
                    containerStyle={{ minHeight: 50 }}
                />
            </Block>

            <List form noHairlinesMd style={{ marginTop: '0px', marginBottom: '10px' }}>
                <Input
                    slot="list"
                    icon={sampleIcon}
                    label="Volumen de muestra"
                    name="compatSampleVolume"
                    type="number"
                    unit="l"
                    value={sampleVolume}
                    onChange={handleSampleVolumeChange}
                />
            </List>

            <Block style={{ marginTop: '0px', marginBottom: '10px', textAlign: 'center' }}>
                <Row>
                    <Col width={20}></Col>
                    <Col width={60}>
                        <Button fill onClick={calculateMix} style={{ textTransform: 'none' }}>
                            Calcular mezcla de productos
                        </Button>
                    </Col>
                    <Col width={20}></Col>
                </Row>
                
            </Block>

            {sampleMix.length > 0 && (
                <Block style={{ marginTop: '0px', marginBottom: '10px' }}>
                    <Card>
                        <CardContent>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: 'left', padding: '8px 0' }}>Producto</th>
                                        <th style={{ textAlign: 'right', padding: '8px 0' }}>Cantidad</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sampleMix.map(prod => {
                                        const unit = API.getProductQuantityLabel(prod, PRODUCT_TYPES.LIQUID);
                                        return (
                                            <tr
                                                key={prod.key || prod.name}
                                                onClick={() => handleSelectSampleProduct(prod)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <td style={{ padding: '8px 0' }}>{prod.name}</td>
                                                <td style={{ textAlign: 'right', padding: '8px 0' }}>
                                                    {`${formatNumber(prod.cpp, 2)} ${unit}`}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {showExportButton && (
                                <div style={{ marginTop: '12px', textAlign: 'center' }}>
                                    <Button fill onClick={handleExportSampleMix} style={{ textTransform: 'none' }}>
                                        Exportar
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </Block>
            )}

            <List form noHairlinesMd style={{ marginTop: '0px', marginBottom: '10px' }}>
                <Input
                    slot="list"
                    label="Observaciones"
                    name="compatObservations"
                    type="textarea"
                    value={observations}
                    onChange={handleObservationsChange}
                />
            </List>
            <BackButton {...props} />
            <Footer />
        </Page>
    );
};

export default CompatTest;