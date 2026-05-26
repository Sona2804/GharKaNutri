# 🥗 GharKaNutri: AI Indian Household Nutritionist & Diet Planner
# Clinical-grade interactive home nutritionist using pure deterministic calculations and grounded food maps.

import os
import re
import streamlit as st
from google import genai
from google.genai import types

# -----------------------------------------------------------------------------
# 1. PAGE SETUP & THEME (Streamlit aesthetic rules)
# -----------------------------------------------------------------------------
st.set_page_config(
    page_title="GharKaNutri: AI Indian Nutritionist",
    page_icon="🥗",
    layout="wide",
    initial_sidebar_state="expanded",
)

st.markdown("""
<style>
    .reportview-container {
        background: #f8fafc;
    }
    .main .block-container{
        padding-top: 2rem;
    }
    .clinical-math-card {
        background-color: #ffffff;
        border-radius: 8px;
        padding: 1.5rem;
        border-left: 5px solid #10b981;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        margin-bottom: 1rem;
    }
    .clinical-disclaimer {
        font-size: 0.82rem;
        color: #64748b;
        background-color: #f1f5f9;
        border-radius: 6px;
        padding: 0.8rem;
        border-left: 3px solid #ef4444;
        margin-top: 1.5rem;
    }
</style>
""", unsafe_allow_html=True)


# -----------------------------------------------------------------------------
# 2. INTERNAL KNOWLEDGE BASE (Dictionary-based Grounding)
# -----------------------------------------------------------------------------
INDIAN_INGREDIENT_DATABASE = [
    {
        "name": "Split Yellow Pigeon Peas (Toor Dal)",
        "localName": "Arhar / Toor Dal (Cooked)",
        "category": ["Vegetarian", "Vegan", "Non-Vegetarian"],
        "macros_per_100g": {"protein": 6.8, "carbs": 18.2, "fat": 0.4, "fiber": 5.1, "calories": 104},
        "dominant_micros": ["Folate (B9)", "Iron", "Zinc", "Potassium"],
        "notes": "Core protein staple in Indian diets. Best paired with rice or millet bhakri for complete amino acid sequence."
    },
    {
        "name": "Bengal Gram / Chickpeas",
        "localName": "Kala Chana / Kabuli Chana (Boiled)",
        "category": ["Vegetarian", "Vegan", "Non-Vegetarian"],
        "macros_per_100g": {"protein": 8.9, "carbs": 27.4, "fat": 1.9, "fiber": 7.6, "calories": 164},
        "dominant_micros": ["Iron", "Folate", "Magnesium"],
        "notes": "Extremely high iron non-heme source. Optimal vegan glycemic control grain."
    },
    {
        "name": "Soya Chunks",
        "localName": "Soya Bari (Rehydrated)",
        "category": ["Vegetarian", "Vegan", "Non-Vegetarian"],
        "macros_per_100g": {"protein": 18.5, "carbs": 8.2, "fat": 0.5, "fiber": 6.5, "calories": 110},
        "dominant_micros": ["Iron", "Calcium", "Magnesium"],
        "notes": "Extremely biological muscle-synthesizing density. Incredible value budget source for Indian vegans."
    },
    {
        "name": "Indian Cottage Cheese",
        "localName": "Paneer (Fresh, Full Cream)",
        "category": ["Vegetarian", "Non-Vegetarian"], # NOT VEGAN
        "macros_per_100g": {"protein": 18.2, "carbs": 1.2, "fat": 20.8, "fiber": 0, "calories": 265},
        "dominant_micros": ["Calcium", "Vitamin B12", "Phosphorus"],
        "notes": "Rich vegetarian protein & bone density builder. Omit fully from Vegan diets."
    },
    {
        "name": "Fresh Curd/Yogurt",
        "localName": "Ghar ka Dahi",
        "category": ["Vegetarian", "Non-Vegetarian"], # NOT VEGAN
        "macros_per_100g": {"protein": 3.5, "carbs": 4.7, "fat": 3.2, "fiber": 0, "calories": 61},
        "dominant_micros": ["Calcium", "Vitamin B12", "Probiotics"],
        "notes": "Local probiotic. Vital for Indian digestion and intestinal vitamin synthesis."
    },
    {
        "name": "Ragi Flour (Finger Millet)",
        "localName": "Ragi Roti / Mandua",
        "category": ["Vegetarian", "Vegan", "Non-Vegetarian"],
        "macros_per_100g": {"protein": 7.3, "carbs": 72.6, "fat": 1.3, "fiber": 11.5, "calories": 328},
        "dominant_micros": ["Calcium (Highly Dense)", "Iron", "Fiber"],
        "notes": "Powerhouse ancient millet. Contains higher organic calcium concentration than synthetic dairy substitutes."
    },
    {
        "name": "Pearl Millet",
        "localName": "Bajra Roti",
        "category": ["Vegetarian", "Vegan", "Non-Vegetarian"],
        "macros_per_100g": {"protein": 11.6, "carbs": 67.5, "fat": 5.0, "fiber": 8.1, "calories": 361},
        "dominant_micros": ["Iron", "Magnesium", "Zinc"],
        "notes": "Highly digestible ancient winter crop. Supports hemoglobin levels organically."
    },
    {
        "name": "Spinach (Fresh Leaf)",
        "localName": "Palak (Boiled)",
        "category": ["Vegetarian", "Vegan", "Non-Vegetarian"],
        "macros_per_100g": {"protein": 2.9, "carbs": 3.6, "fat": 0.4, "fiber": 2.2, "calories": 23},
        "dominant_micros": ["Vitamin A", "Folate", "Iron", "Vitamin C"],
        "notes": "Local green leaf. Always boil and squeeze citrus (lemon juice) over it to unlock locked non-heme iron bounds."
    },
    {
        "name": "White Sesame Seeds",
        "localName": "Til",
        "category": ["Vegetarian", "Vegan", "Non-Vegetarian"],
        "macros_per_100g": {"protein": 17.7, "carbs": 23.4, "fat": 49.7, "fiber": 11.8, "calories": 573},
        "dominant_micros": ["Calcium", "Iron", "Magnesium"],
        "notes": "Supercharger vegan calcium food. Highly recommended for dairy-free repletion profile."
    },
    {
        "name": "Fresh Whole Egg",
        "localName": "Boiled Egg (Anda)",
        "category": ["Non-Vegetarian"], # NOT VEG, NOT VEGAN
        "macros_per_100g": {"protein": 12.6, "carbs": 1.1, "fat": 10.6, "fiber": 0, "calories": 155},
        "dominant_micros": ["Vitamin B12", "Vitamin D", "Choline", "Selenium"],
        "notes": "Perfect essential reference amino acid score. Supplies biological dense D3 and B12."
    },
    {
        "name": "Lean Chicken",
        "localName": "Murgh Curry / Kabab",
        "category": ["Non-Vegetarian"], # NOT VEG, NOT VEGAN
        "macros_per_100g": {"protein": 31.0, "carbs": 0, "fat": 3.6, "fiber": 0, "calories": 165},
        "dominant_micros": ["Vitamin B12", "Zinc", "Iron"],
        "notes": "Refined macro source. Extreme rates of system protein absorption."
    }
]

