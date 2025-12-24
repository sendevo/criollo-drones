import { useContext } from 'react';
import {Block, Row, Button, BlockTitle} from 'framework7-react';
import { WalkthroughCtx } from '../../context';

const Popovers = () => {
    const wlk = useContext(WalkthroughCtx);
    const len = wlk.steps.length;

    return (
        <>
            {
            wlk.steps.map((step, index) => (
                <div className={`popover ios ${step.popover_el}`} key={step.key}>
                    <div className={`popover-angle ${step.angle ? step.angle : "on-top"}`} style={{left:"50%"}}></div>
                    <Block>
                        <BlockTitle>Paso {index+1} de {len}</BlockTitle>
                        {step.text}
                    </Block>
                    <Row>
                        <Button popoverClose onClick={()=>wlk.finish()}>
                            Finalizar
                        </Button>
                        { ( index < len-1 ) &&
                        <Button popoverClose onClick={()=>wlk.next()}>
                            Siguiente
                        </Button>
                        }
                    </Row>
                </div>
            ))
            }
        </>
    );
};

export default Popovers;