import os
import json
from dotenv import load_dotenv
from huggingface_hub import InferenceClient
import streamlit as st
from streamlit_mermaid import st_mermaid


'''
I want to build a mobile app that helps students plan their study schedule and get reminders for upcoming exams.
'''

load_dotenv()

repo_id = "google/flan-t5-base"

# TODO: Find faster model
llm_client = InferenceClient(
    provider="featherless-ai",
    api_key=os.getenv("HF_TOKEN")
)

def query_mistral_direct(inference_client, message):
    """Direct API call to Hugging Face Inference API"""

    try:
        payload = inference_client.chat.completions.create(
            model="inclusionAI/Ling-1T",
            messages=message,
        )
        return payload        
       
    except Exception as e:
        return {"error": str(e)}

def show_mermaid(mermaid_code, height=500):
    #st_mermaid(mermaid_code)
    html = f"""
    <div style="
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #0d1117;
        border-radius: 12px;
        padding: 20px;
        height: {height}px;
        overflow: auto;
        box-shadow: 0 0 10px rgba(0,0,0,0.3);
    ">
        <div style="width: 95%; max-width:1000px; text-align:center;">
            <pre class="mermaid" 
                style="height:auto; color:white; font-size:14px;">
                {mermaid_code}
            </pre>
        </div>
    </div>
    <script type="module">
        import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
        mermaid.initialize({{ startOnLoad: true }});
    </script>
    """
    st.components.v1.html(html, height=height + 50, scrolling=False)
    

# System Prompt
# TODO: Maybe output a prompt so users can send it to claude to code it automatically
SYSTEM_PROMPT = """
You are a product architect assistant.
Given a developer's project description, output a structured JSON object with the following fields:

{
  "personas": [ "list of key user types" ],
  "core_features": [ "list of main features" ],
  "user_journeys": [
    [ "step-by-step description of how a user interacts with the app" ]
  ],
  "development_roadmap": [
    { "milestone": "short title", "description": "brief explanation" }
  ],
  "diagrams": {
    "user_flow": "Mermaid code for user flow (flowchart TD/LR)",
    "component_dependencies": "Mermaid code for directed graph of technical components and dependencies"
  }
}

Guidelines:
- Always output **valid JSON** only (no Markdown, no explanations, no code fences).
- The Mermaid code must be plain strings (escape double quotes if needed).
- The 'component_dependencies' diagram should show major app components (e.g., Database, API, Auth, Frontend pages) and their dependency flow.

"""

st.set_page_config(
    page_title="AI App Roadmap Generator",
    layout="wide",
)

_, col2, _ = st.columns([1, 2, 1])

with col2:
    st.title("Roadmap Generator")

    st.markdown("""
    Welcome to [App Name], your AI Roadmap Generator!\n
    Type in your app idea and let us generate a path for you.
    """)

    user_prompt = st.text_area("Describe your project idea: ", placeholder="Describe your project function...", width= 2000)
    
message = [
    {"role": "system", "content": SYSTEM_PROMPT},
    {"role": "user", "content": user_prompt}
]

if "roadmap_data" not in st.session_state:
    st.session_state.roadmap_data = None

if user_prompt and st.session_state.roadmap_data is None:
    print("Calling API...")
    with st.spinner("Generating Roadmap, Please give us a moment...", show_time=True):
        result = query_mistral_direct(llm_client, message)
    content = result.choices[0].message["content"]

    try:
        data = json.loads(content)
        st.session_state.roadmap_data = data
        print("\n=== Personas ===")
        print(data["personas"])

        print("\n=== Roadmap ===")
        for step in data["development_roadmap"]:
            print(f"- {step['milestone']}: {step['description']}")

        print("\n=== User Flow (Mermaid) ===")
        print(data["diagrams"]["user_flow"])

        print("\n=== Project Components ===")
        print(data["diagrams"]["component_dependencies"])

    except json.JSONDecodeError:
        print("Model did not return valid JSON, printing raw text: ")
        print(content)

if st.session_state.roadmap_data:
    data = st.session_state.roadmap_data

    col1, col2 = st.columns(2)
    with col1:
        st.subheader("User Flow Diagram")
        show_mermaid(data["diagrams"]["user_flow"])

    with col2:
        st.subheader("Component Dependency Graph")
        show_mermaid(data["diagrams"]["component_dependencies"])

    json_str = json.dumps(data, indent=2)
    st.download_button(
            label="Download JSON file",
            data=json_str,
            file_name="roadmap.json",
            mime="application/json"
        )