# Lab reference standards
LAB_STANDARDS = {
    "vitamin_d3": {
        "name": "Vitamin D3 (25-OH)",
        "unit": "ng/mL",
        "normal_min": 30.0,
        "normal_max": 100.0,
        "deficiency_cutoff": 20.0,
        "ul": "4,000 IU/day chronic limit. Repletion dose: 60,000 IU/week for 8 weeks."
    },
    "vitamin_b12": {
        "name": "Vitamin B12 (Cobalamin)",
        "unit": "pg/mL",
        "normal_min": 211.0,
        "normal_max": 911.0,
        "deficiency_cutoff": 200.0,
        "ul": "No established toxic standard limit. RDA is 2.4 mcg/day; Repletion standard: 1,500 mcg/day or injection."
    },
    "hemoglobin": {
        "name": "Hemoglobin",
        "unit": "g/dL",
        "normal_min_male": 13.5,
        "normal_min_female": 12.0,
        "normal_max": 17.5,
        "deficiency_cutoff": 12.0,
        "ul": "45 mg daily of therapeutic elemental iron max (oral) to avoid toxicity."
    },
    "calcium": {
        "name": "Serum Calcium",
        "unit": "mg/dL",
        "normal_min": 8.5,
        "normal_max": 10.2,
        "deficiency_cutoff": 8.5,
        "ul": "2,500 mg daily limit. Deficiency repletion target: 500-1000 mg daily in split servings with meal."
    }
}


