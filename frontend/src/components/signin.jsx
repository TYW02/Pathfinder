import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { UserAuth } from "../context/AuthContext";
import "./signin.css";

const Signin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState('');

    const {session, signInUser} = UserAuth();
    const navigate = useNavigate();

    const handleSignIn = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const result = await signInUser(email, password)

            if(result.success) {
                navigate('/roadmap')
            }
        } catch(error) {
            setError("an error occurred")
        } finally {
            setLoading(false);
        }
    }
    return(<>
        <div className="signin-container">
           <form className="signin-form" onSubmit={handleSignIn}>
                <h2>Welcome Back</h2>
                <span>Sign in to continue to PathFinder</span>
                
                <div className="signin-input">
                    <span>Email Address</span>
                    <input onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" />
                    <span>Password</span>
                    <input onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" />
                    <button className="signin-page-btn" type="submit" disabled={loading}>Sign In</button>
                    {error && <p>{error}</p>}
                </div>

                <p>
                    Don't have an account ? <Link to="/signup">Sign Up !</Link>
                </p>
            </form> 
        </div>
        
    
    </>)
};

export default Signin;