import {useState, useEffect, useRef} from 'react';

const DropletSizeSlider = ({ min, max, ranges, value }) => {
    const sliderRef = useRef(null);
    const [_, setSliderWidth] = useState(0);

    // Actualizar indicador y rescalar
    useEffect(() => {
        const updateWidth = () => {
            if (sliderRef.current) {
                setSliderWidth(sliderRef.current.offsetWidth);
            }
        };
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    const getPercentage = v => ((v - min) / (max - min)) * 100;

    // Crear gradiente a partir de los rangos
    const gradient = ranges.map(range => {
        const startPct = getPercentage(range.from);
        const endPct = getPercentage(range.to);
        return `${range.background} ${startPct}%, ${range.background} ${endPct}%`;
    }).join(', ');

    // Calcular la posicion del indicador
    const indicatorStyle = {
        left: `calc(${getPercentage(value)}% - 1px)`
    };

    return (
        <div>
            <div
                ref={sliderRef}
                className="slider-container"
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '30px',
                    borderRadius: '5px',
                    background: `linear-gradient(to right, ${gradient})`,
                    overflow: 'visible',
                    border: '1px solid #ccc',
                    zIndex: 1}}>
                    {
                        ranges.map((range, index) => {
                            const startPct = getPercentage(range.from);
                            const widthPct = getPercentage(range.to) - startPct;
                            return (
                                <div
                                    key={index}
                                    style={{
                                        position: 'absolute',
                                        top: '6px',
                                        left: `${startPct}%`,
                                        width: `${widthPct}%`,
                                        textAlign: 'center',
                                        fontSize: '12px',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        color: range.color,
                                        pointerEvents: 'none'}}>
                                    {range.label}
                                </div>
                            );
                        })
                    }
                    <div
                        className="indicator"
                        style={{
                            position: 'absolute',
                            top: '-6px',
                            width: '2px',
                            height: '42px',
                            backgroundColor: 'red',
                            ...indicatorStyle
                    }}/>
            </div>
        </div>
    );
};

export default DropletSizeSlider;
