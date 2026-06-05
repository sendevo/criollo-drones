import { useContext, useEffect, useMemo, useState } from 'react';
import { Page, PageContent, Block, Navbar, BlockTitle, Row, Col, Radio, List } from 'framework7-react';
import { NavbarTitle, BackButton, PlayButton, NAVBAR_STYLE } from '../../components/Buttons';
import Input from '../../components/Input';
import Footer from '../../components/Footer';
import { ModelCtx } from '../../context';
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

    const displayTime = useMemo(() => moment(Math.max(0, timeMs)).format('mm:ss:S'), [timeMs]);

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

    return (
        <Page name="info">
            <Navbar style={NAVBAR_STYLE}>
                <NavbarTitle {...props} title={"Prueba de compatibilidad"}/>
            </Navbar>
            <PageContent>
                <Block style={{ marginTop: '0px', marginBottom: '10px' }}>
                    <BlockTitle>Measurement time</BlockTitle>
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
                    <PlayButton onClick={toggleRunning} running={running} />
                </Block>

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
            </PageContent>
            <BackButton {...props} />
            <Footer />
        </Page>
    );
};

export default CompatTest;