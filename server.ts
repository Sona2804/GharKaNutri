/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { 
  DietaryTier, 
  Gender, 
  ActivityLevel, 
  UserMetrics, 
  calculateEnergy, 
  evaluateLabMetric, 
  getCompliantFoods, 
  parseLabReportText, 
  LAB_METRICS_INFO 
} from "./src/utils/nutrition.js"; // note: resolving path cleanly

// Initialize environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));

// Initialize @google/genai with named parameter & telemetry header
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey || "MOCK_KEY_FOR_BUILD",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Endpoint: Dynamic Calculators & Lab Repletion Reports
app.post("/api/nutrition/calculate", (req, res) => {
  try {
    const metrics: UserMetrics = req.body.metrics;
    if (!metrics) {
      return res.status(400).json({ error: "Missing user metrics." });
    }
    const results = calculateEnergy(metrics);
    return res.json({ results });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Endpoint: Evaluate Lab blood metrics
app.post("/api/nutrition/evaluate-labs", (req, res) => {
  try {
    const { labValues, gender } = req.body; // labValues is record of { metricId: number }
    if (!labValues || !gender) {
      return res.status(400).json({ error: "Missing lab values or gender profile." });
    }
    
    const reports: Record<string, any> = {};
    for (const key of Object.keys(labValues)) {
      if (labValues[key] !== null && labValues[key] !== undefined) {
        reports[key] = evaluateLabMetric(key, Number(labValues[key]), gender as Gender);
      }
    }
    return res.json({ reports });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/// Endpoint: API Chat Proxy
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, metrics, labValues } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }
    
    // Default metrics if none supplied
    const userMetrics: UserMetrics = metrics || {
      age: 30,
      weight: 65,
      height: 165,
      gender: Gender.FEMALE,
      activityLevel: ActivityLevel.SEDENTARY,
      dietaryTier: DietaryTier.VEGETARIAN,
      chronicConditions: []
    };

    const chronicConditionsList = userMetrics.chronicConditions || [];
    const customBiomarkersList = userMetrics.customBiomarkers || [];

    // Calculate energy parameters
    const mathResults = calculateEnergy(userMetrics);
    
    // Evaluate blood biomarkers
    const labReports: string[] = [];
    if (labValues) {
      for (const [id, val] of Object.entries(labValues)) {
        if (val !== null && val !== undefined && val !== "") {
          const evalRep = evaluateLabMetric(id, Number(val), userMetrics.gender);
          if (evalRep.isLow) {
            labReports.push(`- **${LAB_METRICS_INFO[id]?.name || id}**: Current value is ${val} ${LAB_METRICS_INFO[id]?.unit || ""}. Status: ${evalRep.status}.\n  Clinical Repletion Target advice: ${evalRep.recommendation}\n  Local Dietary adjustments: ${evalRep.dietaryAdjustment}\n  Upper safe chronic limit: ${evalRep.tolerableUpperLimit}`);
          } else {
            labReports.push(`- **${LAB_METRICS_INFO[id]?.name || id}**: Current value is ${val} ${LAB_METRICS_INFO[id]?.unit || ""}. Optimal/High. Avoid extra supplements.`);
          }
        }
      }
    }

    // Get compliant food items based on strict dietary tier parameter
    const compliantFoods = getCompliantFoods(userMetrics.dietaryTier);
    const databaseListStr = compliantFoods.map(f => 
      `- **${f.localName} (${f.name})**: Protein: ${f.macrosPer100g.protein}g, Carbs: ${f.macrosPer100g.carbs}g, Fat: ${f.macrosPer100g.fat}g, Fiber: ${f.macrosPer100g.fiber}g, Energy: ${f.macrosPer100g.calories} kcal per 100g. Dominant Micronutrients: ${f.dominantMicros.join(", ")}. Notes: ${f.notes}`
    ).join("\n");

    // Construct highly personalized System Prompt injecting calculated math and strict boundaries
    const systemInstruction = `You are a clinical-grade, professional Indian Family Nutritionist and Dietitian (GharKaNutri AI).
Your persona profile is warm, clinical, accurate, empathetic, and strictly evidence-based.

STRICT BOUNDARY CONSTRAINTS:
1. DIETARY MATCHING:
   - The user's dietary profile is strictly set to: **${userMetrics.dietaryTier}**.
   - You MUST NEVER suggest or recommend any ingredients, meals, or food ideas that violate this filter. 
   - E.g., Do NOT suggest eggs, chicken, mutton, fish, or gelatin for Vegetarians or Vegans.
   - E.g., Do NOT suggest milk, ghee, paneer, curd (dahi), butter, honey, paneer, whey protein, or any other dairy/animal products for Vegans.
   - Always verify each food choice before recommending it.

2. SHIELDED MATHEMATICS (NO HALLUCINATIONS):
   - Do NOT guess, imagine, or calculate BMR, TDEE, or nutritional targets. You MUST use these exact pre-calculated values based on the clinical Mifflin-St Jeor equation:
     - User Gender: ${userMetrics.gender}
     - User Parameters: Age: ${userMetrics.age} years old, Weight: ${userMetrics.weight}kg, Height: ${userMetrics.height}cm
     - Activity Level: ${userMetrics.activityLevel}
     - Pre-calculated BMR: **${mathResults.bmr} kcal/day**
     - Pre-calculated TDEE (Total Daily Energy Expenditure): **${mathResults.tdee} kcal/day**
     - For Caloric Deficit Target (Weight Loss / safe metabolic limits): **${mathResults.deficitTarget} kcal/day**
     - For Caloric surplus Target (Muscle/Weight Gain): **${mathResults.surplusTarget} kcal/day**
     - Custom Daily Macronutrient Distribution:
       - Carbohydrates range: ${mathResults.carbRange.min}g - ${mathResults.carbRange.max}g daily (45-60% of calories)
       - Protein range: ${mathResults.proteinRange.min}g - ${mathResults.proteinRange.max}g daily
       - Fats range: ${mathResults.fatRange.min}g - ${mathResults.fatRange.max}g daily
   - Reference these exact calculations directly and display step-by-step math breakdowns using clear bullet points and simple typography or LaTeX math notations (e.g. $BMR$ or $TDEE = BMR \\times \\text{Factor}$) where helpful.

3. LAB DATA GROUNDING:
   - The user has entered their latest lab results. Here are the clinical evaluations:
   ${labReports.length > 0 ? labReports.join("\n") : "- No basic lab deficiencies entered yet."}
   ${customBiomarkersList.length > 0 ? `- Dynamic Extracted Report Biomarkers:\n` + customBiomarkersList.map((m: any) => `  * **${m.name}**: ${m.value} ${m.unit} (Reference: ${m.referenceRange}, Status: ${m.status}, Context: ${m.conditionContext || "General Health"})`).join("\n") : ""}
   - Reference these biomarker levels with strict clinical accuracy. Ground all nutritional therapy or therapeutic menu planning in these deficiencies.

4. CHRONIC CONDITIONS / DISEASES:
   - The user is managing the following chronic conditions or health goals: **${chronicConditionsList.length > 0 ? chronicConditionsList.join(", ") : "None declared"}**.
   - You MUST customize the entire recommendation to suit these diseases. E.g., for Diabetes, omit high glycemic carbs (white rice, sugar, refined flour) and focus on low GI alternatives; for Hypertension, salt / sodium restrictions must be laid out; for CKD, strictly control potassium, phosphorus, and specify exact protein restrictions; for Celiac, ensure 100% gluten-free meal setups; for PCOS, reduce insulin spikes; for Thyroid, explain goitrogenic limits.
   - For these chronic diseases, always provide a visually clean breakdown of "WHAT TO HAVE" and "WHAT NOT TO HAVE" so the user receives simple, action-oriented instructions. Explain why scientifically in simple terms.

5. INGREDIENT GROUNDING DATABASE (ONLY SUGGEST FOODS INSIDE THIS RANGE OR CLEARLY LOCAL COMPLIANT INDIAN STAPLES):
   - Here is a dictionary of standard verified Indian staples compatible with their **${userMetrics.dietaryTier}** diet:
   ${databaseListStr}
   - Prioritize these ingredients (using local names like Kala Chana, Ragi, Mandua, Soya Bari, Ghar ka Dahi, Palak, Til) and suggest recipes structured with clear breakfast, lunch, snack, and dinner plans.

6. MANDATORY WARNINGS:
   - If you mention or advise on therapeutic dosage target increases (especially Vitamin D3 60k, high dose iron, or B12 repletion), you MUST end your chat message with the exact following disclaimer block:
     
     "***
     **👨‍⚕️ Clinical Safety Disclaimer:** This analysis is based on established clinical guidelines. Supplement repletion targets are mathematically computed relative to normal physiological limits. Always consult with a registered medical practitioner (MD / Endocrinologist / Registered Dietitian) before starting high-dosage clinical supplements (such as 60,000 IU Vitamin D3) or making drastic adjustments to your metabolic/medical diet."

7. VISUAL RENDERING ENHANCEMENTS IN THE CHAT WINDOW:
   - To make the diets and repletion plans highly visual with beautiful "picture colors" as requested, you MUST wrap diagnostic/nutritional meal profiles or dietary cards inside these exact XML schemas:
     
     <DietCard title="🌅 Breakfast: Almond Ragi Porridge" calories="320 Cal" protein="12g" carbs="54g" fat="6g" color="emerald">
       - Write clean markdown details here!
       - Use local ingredients from the database.
     </DietCard>

     Supported colors: "emerald", "amber", "blue", "rose", "violet", "orange", "slate".
     Always design balanced cards for other categories (Lunch, Evening Snack, Dinner) using these custom components with matching appropriate colors.
     Always add a mini breakdown of nutrition inside attributes: title, calories, protein, carbs, fat, and color.

     For repletion/supplementation recommendations:
     <BiomarkerRepletion title="Vitamin D3 Dosing Protocol" level="12.5 ng/mL (Severe Deficiency)" color="rose">
       - 60,000 IU weekly for 8 weeks
       - Consume alongside fats like almonds or walnuts to aid absorption
     </BiomarkerRepletion>

     Always integrate what to eat and avoid for chronic illnesses in these components!

Tone: Academic but practical, supportive, and grounded in Indian context (regional household preferences, custom steel plate portions, avoiding expensive Westernized "superfoods"). Use rich markdown styles and wrap plans inside <DietCard> and <BiomarkerRepletion> so they render with vibrant UI elements!`;

    // Map message list compatible with GenAI structure.
    const contents: any[] = [];
    messages.forEach((m: { role: string; content: string }) => {
      contents.push({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      });
    });

    if (!apiKey) {
      return res.json({
        text: `👨‍⚕️ **(Demo Mode - Key Missing)**
Since the GEMINI_API_KEY is not defined in search, I am running under local offline diet estimation mode.
Your TDEE is computed to be **${mathResults.tdee} kcal/day**. 
For a safe calorie deficit, consume **${mathResults.deficitTarget} kcal/day** with **${mathResults.proteinRange.min}g - ${mathResults.proteinRange.max}g** protein.
Dietary Tier: **${userMetrics.dietaryTier}**.
Chronic Conditions: **${chronicConditionsList.join(", ") || "None"}**.
Please add your API key in **Settings > Secrets** to enable clinical medical-agent brainstorming conversations!`,
        candidates: []
      });
    }

    // Call Gemini API server-side
    const geminiResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.2, // Keep output clinical and non-creative
      }
    });

    return res.json({
      text: geminiResponse.text,
      candidates: geminiResponse.candidates
    });

  } catch (error: any) {
    console.error("Gemini Chat API Error:", error);
    return res.status(500).json({ error: error.message || "An error occurred during conversational generation." });
  }
});

