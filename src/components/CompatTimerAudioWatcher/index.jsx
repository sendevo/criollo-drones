import { useContext, useEffect, useRef } from 'react';
import { useSound } from 'use-sound';
import { ModelCtx } from '../../context';
import oneSfx from '../../assets/sounds/uno.mp3';
import twoSfx from '../../assets/sounds/dos.mp3';
import threeSfx from '../../assets/sounds/tres.mp3';
import readySfx from '../../assets/sounds/listo.mp3';

const CompatTimerAudioWatcher = () => {
    const model = useContext(ModelCtx);
    const prevSecondRef = useRef(null);

    const [play3] = useSound(threeSfx);
    const [play2] = useSound(twoSfx);
    const [play1] = useSound(oneSfx);
    const [play0] = useSound(readySfx);

    useEffect(() => {
        const tick = () => {
            const endTs = Number(model.compatTestEndTs);
            const running = Boolean(model.compatTestRunning);

            if (!running || !Number.isFinite(endTs)) {
                prevSecondRef.current = null;
                return;
            }

            const remaining = Math.max(0, endTs - Date.now());
            const currentSecond = Math.ceil(remaining / 1000);
            const prevSecond = prevSecondRef.current;

            if (prevSecond !== null) {
                if (prevSecond > 3 && currentSecond <= 3) play3();
                if (prevSecond > 2 && currentSecond <= 2) play2();
                if (prevSecond > 1 && currentSecond <= 1) play1();
                if (prevSecond > 0 && currentSecond <= 0) play0();
            }

            prevSecondRef.current = currentSecond;

            if (remaining <= 0) {
                model.update({
                    compatTestRunning: false,
                    compatTestEndTs: ''
                });
            }
        };

        tick();
        const id = setInterval(tick, 100);
        return () => clearInterval(id);
    }, [model, play0, play1, play2, play3]);

    return null;
};

export default CompatTimerAudioWatcher;
