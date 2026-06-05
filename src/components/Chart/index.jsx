import {  BlockTitle } from 'framework7-react';
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    usePlotArea
} from "recharts";
import Typography from "../Typography";

const CustomTooltip = ({ active, payload, label, prefix, suffix }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                backgroundColor: 'white',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px'
            }}>
                <p style={{ margin: 0, marginBottom: '5px' }}>{label}</p>
                <p style={{ margin: 0, color: '#8884d8' }}>
                    {prefix}{payload[0].value}{suffix}
                </p>
            </div>
        );
    }
    return null;
};

const MidScaleLine = () => {
    const plotArea = usePlotArea();

    if (!plotArea || plotArea.width <= 0 || plotArea.height <= 0) {
        return null;
    }

    const x = plotArea.x + (plotArea.width / 2);

    return (
        <line
            x1={x}
            x2={x}
            y1={plotArea.y}
            y2={plotArea.y + plotArea.height}
            stroke="#666"
            strokeDasharray="6 6"
            strokeWidth={2.5}
            opacity={0.9}
        />
    );
};

const Chart = props => (
    <div style={{ width: '100%' }} data-testid={props.dataTestId}>
        <BlockTitle>
            <Typography sx={{ marginBottom: '10px'}}>
                {props.title}
            </Typography>
        </BlockTitle>
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={props.data}>

                <CartesianGrid strokeDasharray="3 3" />
                <MidScaleLine />

                <XAxis dataKey="name" />
                <YAxis />

                <Tooltip 
                    content={<CustomTooltip 
                        prefix={props.tooltipPrefix || ""} 
                        suffix={props.tooltipSuffix || ""} 
                    />}
                />

                <Line type="monotone" dataKey="recolectado" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
        </ResponsiveContainer>
    </div>
);  

export default Chart;