# -----------------------------------------------------------------------------
# 3. UTILITY FUNCTIONS & CALCULATORS (Deterministic Math)
# -----------------------------------------------------------------------------
def calculate_bmr_and_tdee(weight_kg, height_cm, age_yrs, gender, activity_lvl):
    """
    Deterministic Mifflin-St Jeor Equation model implementation.
    """
    # BMR Calculation
    if gender == "Male":
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age_yrs + 5
    else:
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age_yrs - 161
        
    # Activity factor multipliers
    multipliers = {
        "Sedentary (no exercise)": 1.2,
        "Light (1-3 days/week)": 1.375,
        "Moderate (3-5 days/week)": 1.55,
        "Active (6-7 days/week)": 1.725,
        "Heavy physical work": 1.9,
    }
    
    factor = multipliers.get(activity_lvl, 1.2)
    tdee = bmr * factor
    
    return int(bmr), int(tdee)


def evaluate_blood_levels(metric_id, value, gender):
    """
    Evaluates deficiency status and supplements calculation targets safely below UL.
    """
    meta = LAB_STANDARDS.get(metric_id)
    if not meta:
        return None
        
    min_val = meta["normal_min"] if "normal_min" in meta else (
        meta["normal_min_male"] if gender == "Male" else meta["normal_min_female"]
    )
    max_val = meta["normal_max"]
    deficiency_limit = meta["deficiency_cutoff"]
    
    is_low = value < min_val
    status = "Normal"
    recommendation = ""
    diet_additions = ""
    
    if is_low:
        if value < deficiency_limit * 0.6:
            status = "Severely Deficient"
        elif value < deficiency_limit:
            status = "Deficient"
        else:
            status = "Insufficient"
            
        if metric_id == "vitamin_d3":
            recommendation = "Repletion Schedule: 60,000 IU oral cholecalciferol capsule weekly for 8 consecutive weeks, then 2,000 IU/day maintenance. Retest serum levels after 12 weeks."
            diet_additions = "Inclusion of early morning indirect uv synthesis (15 mins), dietary fortified milks, organic butter or cheese (Vegetarian) or pasture-raised egg yolk (Non-Veg)."
        elif metric_id == "vitamin_b12":
            recommendation = "Repletion Schedule: Sublingual methylcobalamin at 1,000 mcg to 1,500 mcg daily for 6 weeks, or weekly intramuscular injections of 1,000 mcg administered by medical practitioner."
            diet_additions = "Fermented local elements: curd/dahi, buttermilk, or paneer (Vegetarian), nutritional yeast flakes or fortified plant milks (Vegan), whole fish/chicken (Non-Veg)."
        elif metric_id == "hemoglobin":
            recommendation = "Repletion Schedule: Oral administration of 60 mg of elemental iron (as ferrous ascorbate) twice daily coupled with 500 mg Vitamin C. Do not ingest dairy/tea within 2 hours of dosage."
            diet_additions = "Green amaranth, cooked iron kadhai spinach, sprouted chana/moong salad, black raisins, or cooked lamb liver (Non-Veg) combined with direct lemon water drops."
        elif metric_id == "calcium":
            recommendation = "Repletion Schedule: Supplemental 500 mg elemental calcium (as calcium citrate malate) orally twice daily alongside meals to maximize gastrointestinal receptor load."
            diet_additions = "Finger millet (ragi), horse gram broth, white cooked sesame seeds, organic cow paneer (Vegetarian), and organic high-calcium firm tofu (Vegan)."
    else:
        recommendation = "Blood biomarker is optimal. Continue your customized maintenance meal profile."
        diet_additions = "Eat localized staples corresponding to your tier."
        
    return {
        "status": status,
        "is_low": is_low,
        "min_val": min_val,
        "max_val": max_val,
        "recommendation": recommendation,
        "diet_additions": diet_additions,
        "ul": meta["ul"]
    }


def parse_lab_reports_simulated(text_data):
    """
    Simulates clinical NLP scanner that isolates keywords and metrics from unstructured records.
    """
    results = {}
    text_lower = text_data.lower()
    
    # 1. Vit D3
    d3_match = re.search(r'(?:vitamin d3|vit d3|vitamin d|vit d)\s*[:=]?\s*(\d+(?:\.\d+)?)', text_lower)
    if d3_match:
        results["vitamin_d3"] = float(d3_match.group(1))
        
    # 2. B12
    b12_match = re.search(r'(?:vitamin b12|vit b12|b12|cobalamin)\s*[:=]?\s*(\d+(?:\.\d+)?)', text_lower)
    if b12_match:
        results["vitamin_b12"] = float(b12_match.group(1))
        
    # 3. Hemoglobin
    hb_match = re.search(r'(?:hemoglobin|hb)\s*[:=]?\s*(\d+(?:\.\d+)?)', text_lower)
    if hb_match:
        results["hemoglobin"] = float(hb_match.group(1))
        
    # 4. Serum Calcium
    cal_match = re.search(r'(?:calcium|serum calcium)\s*[:=]?\s*(\d+(?:\.\d+)?)', text_lower)
    if cal_match:
        results["calcium"] = float(cal_match.group(1))
        
    return results


