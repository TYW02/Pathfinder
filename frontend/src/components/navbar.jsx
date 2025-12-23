import './navbar.css';
import { UserAuth } from "../context/AuthContext";
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/pathfinder-logo.png';

const NavBar = () => {

    const { session, signOut } = UserAuth();
    const navigate = useNavigate();

    const handleSignOut = async(e) => {
        e.preventDefault()
        try{
            await signOut()
            navigate('/')
        } catch (error){
            console.error(error);
        }
    }

    return(
        <>
            <div className="navbar-container">
                <div className="logo">
                    <img className='logo-img-navbar' src={logo}/>
                    <a className='home-link' href='/roadmap'><b>PathFinder</b></a>
                </div>

                <div className="link-container">
                    <Link to="/roadmap" className='link-items'>Home</Link>
                    <Link to="/pricing" className='link-items'>Pricing</Link>
                    <p onClick={handleSignOut}>Sign Out</p>
                </div>
            </div>
        </>
    )

}


export default NavBar;