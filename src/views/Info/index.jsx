import { Page, Link, PageContent, Block, Navbar } from 'framework7-react';
import { NavbarTitle, BackButton } from '../../components/Buttons';
import Footer from '../../components/Footer';
import classes from '../style.module.css';

const Info = props => {

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
                        href="/about/" 
                        className={classes.MenuButton} 
                        style={{backgroundColor:"#ddddddaa"}}>
                        <p>Acerca de</p>
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

                <BackButton {...props} />
                </Block>                  
            </PageContent>
            <Footer />
        </Page>
    );
};

export default Info;