# -----------------------------------------------------------------------------
# 4. STREAMLIT FRONTEND LAYOUT
# -----------------------------------------------------------------------------
st.title("🥗 GharKaNutri: AI Indian Household Nutritionist")
st.caption("Clinical-Grade Indian Household Nutritionist with Grounded Deterministic Math and Food Safety.")

# ---- SIDEBAR: USER INPUT ENVIRONMENT ENGINE ----
st.sidebar.header("📊 Household Profile Settings")

diet_tier = st.sidebar.radio(
    " Dietary Category",
    options=["Vegetarian", "Vegan", "Non-Vegetarian"],
    index=0
)

gender_val = st.sidebar.selectbox("Gender Assigned at Birth", ["Female", "Male"])
age_val = st.sidebar.slider("Age (years)", min_value=1, max_value=110, value=30)
weight_val = st.sidebar.number_input("Weight (kg)", min_value=15.0, max_value=250.0, value=65.0, step=0.5)
height_val = st.sidebar.number_input("Height (cm)", min_value=50.0, max_value=250.0, value=165.0, step=1.0)

activity_lvl = st.sidebar.selectbox(
    "Physical Activity Coefficient",
    options=[
        "Sedentary (no exercise)",
        "Light (1-3 days/week)",
        "Moderate (3-5 days/week)",
        "Active (6-7 days/week)",
        "Heavy physical work"
    ],
    index=0
)

# Deterministic energy output BMR/TDEE calculations
bmr, tdee = calculate_bmr_and_tdee(weight_val, height_val, age_val, gender_val, activity_lvl)

st.sidebar.divider()
st.sidebar.subheader("🩸 Clinical Lab Report Upload")
uploaded_file = st.sidebar.file_uploader(
    "Upload Medical Lab Report (TXT/PDF format)", 
    type=["txt", "pdf", "docx"],
    help="Simulated scanner automatically extracts biomarkers like 'Vitamin D3: 15 ng/mL' and 'Hemoglobin: 10.5 g/dL'."
)

# Text area for manual lab log fallback paste
notes_log = st.sidebar.text_area(
    "Or paste raw lab/doctor logs direct:",
    placeholder="Example: Hb: 11.2 g/dL, Vit D3 is 18 ng/mL, Serum Calcium levels are 8.2."
)

# Simulated Lab Parsers
scanned_biomarkers = {}
if uploaded_file:
    try:
        # Simple extraction simulation
        file_bytes = uploaded_file.read().decode("utf-8", errors="ignore")
        scanned_biomarkers = parse_lab_reports_simulated(file_bytes)
        if scanned_biomarkers:
            st.sidebar.success(f"Successfully extracted: {', '.join(scanned_biomarkers.keys())}")
    except Exception:
        st.sidebar.warning("Report loaded. Use manual checklist below for accuracy.")

if notes_log:
    scanned_biomarkers.update(parse_lab_reports_simulated(notes_log))

# Overridable Manual Lab Report Sliders
st.sidebar.write("### Review Active Blood Biomarkers")

override_d3 = st.sidebar.number_input(
    "Vitamin D3 (ng/mL)", 
    min_value=0.0, max_value=200.0, 
    value=scanned_biomarkers.get("vitamin_d3", 35.0),
    help="Target normal: 30-100 ng/mL"
)
override_b12 = st.sidebar.number_input(
    "Vitamin B12 (pg/mL)", 
    min_value=0.0, max_value=2000.0, 
    value=scanned_biomarkers.get("vitamin_b12", 450.0),
    help="Target normal: 211-911 pg/mL"
)
override_hb = st.sidebar.number_input(
    "Hemoglobin (g/dL)", 
    min_value=0.0, max_value=25.0, 
    value=scanned_biomarkers.get("hemoglobin", 13.5),
    help="Target normal: >12.0 for Female, >13.5 for Male"
)
override_cal = st.sidebar.number_input(
    "Serum Calcium (mg/dL)", 
    min_value=0.0, max_value=20.0, 
    value=scanned_biomarkers.get("calcium", 9.4),
    help="Target normal: 8.5-10.2 mg/dL"
)

