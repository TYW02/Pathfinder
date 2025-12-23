from flask import Flask, jsonify, request, make_response, send_file
from huggingface_hub import InferenceClient
from dotenv import load_dotenv
import os
import json
import flask
import zipfile
from flask_cors import CORS
import base64
import io, requests
import jwt
import stripe
from supabase import create_client
from datetime import datetime, timezone
from PIL import Image

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5000"], supports_credentials=True)
stripe.api_key = os.getenv("STRIPE_NON_PUB_KEY")
supabase = create_client(
   os.getenv("SUPABASE_URL"),
   os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)
load_dotenv()

# TODO: Find faster model
llm_client = InferenceClient(
    provider="featherless-ai",
    api_key=os.getenv("HF_TOKEN")
)

MODEL_BY_TIER = {
  "free": {
    "model": "inclusionAI/Ling-1T",
    "monthly_limit": 3
  },
  "pro": {
    "model": "inclusionAI/Ling-1T",
    "monthly_limit": 30
  },
  "team": {
    "model": "inclusionAI/Ling-1T",
    "monthly_limit": 300
  }

}
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
def get_user_id_from_jwt(request):
  auth = request.headers.get("Authorization")
  if not auth:
    return None
  
  token = auth.replace("Bearer ", "")
  payload = jwt.decode(
    token,
    SUPABASE_JWT_SECRET,
    algorithms=["HS256"],
    audience="authenticated"
  )
  return {
    "id": payload["sub"],
    "email": payload["email"]
    }

def map_price_to_plan(price_id):
    if price_id == os.getenv("STRIPE_PRO_PRICE"):
        return "pro"
    if price_id == os.getenv("STRIPE_TEAM_PRICE"):
        return "team"
    return "free"

def get_user_plan(user_id):
    res = supabase.table("profiles") \
        .select("plan") \
        .eq("id", user_id) \
        .single() \
        .execute()

    return res.data["plan"]

def upsert_subscription(user_id, customer_id, subscription_id, price_id, status, period_end, plan):
    
    period_end_iso = datetime.fromtimestamp(period_end).strftime('%Y-%m-%d %H:%M:%S%z')

    supabase.table("subscriptions").upsert({
        "user_id": user_id,
        "stripe_customer_id": customer_id,
        "stripe_subscription_id": subscription_id,
        "price_id": price_id,
        "status": status,
        "current_period_end": period_end_iso
    }).execute()

    supabase.table("profiles").update({
        "plan": plan
    }).eq("id", user_id).execute()


def handle_new_subscription(user_id, customer_id, subscription_id):
    subscription = stripe.Subscription.retrieve(subscription_id)

    price_id = subscription["items"]["data"][0]["price"]["id"]
    status = subscription["status"]
    period_end = subscription.get("current_period_end")

    if not period_end:
            # If no period_end, set a default (end of current day + 30 days)
            # Or handle it differently based on your business logic
            import time
            period_end = int(time.time()) + (30 * 24 * 60 * 60)  # 30 days from now

    # Map price → plan
    plan = map_price_to_plan(price_id)
    upsert_subscription(
        user_id,
        customer_id,
        subscription_id,
        price_id,
        status,
        period_end,
        plan
    )

def current_month():
  return datetime.now(timezone.utc).strftime("%Y-%m")

def check_and_increment_usage(user_id):
  plan = get_user_plan(user_id)
  plan_config = MODEL_BY_TIER[plan]
  limit = plan_config["monthly_limit"]
  month = current_month

  res = supabase.table("usage_counters") \
        .select("*") \
        .eq("user_id", user_id) \
        .execute()
  
  if len(res.data) == 0:
     supabase.table("usage_counters").insert({
        "user_id": user_id,
        "requests": 1,
        "month": datetime.now(timezone.utc).strftime("%Y-%m")
     }).execute()
     return True
  
  usage = res.data[0]

  if usage["requests"] >= limit:
     return False
  
  supabase.table("usage_counters") \
        .update({"requests": usage["requests"]+1}) \
        .eq("user_id", user_id) \
        .execute()
  
  return True





