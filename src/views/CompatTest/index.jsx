import { useEffect, useMemo, useState } from 'react';
import { Page, PageContent, Block, Navbar, BlockTitle, Row, Col, Radio, List } from 'framework7-react';
import { NavbarTitle, BackButton } from '../../components/Buttons';
import { PlayButton } from '../../components/Buttons';
import Input from '../../components/Input';
import Footer from '../../components/Footer';
import Timer from '../../entities/Timer';
import { useSound } from 'use-sound';
import oneSfx from '../../assets/sounds/uno.mp3';
import twoSfx from '../../assets/sounds/dos.mp3';
import threeSfx from '../../assets/sounds/tres.mp3';
import readySfx from '../../assets/sounds/listo.mp3';

const PRESET_INTERVALS = [30, 60, 90];
const defaultSeconds = 30;
const timer = new Timer(defaultSeconds * 1000, true);

const CompatTest = props => {

    const [selectedSeconds, setSelectedSeconds] = useState(defaultSeconds);
    const [customSeconds, setCustomSeconds] = useState('');
    const [timeMs, setTimeMs] = useState(defaultSeconds * 1000);
    const [running, setRunning] = useState(false);
    const [observations, setObservations] = useState('');

    const [play3] = useSound(threeSfx);
    const [play2] = useSound(twoSfx);
    const [play1] = useSound(oneSfx);
    const [play0] = useSound(readySfx);

    const displayTime = useMemo(() => {
        const seconds = Math.max(0, timeMs / 1000);
        return `${seconds.toFixed(1)} s`;
    }, [timeMs]);

    const updateInterval = seconds => {
        const safeSeconds = Number.isFinite(seconds) && seconds > 0 ? seconds : defaultSeconds;
        const valueMs = Math.round(safeSeconds * 1000);
        setSelectedSeconds(safeSeconds);
        setTimeMs(valueMs);
        timer.setInitial(valueMs);
        timer.clear();
    };

    const handlePresetChange = value => {
        if (running) return;
        setCustomSeconds('');
        updateInterval(value);
    };

    const handleCustomChange = event => {
        if (running) return;
        const value = event.target.value;
        setCustomSeconds(value);
        const seconds = parseFloat(value);
        if (Number.isFinite(seconds) && seconds > 0) {
            updateInterval(seconds);
        }
    };

    const handleTimeout = () => {
        setRunning(false);
        setTimeMs(Math.round(selectedSeconds * 1000));
    };

    const toggleRunning = () => {
        if (!running) {
            const initialMs = Math.round(selectedSeconds * 1000);
            timer.setInitial(initialMs);
            timer.clear();
            timer.onChange = setTimeMs;
            timer.onTimeout = handleTimeout;
            timer.start();
            setRunning(true);
        } else {
            timer.stop();
            timer.clear();
            setTimeMs(Math.round(selectedSeconds * 1000));
            setRunning(false);
        }
    };

    if (running && timeMs === 3000) play3();
    if (running && timeMs === 2000) play2();
    if (running && timeMs === 1000) play1();
    if (running && timeMs < 100) play0();

    useEffect(() => () => {
        timer.stop();
    }, []);

    return (
        <Page name="info">
            <Navbar style={{maxHeight:"40px", marginBottom:"0px"}}>
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
                        onChange={e => setObservations(e.target.value)}
                    />
                </List>
            </PageContent>
            <BackButton {...props} />
            <Footer />
        </Page>
    );
};

export default CompatTest;