active_biomarkers = {
    "vitamin_d3": override_d3,
    "vitamin_b12": override_b12,
    "hemoglobin": override_hb,
    "calcium": override_cal
}


# ---- MAIN SPLIT PANEL ----
tabs = st.tabs(["💬 clinical Dietitian Conversation", "📊 Deterministic Math & Lab Dash", "🥬 Grounded Indian Food Index"])

# Tab 2: Dashboard Math Breakdowns
with tabs[1]:
    st.markdown("### 🧮 Pure Mathematical Energy Calculation (Mifflin-St Jeor)")
    
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Basal Metabolic Rate (BMR)", f"{bmr} kcal/day", help="Caloric energy expended completely at complete rest.")
    with col2:
        st.metric("Total Daily Energy Expenditure (TDEE)", f"{tdee} kcal/day", help="Total energy needed daily relative to physical movement.")
    with col3:
        st.metric("Calorie Deficit Target (Weight loss)", f"{max(1200, tdee - 500)} kcal/day", "-500 kcal limit (min 1200)")
        
    st.markdown("#### BMR Mifflin-St Jeor Formulation Reasoning:")
    if gender_val == "Male":
        st.latex(r"BMR = 10 \times \text{Weight (kg)} + 6.25 \times \text{Height (cm)} - 5 \times \text{Age (yrs)} + 5")
        st.write(f"$$BMR = (10 \\times {weight_val}) + (6.25 \\times {height_val}) - (5 \\times {age_val}) + 5 = {bmr}$$")
    else:
        st.latex(r"BMR = 10 \times \text{Weight (kg)} + 6.25 \times \text{Height (cm)} - 5 \times \text{Age (yrs)} - 161")
        st.write(f"$$BMR = (10 \\times {weight_val}) + (6.25 \\times {height_val}) - (5 \\times {age_val}) - 161 = {bmr}$$")

    # Lab validation reports
    st.markdown("### 🩸 Biomarker Diagnostics & Safe Repletion Schedules")
    for metric_id, level in active_biomarkers.items():
        rep = evaluate_blood_levels(metric_id, level, gender_val)
        if rep:
            meta_name = LAB_STANDARDS[metric_id]["name"]
            st.markdown(f"#### **{meta_name}**: `{level} {LAB_STANDARDS[metric_id]['unit']}` — Status: **{rep['status']}**")
            if rep["is_low"]:
                st.info(f"**⚡ Repletion Strategy advice:** {rep['recommendation']}")
                st.success(f"**🥦 Local Ingredient Booster options:** {rep['diet_additions']}")
                st.warning(f"**⚠️ Chronic Upper Tolerable Level (UL):** {rep['ul']}")
            else:
                st.markdown("✅ *Level sits healthy. Continue regular dietary structure.*")
            st.divider()


# Tab 3: Compliant Indigenous Food DB
with tabs[2]:
    st.markdown(f"### 🥬 Grounded Indian Staples mapping for **{diet_tier}** tier")
    st.write("These local foods are verified as standard clinical inputs and directly filtered for metabolic matching:")
    
    filtered_db = [f for f in INDIAN_INGREDIENT_DATABASE if diet_tier in f["category"]]
    
    for f in filtered_db:
        st.markdown(f"#### 🥢 **{f['localName']}** (`{f['name']}`)")
        st.markdown(f"**Macro balance per 100g:** Calories: `{f['macros_per_100g']['calories']} kcal` | Protein: `{f['macros_per_100g']['protein']}g` | Carbs: `{f['macros_per_100g']['carbs']}g` | Fats: `{f['macros_per_100g']['fat']}g` | Fiber: `{f['macros_per_100g']['fiber']}g`")
        st.markdown(f"**Dominant Micronutrients:** {', '.join(f['dominant_micros'])}")
        st.write(f"*{f['notes']}*")
        st.divider()