def show_mermaid(mermaid_code, savename):
  try:
    graphbytes = mermaid_code.encode("utf8")
    base64_bytes = base64.urlsafe_b64encode(graphbytes)
    base64_string = base64_bytes.decode("ascii")
    response = requests.get('https://mermaid.ink/img/' + base64_string)
    response.raise_for_status()

    img = Image.open(io.BytesIO(response.content))
    img.save(f'{savename}.png', 'PNG', dpi=(300, 300))
    print(f"Saved {savename}.png")
  except Exception as e:
     print(f"Error generating diagram {savename}: {str(e)}")


# TODO: Maybe output a prompt so users can send it to claude to code it automatically
SYSTEM_PROMPT = """
You are a product architect assistant.

Your task:
Given a developer's project description, output ONE valid JSON object matching EXACTLY the structure below.

================ REQUIRED JSON STRUCTURE ================

{
  "personas": [ "string" ],
  "core_features": [ "string" ],
  "feature_mapping": [
    {
      "feature": "string",
      "components": [ "string" ]
    }
  ],
  "user_journeys": [
    [ "string" ]
  ],
  "development_roadmap": [
    {
      "description": [ "string" ],
      "milestone": "string"
    }
  ],
  "diagrams": {
    "user_flow": [ "string" ],
    "component_dependencies": [ "string" ]
  }
}

================ DIAGRAM RULES (CRITICAL) ================

1. BOTH diagrams MUST be ARRAYS OF STRINGS.
2. EACH string represents EXACTLY ONE Mermaid line.
3. DO NOT include:
   - title
   - note
   - subgraph
   - comments
   - explanations
4. DO NOT use "\\n" or actual newlines inside strings.
5. DO NOT return diagram content as a single string.
6. DO NOT escape newlines.
7. ONLY valid Mermaid syntax lines are allowed.

================ MERMAID REQUIREMENTS ====================

User Flow:
- Must start with: flowchart TD OR flowchart LR
- Represents user interaction steps

Component Dependencies:
- Must start with: flowchart TD
- Shows technical components and dependencies

================ STYLING RULES ===========================

- Important nodes MUST be styled using:
  - #d69e2e (primary)
  - #535bf2 (secondary)
- ALL links must use #d69e2e
- Use Mermaid syntax ONLY:

  style NODE_ID fill:#d69e2e,stroke:#d69e2e,color:#fff
  linkStyle INDEX stroke:#d69e2e,stroke-width:2px

================ VALID EXAMPLE ===========================

"diagrams": {
  "user_flow": [
    "flowchart TD",
    "A[User Login] --> B[Add Courses]",
    "B --> C[Generate Plan]",
    "C --> D[Receive Notifications]",
    "style A fill:#d69e2e,stroke:#d69e2e,color:#fff",
    "style C fill:#535bf2,stroke:#535bf2,color:#fff",
    "linkStyle 0 stroke:#d69e2e,stroke-width:2px",
    "linkStyle 1 stroke:#d69e2e,stroke-width:2px",
    "linkStyle 2 stroke:#d69e2e,stroke-width:2px"
  ],
  "component_dependencies": [
    "flowchart TD",
    "A[Frontend] --> B[API]",
    "B --> C[(Database)]",
    "B --> D[Auth Service]",
    "style B fill:#d69e2e,stroke:#d69e2e,color:#fff",
    "style C fill:#535bf2,stroke:#535bf2,color:#fff",
    "linkStyle 0 stroke:#d69e2e,stroke-width:2px",
    "linkStyle 1 stroke:#d69e2e,stroke-width:2px",
    "linkStyle 2 stroke:#d69e2e,stroke-width:2px"
  ]
}

"feature_mapping": [
  {
    "feature": "Create study plan",
    "components": ["Study plan generator"]
  }
]


================ OUTPUT RULES ============================

- Output ONLY valid JSON.
- No markdown.
- No explanations.
- No extra keys.
- If ANY rule is violated, the output is INVALID.

Begin.
"""