// Endpoint: Multi-modal Lab Report analyzer (PDF and Images)
app.post("/api/parse-document", async (req, res) => {
  try {
    const { base64Data, mimeType, filename } = req.body;
    if (!base64Data || !mimeType) {
      return res.status(400).json({ error: "Missing file data or mimeType." });
    }

    if (!apiKey) {
      return res.status(400).json({ error: "Gemini API key is missing. Please add your GEMINI_API_KEY in Settings > Secrets to parse PDFs and images!" });
    }

    console.log(`Sending multi-modal parsing payload for ${filename} to Gemini...`);
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Extract ALL relevant clinical biomarkers, blood work indicators, or laboratory diagnostic results from the uploaded report for any kind of disease or chronic condition (e.g. CBC, Lipid profile, Thyroid panel, Liver Function LFT, Kidney Function KFT, HbA1c, etc.).
You must extract both standard metrics (Vitamin D3 (ng/mL), Vitamin B12 (pg/mL), Hemoglobin (g/dL), and Serum Calcium (mg/dL)) and ANY other metrics present.

Return a beautiful, complete structured JSON matching this exact schema:
{
  "vitamin_d3": number or null, 
  "vitamin_b12": number or null,
  "hemoglobin": number or null,
  "calcium": number or null,
  "allExtracted": [
    {
      "name": "Biomarker / Indicator Name (e.g., TSH, HbA1c, Total Cholesterol, Creatinine, Bilirubin)",
      "value": "Numeric value (as string/float)",
      "unit": "Unit of measurement (e.g., 'mg/dL', 'uIU/mL', '%', 'g/dL')",
      "referenceRange": "Normal reference range printed on report (e.g., '0.45-4.5', '70-100', '< 5.7')",
      "status": "Clinical designation ('High', 'Low', 'Normal')",
      "conditionContext": "What condition or disease this biomarker is associated with (e.g., 'Cardiovascular Health', 'Diabetes / Insulin Resistance', 'Kidney function', 'Thyroid Profile', 'Anemia', 'General Metabolism')"
    }
  ]
}
If standard metrics are not found, set them to null. Convert other indicators accurately from text. Do not hallucinate any values. Convert values to standard numeric string representation.`
            },
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            vitamin_d3: { type: "NUMBER", nullable: true },
            vitamin_b12: { type: "NUMBER", nullable: true },
            hemoglobin: { type: "NUMBER", nullable: true },
            calcium: { type: "NUMBER", nullable: true },
            allExtracted: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  name: { type: "STRING" },
                  value: { type: "STRING" },
                  unit: { type: "STRING" },
                  referenceRange: { type: "STRING" },
                  status: { type: "STRING" },
                  conditionContext: { type: "STRING" }
                },
                required: ["name", "value", "unit", "referenceRange", "status", "conditionContext"]
              }
            }
          },
          required: ["vitamin_d3", "vitamin_b12", "hemoglobin", "calcium", "allExtracted"]
        }
      }
    });

    const textResult = response.text;
    if (!textResult) {
      return res.status(500).json({ error: "No response text received from Gemini server." });
    }

    console.log("Raw parsing response from Gemini:", textResult);
    const parsed = JSON.parse(textResult.trim());
    return res.json({ parsed });

  } catch (error: any) {
    console.error("Error parsing document with Gemini:", error);
    return res.status(500).json({ error: error.message || "An error occurred during medical report parsing." });
  }
});

// Serve Vite middleware or static distribution
(async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server successfully initiated on http://localhost:${PORT}`);
  });
})();
