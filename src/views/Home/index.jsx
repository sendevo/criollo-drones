import { Page, Link, PageContent, Block } from 'framework7-react';
import Footer from '../../components/Footer';
import paramsIcon from '../../assets/icons/parametros.png'
import controlIcon from '../../assets/icons/verificacion.png'
import suppliesIcon from '../../assets/icons/calculador.png';
import reportsIcon from '../../assets/icons/reportes.png';
import securityIcon from '../../assets/icons/seguridad.png';
import infoIcon from '../../assets/icons/info.png';
import logoCriollo from '../../assets/icons/iconocriollo.png';
import classes from '../style.module.css';


const Home = () => (
    <Page name="home" className={classes.HomePage}>
        <PageContent className={classes.Content}>
            <div className={classes.BlueTop}></div>
            <svg
                className={classes.Wave}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1440 320"
                preserveAspectRatio="none">
                <path
                    fill="#245977"
                    d="M0,140 C380,190 1000,0 1440,50 L1440,0 L0,0 Z"/>
                </svg>
            <div className={classes.TitleContainer}>
                <div>
                    <h2 className={classes.Title}>Criollo</h2>
                    <h3 className={classes.Subtitle}>Drones</h3>
                </div>
                <img className={classes.AppLogo} src={logoCriollo} alt="logo"/>
            </div>
            
            <div className={classes.ButtonContainer}>
                <Link href="/params/" className={classes.MenuButton}>
                    <img className={classes.HomeIcon} src={paramsIcon} alt="params"/>
                    <p>Parámetros de <br/> aplicación</p>
                </Link>
                <Link href="/control/" className={classes.MenuButton}>
                    <img className={classes.HomeIcon} src={controlIcon} alt="control"/>
                    <p>Verificación de <br/> picos</p>
                </Link>
                <Link href="/supplies/" className={classes.MenuButton}>
                    <img className={classes.HomeIcon} src={suppliesIcon} alt="supplies"/>
                    <p>Calculador de <br/> mezcla</p>
                </Link>
                <Link href="/security/" className={classes.MenuButton}>
                    <img className={classes.HomeIcon} src={securityIcon} alt="security"/>
                    <p>Seguridad y <br/> prevención</p>
                </Link>
                <Link href="/reports/" className={classes.MenuButton}>
                    <img className={classes.HomeIcon} src={reportsIcon} alt="reports"/>
                    <p>Reportes</p>
                </Link>
                <Link href="/info/" className={classes.MenuButton}>
                    <img className={classes.HomeIcon} src={infoIcon} alt="info"/>
                    <p>Información <br/> y ayuda</p>
                </Link>
            </div>
        </PageContent>
        <Footer />
    </Page>
);

export default Home;