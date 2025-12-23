import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { UserAuth } from "../context/AuthContext";
import "./signup.css";

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState('');

    const {session, signUpNewUser} = UserAuth();
    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const result = await signUpNewUser(email, password)

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
        <div className="signup-container">
           <form className="signup-form" onSubmit={handleSignUp}>
                <h2>Create Your Account</h2>
                <span>Start mapping your project roadmaps today !</span>
                
                <div className="signup-input">
                    <span>Email Address</span>
                    <input onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" />
                    <span>Password</span>
                    <input onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" />
                    <button className="signup-btn" type="submit" disabled={loading}>Sign Up</button>
                    {error && <p>{error}</p>}
                </div>

                <p>
                    Already have an account ? <Link to="/signin">Sign In !</Link>
                </p>
            </form> 
        </div>
        
    
    </>)
};

export default Signup;