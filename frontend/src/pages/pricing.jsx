import './pricing.css';
import { UserAuth } from "../context/AuthContext";
import NavBar from "../components/navbar";
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
    const {session} = UserAuth();
    const API_BASE = import.meta.env.VITE_API_BASE_URL;
    const navigate = useNavigate();
    const handleRedirect = () => {
        navigate('/roadmap');
    }
    const plans = [
    {
        link:
            process.env.NODE_ENV === 'development'
                ? 'https://buy.stripe.com/8x29ATa231fU2uV82O0x201'
                : '',
        priceId: 'price_1ShsQMFlH7SBQc2IrVcxZEpi',
        price: 12,
        duration: '/month'
    },
    {
        link:
            process.env.NODE_ENV === 'development'
                ? 'https://buy.stripe.com/bJe6oHa232jY2uV3My0x200'
                : '',
        priceId: 'price_1ShsQMFlH7SBQc2IqYwFbHns',
        price: 29,
        duration: '/month'
    }
]

    const startCheckout = async (priceId) => {
        console.log("startcheckout received: ", priceId)
        const res = await fetch(`${API_BASE}/api/create-checkout-session`, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
            priceId: priceId
            })
        })

        if(!res.ok){
            const text = await res.text()
            console.error("Checkout error:", text)
            alert("Checkout failed")
            return
        }

        const data = await res.json()

        if (!data.url) {
            alert("Stripe URL missing")
            return
        }

        window.location.href = data.url
    }

    return (
        <>
        <NavBar />
            <div className='pricing-container'>
                <div className='pricing-title'>
                    <h1>Simple, Transparent <span>Pricing</span></h1>
                    <h3>Choose the perfect plan for your needs</h3> 
                </div>
                
                <div className='tab-container'>
                    <div className='tab'>
                        <div className='tab-title'>
                            <h2>Free</h2>
                            <h3>Perfect for trying out PathFinder</h3>  
                        </div>
                        {/*INSERT Pricing details */}
                        <h2><span>$0</span> /month</h2>
                        <button onClick={handleRedirect} className='norm-btn'>Get Started</button>
                        <ul className='tab-list'>
                            <li><span>&#10003;</span> Generate up to 3 AI Roadmaps / month</li>
                            <li><span>&#10003;</span> View basic Mermaid diagrams (user flow only)</li>
                            <li><span>&#10003;</span> Export roadmap to JSON</li>
                            <li><span>&#10003;</span> Access to community support</li>
                            <li><span>&#10006;</span> No component dependency diagram</li>
                            <li><span>&#10006;</span> No project save history (local only)</li>
                            <li><span>&#10006;</span> Slower generation queue (shared inference pool)</li>
                            <li><span>&#10006;</span> “Powered by” watermark</li>
                        </ul>
                        
                    </div>

                    <div className='tab-pro'>
                        <div className='badge'>Most Popular</div>
                        <div className='tab-title'>
                            <h2>Pro</h2>
                            <h3>For professionals and serious builders</h3> 
                        </div>
                        
                        {/*INSERT Pricing details */}
                        <h2><span>$12</span> /month</h2>
                        <button onClick={() => {console.log("clicked priceid: ", plans[0].priceId) 
                            startCheckout(plans[0].priceId)}}className='pro-btn'>Get Started</button>
                        <ul className='tab-list'>
                            <li><span>&#10003;</span> Generate up to 30 AI roadmaps / month</li>
                            <li><span>&#10003;</span> Includes both User Flow + Component Graphs</li>
                            <li><span>&#10003;</span> Save and revisit past projects (cloud sync)</li>
                            <li><span>&#10003;</span> Faster AI inference priority</li>
                            <li><span>&#10003;</span> Download to PDF / Markdown / JSON</li>
                            <li><span>&#10003;</span> Email support</li>
                            <li><span>&#10006;</span> No team collaboration</li>
                            <li><span>&#10006;</span> No custom model or fine-tuning</li>
                        </ul>
                        
                    </div>

                    <div className='tab'>
                        <div className='tab-title'>
                            <h2>Team/Enterprise</h2>
                            <h3>For teams and organizations</h3> 
                        </div>
                        
                        {/*INSERT Pricing details */}
                        <h2><span>$29</span> /month</h2>
                        <button onClick={() => startCheckout(plans[1].priceId)} className='norm-btn'>Get Started</button>
                        <ul className='tab-list'>
                            <li><span>&#10003;</span> Unlimited AI roadmap generations</li>
                            <li><span>&#10003;</span> Team collaboration: share and co-edit projects</li>
                            <li><span>&#10003;</span> Private inference endpoint (fastest generation)</li>
                            <li><span>&#10003;</span> Access to custom templates</li>
                            <li><span>&#10003;</span> API Access</li>
                            <li><span>&#10003;</span> Priority email + chat support</li>
                            <li><span>&#10006;</span> No self-hosted inference</li>
                        </ul>
                        
                    </div>

                </div>
                <div className='faq-container'>
                    <h1 className='faq-title'>Frequently Asked Questions</h1>

                    <div className='faq-tab'>
                        <p className='question'>Can I change plans later ?</p>
                        <p className='answer'>Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
                    </div>

                    <div className='faq-tab'>
                        <p className='question'>What payment methods do you accept?</p>
                        <p className='answer'>We accept all major credit cards, Stripe, and wire transfers for Enterprise plans.</p>
                    </div>

                    <div className='faq-tab'>
                        <p className='question'>INSERT ANOTHER QUESTION HERE</p>
                        <p className='answer'>Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
                    </div>
                </div>
            </div>
        </>
        
    )
}

export default Pricing;