const defaultStyle = {
    padding: '0',
    margin: '0',
    fontSize: '14px',
    color: '#000'
};

const variantStyles = {
    h1: {
        fontSize: '32px',
        fontWeight: 'bold',
        margin: '16px 0'
    },
    h2: {
        fontSize: '28px',
        fontWeight: 'bold',
        margin: '14px 0'
    },
    h3: {
        fontSize: '24px',
        fontWeight: 'bold',
        margin: '12px 0'
    },
    title: {
        fontSize: '20px',
        margin: '0px'
    },
    subtitle: {
        fontSize: '14px',
        margin: '6px 0'
    },
    small: {
        fontSize: '13px',
        color: '#333',
        margin: '4px 0'
    }
}; 

const Typography = ({ children, sx, variant }) => {
    
    let style = {...defaultStyle, ...sx};
    
    if (variant && variantStyles[variant])
        style = {...style, ...variantStyles[variant]};

    return (
        <p style={style}>
            {children}
        </p>
    );
};

export default Typography;