# Tab 1: Clinical Conversational AI Agent Chat Context
with tabs[0]:
    st.markdown("👨‍⚕️ Ask questions about personalized family menus, cooking substitutions, recipes, or laboratory deficiency insights below:")
    st.info(f"👉 Current Active Constraints: **{diet_tier} Diet** | TDEE: **{tdee} kcal** | Deficit limit of **{max(1200, tdee - 500)} kcal** with dynamic laboratory alignments.")

    # Initialize message history
    if "messages" not in st.session_state:
        st.session_state.messages = []

    # Display prior messages
    for msg in st.session_state.messages:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])

    # User chat action
    user_query = st.chat_input("Enter your request, e.g. 'Generate a local dinner plan for my 2500 TDEE'...")

    if user_query:
        # Prompt user question in widget
        with st.chat_message("user"):
            st.markdown(user_query)
        st.session_state.messages.append({"role": "user", "content": user_query})

        # Process clinical agent response
        with st.chat_message("assistant"):
            status_placeholder = st.empty()
            status_placeholder.text("GharKaNutri AI is cross-referencing math tables and food indexing rules...")

            try:
                # Setup Gemini Client inside serverless framework
                # This grabs the user's secret keys from system environments
                api_key = os.getenv("GEMINI_API_KEY")
                
                if not api_key:
                    # Informative fallback
                    model_response = f"""👨‍⚕️ **Family Dietitian Offline Assessment Output:**
Your Indian profile has been evaluated deterministically under the **{diet_tier}** parameters.
BMR: **{bmr} kcal/day** | TDEE: **{tdee} kcal/day**.
Recommended calorie intake for deficit constraints is safely placed at **{max(1200, tdee - 500)} kcal/day**.

*Since GEMINI_API_KEY is not defined in this terminal environment, this offline calculation was successfully constructed. Please define your GEMINI_API_KEY inside your system variables or Streamlit secrets to engage full clinical dialogue.*"""
                else:
                    client = genai.Client(api_key=api_key)
                    
                    # Compute diagnostics summaries to ground general prompt
                    diag_reports = []
                    for k, val in active_biomarkers.items():
                        r = evaluate_blood_levels(k, val, gender_val)
                        if r and r["is_low"]:
                            diag_reports.append(f"- {LAB_STANDARDS[k]['name']}: {val} {LAB_STANDARDS[k]['unit']} ({r['status']}). Repletion schedule: {r['recommendation']}. Add: {r['diet_additions']}.")
                    
                    diag_sum = "\n".join(diag_reports) if diag_reports else "All checked biomarkers within standard clinical intervals."
                    
                    # Extract active food database matches
                    compl_foods = [f"{i['localName']}: P {i['macros_per_100g']['protein']}g, C {i['macros_per_100g']['carbs']}g, F {i['macros_per_100g']['fat']}g" for i in filtered_db]
                    food_list = "\n".join([f"- {item}" for item in compl_foods])

                    sys_instruction = f"""You are the clinical-grade 'GharKaNutri' Indian Family Dietitian.
                    Diet tier profile is strictly: {diet_tier}. DO NOT deviate or suggest other foods under any circumstance.
                    Current deterministic parameters:
                    - Age: {age_val} yrs, Gender: {gender_val}, Weight: {weight_val}kg, Height: {height_val}cm.
                    - BMR: {bmr} kcal/day.
                    - TDEE: {tdee} kcal/day.
                    - Deficit target: {max(1200, tdee - 500)} kcal/day.
                    - Surplus target: {tdee + 300} kcal/day.
                    
                    Latest medical blood diagnostics:
                    {diag_sum}
                    
                    Allowed local staple base list:
                    {food_list}
                    
                    Requirements:
                    1. Use localized household language and concepts (gilaas, katori, kachha ragi, nimbu, desi dahi).
                    2. Integrate BMR/TDEE calculations with step-by-step math reasoning without generating imaginary figures. Use LaTeX format notations ($BMR$ and $TDEE$).
                    3. Suggest breakfast, lunch, and dinner recipes strictly tailored for the selected '{diet_tier}' dietary tier.
                    4. Always include the official clinical safety disclaimer at the end of any supplement recommendations."""

                    # Format chat history
                    history_parts = []
                    for prev in st.session_state.messages[:-1]:
                        role_str = "user" if prev["role"] == "user" else "model"
                        history_parts.append(types.Content(role=role_str, parts=[types.Part.from_text(text=prev["content"])]))
                    
                    # Current prompt
                    history_parts.append(types.Content(role="user", parts=[types.Part.from_text(text=user_query)]))

                    response = client.models.generate_content(
                        model="gemini-3.5-flash",
                        contents=history_parts,
                        config=types.GenerateContentConfig(
                            system_instruction=sys_instruction,
                            temperature=0.2, # Stable clinical output
                        )
                    )
                    model_response = response.text
                    
                status_placeholder.empty()
                st.markdown(model_response)
                st.session_state.messages.append({"role": "assistant", "content": model_response})
                
            except Exception as e:
                status_placeholder.empty()
                st.error(f"Error calling system core agent: {str(e)}")
                st.info("Check that your API Key is entered correctly under system environment variables.")
