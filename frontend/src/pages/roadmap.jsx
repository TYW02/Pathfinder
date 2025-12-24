import { useState, useEffect  } from 'react';
import './roadmap.css'
import { supabase } from '../supabaseClient.jsx';
import { UserAuth } from "../context/AuthContext";
import logo from '../assets/download-logo.svg';
import Loading from '../components/loading';
import NavBar from '../components/navbar';

{/*TODO: https://deepai.org/machine-learning-model/text2img follow this app UI*/}

function RoadMap() {

  const [roadmapResult, setRoadmapResult] = useState('')
  const [loading, setLoading] = useState(false);
  const [coreFeatures, setCoreFeatures] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [development_map, setDevelopmentMap] = useState([]);
  const [feature_map, setFeatureMap] = useState([]);
  const [userJourney, setUserJourney] = useState([]);
  const { session } = UserAuth()
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  function showLimitModal(plan) {
    alert(
      plan === "free"
      ? "You've reached your free monthly limit. Upgrade to Pro to continue."
      : "You've reached your monthly limit. Please upgrade your plan."
    );
  }

  const handleSubmit = async (e) => {
    {/*TODO: Add timer when generating roadmap*/}
    setLoading(true);
    e.preventDefault();
    const formData = new FormData(e.target)
    const user_prompt = formData.get('user-prompt')

    try{
          const response = await fetch(`${API_BASE}/api/roadmap`, {
            method: 'POST',
            headers: {
              "Authorization": `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({prompt: user_prompt}),
          })


      

      const data = await response.json();
        if(!response.ok) {
          if(response.status == 429 && data.upgrade_required) {
            showLimitModal(data.plan);
            return;
            }
            throw new Error(data.error || "Something went wrong.")
        }


      setRoadmapResult(data.data)
      setCoreFeatures(data.data.core_features)
      setPersonas(data.data.personas)
      setDevelopmentMap(data.data.development_roadmap)
      setFeatureMap(data.data.feature_mapping)
      setUserJourney(data.data.user_journeys[0])
      setLoading(false);

      


    }
    catch(error){
      console.error('Error: ', error)
    }
  }

  const handleDownload = async (e) => {
    e.preventDefault();
    try{
      const response = await fetch(`${API_BASE}/api/download-roadmap`)

      if(!response.ok){
        throw new Error(`Http error! status ${response.error}`)
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'roadmap.json';

      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
    catch(error){
      console.error('Error:', error)
      alert('Failed to download file. Please generate a roadmap first');
    }
    
  }

  const handleDownloadImage = async (e) => {
    e.preventDefault();
    try{
      const response = await fetch(`${API_BASE}/api/download-image`)

      if(!response.ok){
        throw new Error(`Http error! status ${response.error}`)
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'roadmap.zip';

      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
    catch(error){
      console.error('Error:', error)
      alert('Failed to download file. Please generate a roadmap first');
    }
    
  }



  useEffect(() => {
    // Load mermaid script
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js'
    script.onload = () => {
      window.mermaid.initialize({
        startOnLoad: true,
        theme: 'default',
        securityLevel: 'loose',
      });
      window.mermaid.contentLoaded();
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    }
  }, []);

  // Re-render diagrams when data changes
  useEffect(() => {
    if (roadmapResult?.diagrams && window.mermaid) {
      window.mermaid.contentLoaded();
    }
  }, [roadmapResult]);

    

  return (
    <>
      <NavBar/>
      <div className='main-container'>

        <div className='header-container'>
          <h1 className='app-title'>Transform Your Ideas Into <span className='grad-title'>Actionable Roadmaps</span></h1>
          <h3 className='title-sub'>AI-powered roadmap generation with visual diagrams</h3>
          
        </div>

        <div className='app-container'>
          <div className='left-app'>
            <div className='user-container'>
              <h3 className='app-sub'>Describe Your App Idea</h3>
              <form className='user-form' onSubmit={handleSubmit}>
                <textarea className='user-prompt' 
                placeholder='E.g., A mobile app that helps users track their daily water intake with reminders and gamification features...' 
                name='user-prompt'/>
                <button className='genButton' type='submit'>{loading ? (<Loading className="spinner"/>) : (<></>)}Generate Roadmap</button>
              </form>
            
            </div>



            {coreFeatures.length !== 0 || 
            personas.length !== 0 || 
            userJourney.length !== 0 ? (

              <div className='list-wrapper'>
              <div className='list-header'>
                <h2>Project Roadmap</h2>
                {roadmapResult.length != 0 ? (<><button className='json-btn' onClick={handleDownload}><img className='download-logo' src={logo} /><span>Download JSON</span></button></>) : (<></>)}
              </div>

              <div className='list-container'>
                <div className='list-tab'>
                  {coreFeatures.length != 0 ? (<><div className='list-title-container'><div className='list-number-1-3'>1</div><h2 className='list-title'>Core Features</h2></div></>) : <></>}
                  <ul className='listings'>
                    {coreFeatures.map((features) => {
                    return (<li>{features}</li>)})}
                  </ul>
                </div>
                

                <div className='list-tab'>
                  {personas.length != 0 ? (<><div className='list-title-container'><div className='list-number-2-4'>2</div><h2 className='list-title'>Personas</h2></div></>) : <></>}
                  <ul className='listings'>
                    {personas.map((people) => {
                    return (<li>{people}</li>)})}
                  </ul>   
                </div>
                
                <div className='list-tab'>
                  {userJourney.length != 0 ? (<><div className='list-title-container'><div className='list-number-1-3'>3</div><h2 className='list-title'>Development Roadmap</h2></div></>) : <></>}
                  {development_map.map((item, index) => (
                    <div key={index}>
                      <h3 className='mapping-title'>{item.milestone}</h3>
                      <ul>
                        {item.description.map((descriptions, i) => (
                          <li className='mapping-item' key={i}>{descriptions}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className='list-tab'>
                  {feature_map.length != 0 ? (<><div className='list-title-container'><div className='list-number-2-4'>4</div><h2 className='list-title'>Feature Mapping</h2></div></>) : <></>}
                  {feature_map.map((item, index) => (
                    <div key={index}>
                      <h3 className='mapping-title'>{item.feature}</h3>
                      <ul>
                        {item.components.map((component, i) => (
                          <li className='mapping-item' key={i}>{component}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            ) : null}
            
          </div>
          
          

          
            {roadmapResult.length != 0 ? (
            <>
              <div className='right-app'>
                <div className='right-header'>
                  <h2>Visual Diagram</h2>
                  {roadmapResult.length != 0 ? (<><button className='diagram-btn' onClick={handleDownloadImage}><img className='download-logo' src={logo} /><span>Download Diagram</span></button></>) : (<></>)}
                </div>
                
                <div className='roadmap-show'>
                
                  {roadmapResult?.diagrams?.user_flow && (
                    <div className='mermaid-container'>
                      <h2>User Flow</h2>
                      <div>
                        <pre className="mermaid">{roadmapResult.diagrams.user_flow.join("\n")} </pre>
                      </div>
                    </div>
                    
                  )}
                  {roadmapResult?.diagrams?.component_dependencies && (
                    <div className='mermaid-container'>
                      <h2>Component Dependencies</h2>
                      <pre className="mermaid">{roadmapResult.diagrams.component_dependencies.join("\n")}</pre>
                    </div>
                  )}
                
                  
                
                </div>
              </div>
            </>) : <></>}
            
          
        </div>
          
      </div>
      
    </>
  )

  
}



export default RoadMap
