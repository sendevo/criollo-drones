import { useContext } from 'react';
import { Page, Link, PageContent, Block, Navbar } from 'framework7-react';
import { NavbarTitle, BackButton } from '../../components/Buttons';
import Footer from '../../components/Footer';
import { WalkthroughCtx } from '../../context';
import classes from '../style.module.css';

const Info = props => {

    const wlk = useContext(WalkthroughCtx);

    return (
        <Page name="info" className={classes.InfoPage}>
            <Navbar style={{maxHeight:"40px", marginBottom:"0px"}}>
                <NavbarTitle {...props} title={"Información y ayuda"}/>
            </Navbar>
            <PageContent>
                <Block 
                    className={classes.ButtonContainer}
                    style={{marginTop: "20px", marginBottom: "20px", padding: "10px"}}>
                    
                    <Link 
                        className={classes.MenuButton} 
                        onClick={()=>wlk.start()}
                        style={{backgroundColor:"#ddddddaa"}}>
                        <p>Iniciar ayuda</p>
                    </Link>

                    <Link 
                        external 
                        rel="noopener noreferrer" 
                        target="_blank" 
                        href="https://inta.gob.ar/documentos/campero-y-criollo-informacion-y-novedades-para-usuarios" 
                        className={[classes.MenuButton]}
                        style={{backgroundColor:"#ddddddaa"}}>
                        <p>Info técnica y novedades</p>
                    </Link>
                    
                    <Link 
                        href="/about/" 
                        className={classes.MenuButton} 
                        style={{backgroundColor:"#ddddddaa"}}>
                        <p>Acerca de</p>
                    </Link>                                

                <BackButton {...props} />
                </Block>                  
            </PageContent>
            <Footer />
        </Page>
    );
};

export default Info;