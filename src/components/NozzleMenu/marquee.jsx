import './marquee.css'; // CSS shown below

const syncAnchor = performance.now();

const Marquee = ({ text, speed = 10, threshold = 15 }) => {
    const shouldAnimate = text.length > threshold;

    const elapsed = (performance.now() - syncAnchor) / 1000;
    const offset = elapsed % speed;

    const animationStyle = {
        animationDuration: `${speed}s`,
        animationDelay: `-${offset}s`
    };

    return (
        <div className="marquee-container">
            <div 
                className={`marquee-text ${shouldAnimate ? 'animate' : ''}`} 
                style={shouldAnimate ? animationStyle : {}}>
                {text}
            </div>
        </div>
    );
};

export default Marquee;