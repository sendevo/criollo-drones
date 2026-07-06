import React from 'react';
import { f7, Row, Col, Button } from 'framework7-react';

class WorkWidthPicker extends React.Component {
    constructor(props) {
        super(props);
        this.inputRef = React.createRef();
        this.handleClick = this.handleClick.bind(this);
    }

    componentDidMount() {
        this.picker = f7.picker.create({
            inputEl: this.inputRef.current,
            rotateEffect: true,
            backdrop: true,
            renderToolbar: () => (`
                <div class="toolbar">
                    <div class="toolbar-inner">
                        <div class="center" style="width:100%; text-align:center">
                            <a style="color:black; font-size:130%">Ancho de labor - (CV)</a>
                        </div>
                    </div>
                </div>`),
            cols: this.getPickerCols(this.props.options),
            value: this.getPickerValue(this.props.value, this.props.options),
            on: {
                change: pickerValue => {
                    const selected = parseFloat(pickerValue?.value?.[0]);
                    if(Number.isFinite(selected) && this.props.onChange) {
                        this.props.onChange(selected);
                    }
                }
            }
        });
    }

    componentDidUpdate(prevProps) {
        if(!this.picker) {
            return;
        }

        if(prevProps.options !== this.props.options) {
            this.picker.destroy();
            this.picker = f7.picker.create({
                inputEl: this.inputRef.current,
                rotateEffect: true,
                backdrop: true,
                renderToolbar: () => (`
                    <div class="toolbar">
                        <div class="toolbar-inner">
                            <div class="center" style="width:100%; text-align:center">
                                <a style="color:black; font-size:130%">Ancho de labor - (CV)</a>
                            </div>
                        </div>
                    </div>`),
                cols: this.getPickerCols(this.props.options),
                value: this.getPickerValue(this.props.value, this.props.options),
                on: {
                    change: pickerValue => {
                        const selected = parseFloat(pickerValue?.value?.[0]);
                        if(Number.isFinite(selected) && this.props.onChange) {
                            this.props.onChange(selected);
                        }
                    }
                }
            });
            return;
        }

        if(prevProps.value !== this.props.value) {
            const nextValue = this.getPickerValue(this.props.value, this.props.options);
            if(nextValue) {
                this.picker.setValue(nextValue);
            }
        }
    }

    componentWillUnmount() {
        this.picker?.destroy();
    }

    getPickerCols(options = []) {
        return [
            {
                values: options.map(v => v.work_width),
                displayValues: options.map(v => `${v.work_width} m - (${v.cv?.toFixed(2) || '0.00'}%)`),
                textAlign: 'left'
            }
        ];
    }

    getPickerValue(value, options = []) {
        if(options.length === 0) {
            return undefined;
        }

        const parsedValue = parseFloat(value);
        if(Number.isFinite(parsedValue)) {
            return [parsedValue];
        }

        return [options[0].work_width];
    }

    handleClick(e) {
        e.preventDefault();
        e.stopPropagation();
        setTimeout(() => {
            this.inputRef.current?.click();
        }, 10);
    }

    render() {
        if((this.props.options || []).length === 0) {
            return null;
        }

        return (
            <div>
                <input type="text" readOnly ref={this.inputRef} style={{display: 'none'}}/>
                <Row style={{marginTop: 20}}>
                    <Col width={20}></Col>
                    <Col width={60}>
                        <Button
                            fill
                            color="teal"
                            style={{textTransform: 'none'}}
                            onClick={this.handleClick}
                            data-testid="work-width-picker-btn">
                            Ajustar ancho de faja
                        </Button>
                    </Col>
                    <Col width={20}></Col>
                </Row>
            </div>
        );
    }
}

export default WorkWidthPicker;