latest_result = None

@app.route('/')
def home():
    return jsonify({"message": "Flask server is running!", "status": "success"})

@app.route('/api/roadmap', methods=['POST'])
def get_roadmap():
    global latest_result

    user = get_user_id_from_jwt(request)
    user_id = user["id"]

    # Rate limit check
    allowed = check_and_increment_usage(user_id)
    if not allowed:
       return jsonify({
          "error": "Monthly usage limit reached",
          "plan": get_user_plan(user_id),
          "upgrade_required": True
       }), 429

    # Pick model based on plan
    plan = get_user_plan(user_id)
    tier_config = MODEL_BY_TIER.get(plan, MODEL_BY_TIER["free"])
    model_name = tier_config["model"]

    data = request.get_json()

    user_prompt = data['prompt']

    message = [
    {"role": "system", "content": SYSTEM_PROMPT},
    {"role": "user", "content": user_prompt}
    ]

    if flask.request.method == 'POST':
      try:
        print("Generating Roadmap...")
        payload = llm_client.chat.completions.create(
          model=model_name,
            messages=message,
        )
        content = payload.choices[0].message["content"]   
        data = json.loads(content)  
        latest_result = data

        

        user_flow_diagram = "\n".join(data["diagrams"]["user_flow"])
        component_diagram = "\n".join(data["diagrams"]["component_dependencies"])
        show_mermaid(user_flow_diagram, savename="user_flow")
        show_mermaid(component_diagram, savename="component")

        
        # TODO: Return PNG to frontend
        return jsonify({"data": data, "status": "success"})
      
      except Exception as e:
          print("LLM Error: ", type(e).__name__, str(e))
          raise
      
@app.route('/api/download-roadmap', methods=['GET'])
def download_roadmap():
  if latest_result is None:
    return jsonify({"error": "No roadmap generated yet"})
       
  json_str = json.dumps(latest_result, indent=2)
  response = make_response(json_str)
  response.headers['Content-Type'] = 'application/json'
  response.headers['Content-Distribution'] = 'attachment; filename=roadmap.json'
  return response

@app.route('/api/download-image', methods=['GET'])
def download_image():
  if latest_result is None:
    return jsonify({"error": "No roadmap generated yet"})
  
  try:
    with open("component.png", "rb") as f1, open("user_flow.png", "rb") as f2:
      pass
  except:
    return jsonify({"error": "PNG files not found"}, 404)
  
  # Create ZIP file in memory
  memory_file = io.BytesIO()
  with zipfile.ZipFile(memory_file, "w") as z:
    z.write("component.png")
    z.write("user_flow.png")

  memory_file.seek(0)

  return send_file(
    memory_file,
    mimetype="application/zip",
    as_attachment=True,
    download_name="roadmap_images.zip"
  )
  
@app.route("/api/create-checkout-session", methods=["POST"])
def create_checkout():
    user = get_user_id_from_jwt(request)

    checkout = stripe.checkout.Session.create(
        mode="subscription",
        customer_email=user["email"],
        metadata={
            "user_id": user["id"]  # THIS IS CRITICAL
        },
        line_items=[{
            "price": request.json["priceId"],
            "quantity": 1
        }],
        success_url="http://localhost:5173/pricing",
        cancel_url="http://localhost:5173/pricing"
    )

    return jsonify({"url": checkout.url})

@app.route("/api/stripe-webhook", methods=["POST"])
def stripe_webhook():
    payload = request.data
    sig_header = request.headers.get("Stripe-Signature")

    try:
        event = stripe.Webhook.construct_event(
            payload,
            sig_header,
            os.getenv("STRIPE_WEBHOOK_SECRET")
        )
    except Exception as e:
        return str(e), 400

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]

        user_id = session["metadata"]["user_id"]
        customer_id = session["customer"]
        subscription_id = session["subscription"]

        handle_new_subscription(
            user_id,
            customer_id,
            subscription_id
        )

    return jsonify({"received": True})


if __name__ == '__main__':
  app.run(debug=True)
    