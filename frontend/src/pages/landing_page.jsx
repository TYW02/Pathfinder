import "./landing_page.css";
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/pathfinder-logo.png';
import compassLogo from '../assets/pathfinder-compass.svg';
import networkLogo from '../assets/pathfinder-network.svg';
import zapLogo from '../assets/pathfinder-zap.svg';
import downloadLogo from '../assets/pathfinder-download.svg';

function LandingPage () {
    return(
        <>
            <div className="landing-container">
                <div className="hero-section">
                    <img className="logo-img" src={logo} />
                    <h1>Transform Ideas into <br /> Actionable Roadmaps</h1>
                    <h3>PathFinder uses AI to generate detailed project roadmaps and visual diagrams from your app ideas. Plan smarter, build faster.</h3>
                    <div className="hero-btn-section">
                        <Link to="/signup" className="started-btn">Get Started Free</Link>
                        <Link to="/signup" className='signin-btn'>Sign Up</Link>
                    </div>
                </div>

                <div className="description-section">
                    <h2>Everything you need to plan your new project</h2>
                    <div className="feature-container">
                        <div className="feature-box-yellow">
                            <div className="feature-box-text">
                                <img  className="compass" src={compassLogo}/>
                            </div>
                            <h3>AI-Powered Analysis</h3> 
                            <p>Our AI understands your app idea and breaks it down into actionable steps</p>
                            
                        </div>
                        <div className="feature-box-blue">
                            <div className="feature-box-text">
                                <img  className="network" src={networkLogo}/>
                            </div>
                            <h3>Visual Diagrams</h3>
                            <p>Generate Mermaid diagrams that show relationships and dependencies</p>
                        </div>
                        <div className="feature-box-yellow">
                            <div className="feature-box-text">
                                <img  className="zap" src={zapLogo}/>
                            </div>
                            <h3>Instant Generation</h3>
                            <p>Get your complete roadmap and diagram in seconds, not hours</p>
                        </div>
                        <div className="feature-box-blue">
                            <div className="feature-box-text">
                                <img  className="download" src={downloadLogo}/>
                            </div>
                            <h3>Export Anywhere</h3>
                            <p>Download your roadmaps and diagrams in multiple formats</p>
                        </div>
                    </div>
                </div>

                <div className="CTA-container">
                    <div className="CTA-section">
                        <h1>Ready to map your path to success ?</h1>
                        <h3>Start creating detailed roadmaps for your projects today</h3>
                        <button className="start-btn">Start For Free</button>
                    </div>
                </div>

                <div className="footer-container">
                    <div className="footer-left">
                        <img className="logo-img-sm" src={logo}/>
                        <h3>PathFinder AI</h3>
                    </div>
                    
                    <h3>© 2025 PathFinder. All rights reserved.</h3>
                </div>
            </div>
        </>
    )
}


export default LandingPage