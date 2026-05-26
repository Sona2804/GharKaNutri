/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Clinical-grade Indian Food Grounding Dictionary and Deterministic Nutrition Calculator.
 */

export enum DietaryTier {
  VEGETARIAN = "Vegetarian",
  VEGAN = "Vegan",
  NON_VEGETARIAN = "Non-Vegetarian",
}

export enum Gender {
  MALE = "Male",
  FEMALE = "Female",
}

export enum ActivityLevel {
  SEDENTARY = "Sedentary (no exercise)",
  SLIGHTLY_ACTIVE = "Light (1-3 days/week)",
  MODERATELY_ACTIVE = "Moderate (3-5 days/week)",
  ACTIVE = "Active (6-7 days/week)",
  VERY_ACTIVE = "Heavy physical work",
}

export interface UserMetrics {
  age: number;
  weight: number; // kg
  height: number; // cm
  gender: Gender;
  activityLevel: ActivityLevel;
  dietaryTier: DietaryTier;
  chronicConditions?: string[]; // E.g. ["Diabetes", "Hypertension"]
  customBiomarkers?: { name: string; value: string; unit: string; referenceRange: string; status: string; conditionContext: string }[];
}

export interface DiseaseGuideline {
  name: string;
  dos: string[];
  donts: string[];
  scientificInsight: string;
}

export const CHRONIC_DISEASE_DIETARY_GUIDELINES: Record<string, DiseaseGuideline> = {
  "Diabetes": {
    name: "Diabetes / Insulin Resistance",
    dos: [
      "Ragi (Finger Millet) and Bajra (Pearl Millet) rotis instead of refined wheat/maida",
      "Sprouted Green Moong & Kala Chana (adds low-GI complex carbs and high fiber)",
      "Bitter Gourd (Karela) salad or daily juice (contains polypeptide-p to mimic insulin)",
      "Paneer, walnuts, almonds, and high-protein/low-fat dahi",
      "Cinnamon (Dalchini) sprinkled on green tea (enhances insulin receptor sensitivity)"
    ],
    donts: [
      "Refined sugar, honey, jaggery, misri, and sweet juices",
      "White polished rice (substitute with brown rice or foxtail millet)",
      "Potatoes, sweet potatoes, raw tapioca, and high-starch tubers in large quantities",
      "Deep-fried pakoras, samosas, and high GI bakery products"
    ],
    scientificInsight: "Managing glycation requires slowing down gastric emptying. High-fiber legumes paired with plant minerals slow postprandial glucose surges significantly."
  },
  "Hypertension": {
    name: "Hypertension / High Blood Pressure",
    dos: [
      "Potassium-rich foods like Beetroot (salads/soup) and Bananas",
      "Garlic (Lahsun) - chew 1-2 cloves raw on an empty stomach (contains allicin to dilate blood vessels)",
      "Unsweetened fresh yogurt/curd (supplies bio-available Calcium to regulate cardiac contraction)",
      "Celery, bottle gourd (Lauki), cucumbers, and high-hydration vegetable stews",
      "Flaxseeds (Alsi) - 1 tbsp ground daily (rich in anti-inflammatory Omega-3)"
    ],
    donts: [
      "Pickles (Achar), Papad, and salted processed nuts",
      "Extra raw table salt sprinkled on salads or curd",
      "Canned soups, packaged bhujia, chips, and salt-preserved chutneys",
      "Baking soda and foods high in sodium preservatives"
    ],
    scientificInsight: "Sodium retention increases plasma volume, putting strain on arterial walls. Boosting potassium-sodium urine ratio flushes extra water, lowering peripheral vascular pressure naturally."
  },
  "CKD": {
    name: "Chronic Kidney Disease (CKD)",
    dos: [
      "In early stages, strictly controlled high-quality protein (consult MD on exact g/kg ratio)",
      "White rice (polished rice is lower in phosphorus than brown/millets, which is helpful here!)",
      "Sautéed low-potassium vegetables like Cabbage, Cauliflower, Bottle Gourd (Lauki), and Ridge Gourd (Torai)",
      "Apple, pear, papaya, and guava in moderation"
    ],
    donts: [
      "High-potassium elements: Bananas, potatoes, tomatoes, and spinach",
      "High-phosphorus dairy products, whole beans, lentils, nuts, chocolates, and carbonated beverages",
      "Excessive salt or synthetic low-sodium substitutes (they contain potassium chloride which can be lethal in renal failure)"
    ],
    scientificInsight: "Diminished glomerular filtration means the kidneys struggle to filter potassium, phosphorus, and nitrogenous urea. Eating low-potassium, low-phosphorus, and controlled protein is protective."
  },
  "Thyroid": {
    name: "Thyroid Disorders (Hypothyroidism)",
    dos: [
      "Iodine sources like iodized table salt and organic milk",
      "Selenium-dense seeds: Pumpkin seeds and walnuts (essential co-factors for T4 to T3 conversion)",
      "Virgin cold-pressed coconut oil (contains medium-chain triglycerides to support sluggish metabolism)",
      "Cooked leafy greens like spinach, and cooked lentils (cooking deactivates goitrogens)"
    ],
    donts: [
      "Raw goitrogens: uncooked cabbage, cauliflower, broccoli, kale, radish, and mustard greens",
      "Excessive soy protein, soy chunks, tofu, or soy milk (soy isoflavones can inhibit thyroid hormone absorption)",
      "Processed gluten and refined sugars that spark secondary autoimmune thyroid flaring"
    ],
    scientificInsight: "Hypothyroidism slows basal metabolism. Restricting raw goitrogenic glucosinolates prevents raw chemical interference with thyroid iodine uptake, while selenium boosts enzymatic activation."
  },
  "PCOS": {
    name: "PCOS / PCOD (Polycystic Ovary Syndrome)",
    dos: [
      "Anti-inflammatory spices: Haldi (Turmeric) with black pepper, and Ginger",
      "Spearmint tea (1-2 cups daily - clinically shown to reduce free androgens and hirsutism)",
      "Low GI seeds combination: Pumpkin, sunflower, sesame, and flax seeds (Seed Cycling)",
      "High-fiber cooked millets (Bajra, Jowar) and whole sprouts salad"
    ],
    donts: [
      "Refined seed oils (highly inflammatory; replace with extra virgin olive oil, mustard oil, or moderate A2 ghee)",
      "Sugary sweets, ice creams, bakery cakes, and direct cow dairy if insulin resistance is highly elevated",
      "Processed snacks, deep-fried fast foods, and carbonated beverages"
    ],
    scientificInsight: "PCOS is structurally driven by hyperinsulinemia and high androgen levels. Low GI, high fiber foods combined with anti-inflammatory herbs help restore ovarian sensitivity and metabolic endocrine rhythm."
  },
  "Celiac": {
    name: "Celiac Disease / Gluten Intolerance",
    dos: [
      "Gluten-free grains: Rice, Ragi (Finger millet), Bajra (Pearl millet), Jowar (Sorghum), Amaranth (Rajgira), and Buckwheat (Kuttu)",
      "Lentils, pulses, fresh dairy (curd, paneer), fresh vegetables, and organic fruits",
      "Pure besan (chana flour) or amaranth flour for making roti/chilla flatbreads"
    ],
    donts: [
      "Wheat (Roti, bread, maida, suji / semolina, daliya, vermicelli, pasta)",
      "Barley (Jau) and Rye products",
      "Asafoetida / Hing (WARNING: standard hing is typically processed with wheat flour as a carrier!)",
      "Stray sauces, soy sauce, malt vinegar, and bakery items unless certified 100% Gluten-Free"
    ],
    scientificInsight: "In Celiac disease, gluten exposure precipitates direct autoimmune destructive damage to duodenal villi. Ensuring a strict, zero-contamination gluten-free diet is mandatory for mucosal recovery."
  },
  "Gout": {
    name: "Gout / High Uric Acid",
    dos: [
      "Hydration boost: Drink 3-4 liters of pure water daily to flush uric acid crystal deposits out of joints",
      "Low-purine protein options: curds/dahi, buttermilk, cottage cheese/paneer, milk, and almonds",
      "Fresh organic lemons (Nimbu Pani) and Vitamin C rich foods like Amla (gooseberry)",
      "Enzymatic foods like pineapples, papayas, and fresh cherries (lowers uric acid)"
    ],
    donts: [
      "High-purine items: Red meats, organ meats, yeast extracts, shellfish, and large quantities of spinach or mushrooms",
      "Excessive lentils/whole dals when experiencing acute joint flares",
      "Carbonated soft drinks containing High Fructose Corn Syrup (HFCS) and alcoholic beverages (especially beer)"
    ],
    scientificInsight: "Gout results from hyperuricemia, where monosodium urate crystals precipitate in joints. Keeping proteins centered around low-purine dairy and flushing via hydrative alkaline support reduces arthritis flare-ups."
  }
};

export interface CalculationResults {
  bmr: number;
  tdee: number;
  deficitTarget: number; // -500 kcal
  surplusTarget: number; // +300 kcal
  carbRange: { min: number; max: number }; // g (45-65% of calories)
  proteinRange: { min: number; max: number }; // g (1.2-2.0 g per kg for active, or 0.8-1.2 for sedentary)
  fatRange: { min: number; max: number }; // g (20-35% of calories)
}

// 1. MIFFLIN-ST JEOR CALCULATOR
export function calculateEnergy(metrics: UserMetrics): CalculationResults {
  const { weight, height, age, gender, activityLevel } = metrics;
  
  // Calculate BMR
  let bmr = 0;
  if (gender === Gender.MALE) {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  
  // Activity Multipliers
  let multiplier = 1.2;
  switch (activityLevel) {
    case ActivityLevel.SEDENTARY:
      multiplier = 1.2;
      break;
    case ActivityLevel.SLIGHTLY_ACTIVE:
      multiplier = 1.375;
      break;
    case ActivityLevel.MODERATELY_ACTIVE:
      multiplier = 1.55;
      break;
    case ActivityLevel.ACTIVE:
      multiplier = 1.725;
      break;
    case ActivityLevel.VERY_ACTIVE:
      multiplier = 1.9;
      break;
  }
  
  const tdee = Math.round(bmr * multiplier);
  const deficitTarget = Math.max(1200, Math.round(tdee - 500)); // Maintain safe floor of 1200 kcal
  const surplusTarget = Math.round(tdee + 300);
  
  // Protein adjustment based on activity: active personas need higher protein per kg
  let proteinMinGrams = 0.8 * weight;
  let proteinMaxGrams = 1.2 * weight;
  if (activityLevel === ActivityLevel.MODERATELY_ACTIVE || activityLevel === ActivityLevel.ACTIVE || activityLevel === ActivityLevel.VERY_ACTIVE) {
    proteinMinGrams = 1.4 * weight;
    proteinMaxGrams = 2.0 * weight;
  }
  
  // Fats: 25% of TDEE energy (approx 9 kcal/g)
  const fatMinGrams = Math.round((tdee * 0.20) / 9);
  const fatMaxGrams = Math.round((tdee * 0.35) / 9);
  
  // Carbs: Remaining Caloric balance (approx 4 kcal/g)
  const carbMinGrams = Math.round((tdee * 0.45) / 4);
  const carbMaxGrams = Math.round((tdee * 0.60) / 4);
  
  return {
    bmr: Math.round(bmr),
    tdee,
    deficitTarget,
    surplusTarget,
    carbRange: { min: carbMinGrams, max: carbMaxGrams },
    proteinRange: { min: Math.round(proteinMinGrams), max: Math.round(proteinMaxGrams) },
    fatRange: { min: fatMinGrams, max: fatMaxGrams },
  };
}

// 2. CLINICAL BLOOD PARAMETERS KNOWLEDGE & DOSAGE VALIDATOR
export interface LabMetric {
  id: string;
  name: string;
  unit: string;
  normalMin: number;
  normalMax: number;
  unisexRange?: { min: number; max: number };
  maleRange?: { min: number; max: number };
  femaleRange?: { min: number; max: number };
  ul: string; // Upper Tolerable Limit (text description for safety)
  deficiencyCutoff: number;
}

export const LAB_METRICS_INFO: Record<string, LabMetric> = {
  vitamin_d3: {
    id: "vitamin_d3",
    name: "Vitamin D3 (25-OH)",
    unit: "ng/mL",
    normalMin: 30,
    normalMax: 100,
    unisexRange: { min: 30, max: 100 },
    ul: "4,000 IU daily chronic oral intake maximum unless medically specified. Acute medical repletion limit is typically 60,000 IU/week for up to 8 weeks.",
    deficiencyCutoff: 20,
  },
  vitamin_b12: {
    id: "vitamin_b12",
    name: "Vitamin B12 (Cobalamin)",
    unit: "pg/mL",
    normalMin: 211,
    normalMax: 911,
    unisexRange: { min: 211, max: 911 },
    ul: "No established Upper Tolerable Level (UL) due to high renal clearance. Normal oral repletion is 1,000 to 2,000 mcg/day for severe deficiency.",
    deficiencyCutoff: 200,
  },
  hemoglobin: {
    id: "hemoglobin",
    name: "Hemoglobin",
    unit: "g/dL",
    normalMin: 12.0,
    normalMax: 17.5,
    maleRange: { min: 13.5, max: 17.5 },
    femaleRange: { min: 12.0, max: 15.5 },
    ul: "Upper Tolerable Limit for therapeutic elemental iron supplementation is 45 mg/day to prevent acute gastrointestinal toxicity.",
    deficiencyCutoff: 12.0, // gender adjusted in check
  },
  calcium: {
    id: "calcium",
    name: "Serum Calcium",
    unit: "mg/dL",
    normalMin: 8.5,
    normalMax: 10.2,
    unisexRange: { min: 8.5, max: 10.2 },
    ul: "2,500 mg elemental calcium daily. Repletion ceiling for hypocalcemia is 1,000 to 1,200 mg daily in split doses of 500 mg (to optimize absorption).",
    deficiencyCutoff: 8.5,
  }
};

export interface LabRepletionRecommendation {
  status: "Normal" | "Insufficient" | "Deficient" | "Severely Deficient";
  isLow: boolean;
  currentValue: number;
  recommendation: string;
  dietaryAdjustment: string;
  tolerableUpperLimit: string;
}

export function evaluateLabMetric(metricId: string, value: number, gender: Gender): LabRepletionRecommendation {
  const meta = LAB_METRICS_INFO[metricId];
  if (!meta) {
    return {
      status: "Normal",
      isLow: false,
      currentValue: value,
      recommendation: "Metric details unavailable.",
      dietaryAdjustment: "N/A",
      tolerableUpperLimit: "N/A"
    };
  }

  let min = meta.normalMin;
  let max = meta.normalMax;
  
  if (metricId === "hemoglobin") {
    if (gender === Gender.MALE) {
      min = meta.maleRange!.min;
      max = meta.maleRange!.max;
    } else {
      min = meta.femaleRange!.min;
      max = meta.femaleRange!.max;
    }
  }

  const deficiencyLimit = meta.deficiencyCutoff;
  const isLow = value < min;
  let status: LabRepletionRecommendation["status"] = "Normal";
  let recommendation = "";
  let dietaryAdjustment = "";

  if (isLow) {
    if (value < deficiencyLimit * 0.6) {
      status = "Severely Deficient";
    } else if (value < deficiencyLimit) {
      status = "Deficient";
    } else {
      status = "Insufficient";
    }
  } else if (value > max) {
    status = "Normal"; // Limit displaying high-specific advice, recommend consulting MD.
    recommendation = `Current level ( ${value} ${meta.unit} ) exceeds normal reference limits (${min}-${max} ${meta.unit}). Avoid any supplementation and consult an endocrinologist/MD to rule out toxicity or metabolic causes.`;
  }

  // Generate deterministic clinical recommendation paths
  if (isLow) {
    switch (metricId) {
      case "vitamin_d3":
        if (status === "Severely Deficient" || status === "Deficient") {
          recommendation = "Repletion Target: 60,000 IU of cholecalciferol oral capsule weekly for 8 weeks (clinical standard), followed by a maintenance dosage of 1,000 - 2,000 IU daily. Re-test levels in 12 weeks.";
        } else {
          recommendation = "Repletion Target: Regular daily maintenance of 1,000 - 2,000 IU cholecalciferol or 60,000 IU oral capsule once a month for 3 months under supervision.";
        }
        dietaryAdjustment = "Integrate fortified foods, direct early-morning non-scorching sunlight exposure for 15-20 minutes daily (increases dermal Vitamin D synthesis), and fortified plant milks (if Vegan) or organic egg yolks and butter (if Non-Veg/Vegetarian).";
        break;
        
      case "vitamin_b12":
        recommendation = "Repletion Target: Cyanocobalamin or Methylcobalamin oral supplement of 1,000 - 1,500 mcg daily for 4-6 weeks to saturate core metabolic coenzymes. If severe symptoms present, parental intramuscular injections (1,000 mcg) may be initiated by a physician.";
        dietaryAdjustment = "Reflect local limits: For Vegetarian, emphasize fermented items like curd/dahi, buttermilk,paneer, and fortified breakfast wheat flakes. For Vegan, depend fully on fortifying dietary yeast (Nutritional Yeast), fortified plant beverages, or direct oral supplementation. For Non-Veg, include pasture-raised eggs, lean meats, and river catch.";
        break;
        
      case "hemoglobin":
        const subIron = status === "Severely Deficient" ? "60-120 mg" : "30-60 mg";
        recommendation = `Repletion Target: Therapeutic daily administration of ${subIron} of elemental iron (e.g., ferrous ascorbate or iron bisglycinate) taken on an empty stomach or with Vitamin C (e.g., lemon juice) to double mucosal iron transport. Avoid tea, coffee, or calcium/milk products within 2 hours of ingestion.`;
        dietaryAdjustment = "Dietary Grounding: For Vegans/Vegetarians, maximize iron non-heme sources like black chana, whole spinach (cooked with tomato acid to break down phytate), sprouted green moong, raw jaggery, beetroot salad, and ragi millets, always co-consumed with citrus juice (amla or nimbu pani). For Non-Veg, pasture-fed chicken liver or standard country egg yolk.";
        break;
        
      case "calcium":
        recommendation = "Repletion Target: Oral supplementation of 500 - 1,000 mg of elemental calcium (e.g., calcium carbonate or calcium citrate malate) taken in split doses of 500 mg per serving with water to optimize intestinal transporter load.";
        dietaryAdjustment = "High-calcium source index: For Vegans, consume ragi flatbreads, horse gram (Kollu) stew, white sesame seeds (til laddu), almonds, tofu, and amaranth greens. For Vegetarians, include high amounts of organic cow milk, paneer, unsweetened dahi, and local curd.";
        break;
    }
  } else if (status === "Normal" && value <= max) {
    recommendation = `Optimal level maintained ( ${value} ${meta.unit} ). Keep following the diet profile plan. No extra clinical supplements required.`;
    dietaryAdjustment = `Maintain regular eating of localized foods corresponding to your chosen dietary tier (${gender} profile).`;
  }

  return {
    status,
    isLow,
    currentValue: value,
    recommendation,
    dietaryAdjustment,
    tolerableUpperLimit: meta.ul
  };
}

// 3. GROUNDING DICTIONARY & COMPLIANCE DICTIONARY
export interface FoodItem {
  name: string;
  localName: string;
  category: DietaryTier[]; // Array of tiers that can consume this
  macrosPer100g: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    calories: number;
  };
  dominantMicros: string[];
  notes: string;
}

// Grounding dict with localized Indian ingredients & values mapping standard portions
export const INDIAN_INGREDIENT_DATABASE: FoodItem[] = [
  {
    name: "Split Yellow Pigeon Peas (Toor Dal)",
    localName: "Arhar / Toor Dal (Cooked)",
    category: [DietaryTier.VEGETARIAN, DietaryTier.VEGAN, DietaryTier.NON_VEGETARIAN],
    macrosPer100g: { protein: 6.8, carbs: 18.2, fat: 0.4, fiber: 5.1, calories: 104 },
    dominantMicros: ["Folate (B9)", "Iron", "Zinc", "Potassium"],
    notes: "Core protein staple in Indian diets. Best paired with brown rice or millet flatbread for a complete essential amino-acid chain.",
  },
  {
    name: "Bengal Gram / Chickpeas",
    localName: "Kala Chana / Kabuli Chana (Boiled)",
    category: [DietaryTier.VEGETARIAN, DietaryTier.VEGAN, DietaryTier.NON_VEGETARIAN],
    macrosPer100g: { protein: 8.9, carbs: 27.4, fat: 1.9, fiber: 7.6, calories: 164 },
    dominantMicros: ["Iron", "Folate (B9)", "Magnesium", "Copper"],
    notes: "Outstanding vegan-compliant source of plant iron and high fiber. Extremely beneficial for regulating diabetic blood response.",
  },
  {
    name: "Soya Chunks",
    localName: "Soya Bari (Cooked/Rehydrated)",
    category: [DietaryTier.VEGETARIAN, DietaryTier.VEGAN, DietaryTier.NON_VEGETARIAN],
    macrosPer100g: { protein: 18.5, carbs: 8.2, fat: 0.5, fiber: 6.5, calories: 110 },
    dominantMicros: ["Iron", "Calcium", "Magnesium", "Zinc"],
    notes: "One of the absolute highest plant protein profiles available for Indian vegans. High biological value relative to price.",
  },
  {
    name: "Indian Cottage Cheese",
    localName: "Paneer (Fresh, Full Cream)",
    category: [DietaryTier.VEGETARIAN, DietaryTier.NON_VEGETARIAN], // NOT VEGAN
    macrosPer100g: { protein: 18.2, carbs: 1.2, fat: 20.8, fiber: 0, calories: 265 },
    dominantMicros: ["Calcium", "Vitamin B12", "Phosphorus", "Vitamin A"],
    notes: "Highly compliant dense protein and rich calcium source for vegetarians. Avoid completely under vegan restrictions.",
  },
  {
    name: "Fresh Curd/Yogurt",
    localName: "Ghar ka Dahi",
    category: [DietaryTier.VEGETARIAN, DietaryTier.NON_VEGETARIAN], // NOT VEGAN
    macrosPer100g: { protein: 3.5, carbs: 4.7, fat: 3.2, fiber: 0, calories: 61 },
    dominantMicros: ["Calcium", "Vitamin B12", "Probiotics", "Phosphorus"],
    notes: "Natural probiotic crucial for healthy Indian gut ecosystems. Helps improve iron absorption from plant sources.",
  },
  {
    name: "Ragi Flour (Finger Millet)",
    localName: "Ragi Gudna / Mandua Flour",
    category: [DietaryTier.VEGETARIAN, DietaryTier.VEGAN, DietaryTier.NON_VEGETARIAN],
    macrosPer100g: { protein: 7.3, carbs: 72.6, fat: 1.3, fiber: 11.5, calories: 328 },
    dominantMicros: ["Calcium (Dense)", "Iron", "Magnesium", "Dietary Fiber"],
    notes: "Dense calcium grain. Standard flatbread (Roti) contains more calcium than standard dairy measurements by volume.",
  },
  {
    name: "Pearl Millet",
    localName: "Bajra Flour",
    category: [DietaryTier.VEGETARIAN, DietaryTier.VEGAN, DietaryTier.NON_VEGETARIAN],
    macrosPer100g: { protein: 11.6, carbs: 67.5, fat: 5.0, fiber: 8.1, calories: 361 },
    dominantMicros: ["Iron", "Magnesium", "Zinc", "Potassium"],
    notes: "Excellent winter millet, warming, rich in iron, and low glycemic index. Great flatbread replacement for refined wheat.",
  },
  {
    name: "Spinach (Fresh Leaf)",
    localName: "Palak (Boiled without oil)",
    category: [DietaryTier.VEGETARIAN, DietaryTier.VEGAN, DietaryTier.NON_VEGETARIAN],
    macrosPer100g: { protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, calories: 23 },
    dominantMicros: ["Vitamin A (Beta Carotene)", "Folate", "Iron", "Vitamin C"],
    notes: "Local green leaf. Non-heme iron requires standard citric acid squeeze (Nimbu) to release the locked iron molecules.",
  },
  {
    name: "Puffed Amaranth Seeds",
    localName: "Rajgira",
    category: [DietaryTier.VEGETARIAN, DietaryTier.VEGAN, DietaryTier.NON_VEGETARIAN],
    macrosPer100g: { protein: 13.6, carbs: 65.2, fat: 7.0, fiber: 6.7, calories: 371 },
    dominantMicros: ["Calcium", "Iron", "Magnesium", "Lysine"],
    notes: "Outstanding gluten-free complete protein grain containing rare amino acids. Promotes cardiovascular health.",
  },
  {
    name: "Sprouted Green Moong Beans",
    localName: "Sprouted Moong Salad",
    category: [DietaryTier.VEGETARIAN, DietaryTier.VEGAN, DietaryTier.NON_VEGETARIAN],
    macrosPer100g: { protein: 7.0, carbs: 15.1, fat: 0.2, fiber: 5.9, calories: 80 },
    dominantMicros: ["Vitamin C", "Folate (B9)", "Iron", "Potassium"],
    notes: "Increases bioavailability of iron and vitamin C by 5x through core enzymatic germination process.",
  },
  {
    name: "White Sesame Seeds",
    localName: "Til",
    category: [DietaryTier.VEGETARIAN, DietaryTier.VEGAN, DietaryTier.NON_VEGETARIAN],
    macrosPer100g: { protein: 17.7, carbs: 23.4, fat: 49.7, fiber: 11.8, calories: 573 },
    dominantMicros: ["Calcium (Super Rich)", "Iron", "Magnesium", "Sesamin"],
    notes: "Supremely efficient vegan calcium booster. 1 tablespoon contains ~95mg of pure elemental calcium.",
  },
  {
    name: "Fresh Whole Egg",
    localName: "Desi Anda (Boiled)",
    category: [DietaryTier.NON_VEGETARIAN], // NOT VEG, NOT VEGAN
    macrosPer100g: { protein: 12.6, carbs: 1.1, fat: 10.6, fiber: 0, calories: 155 },
    dominantMicros: ["Vitamin B12", "Vitamin D", "Choline", "Selenium"],
    notes: "Complete reference gold protein, rich source of essential micronutrients lacking in standard plant food.",
  },
  {
    name: "Lean Chicken Breast",
    localName: "Murgh (Grilled/Stuffed)",
    category: [DietaryTier.NON_VEGETARIAN], // NOT VEG, NOT VEGAN
    macrosPer100g: { protein: 31.0, carbs: 0, fat: 3.6, fiber: 0, calories: 165 },
    dominantMicros: ["Niacin (B3)", "Vitamin B12", "Zinc", "Selenium"],
    notes: "Highly concentrated therapeutic pure protein source. High rates of dietetic absorption.",
  },
  {
    name: "Rohu / Katla River Fish",
    localName: "Machli Curry (Steamed)",
    category: [DietaryTier.NON_VEGETARIAN], // NOT VEG, NOT VEGAN
    macrosPer100g: { protein: 19.7, carbs: 0, fat: 2.4, fiber: 0, calories: 102 },
    dominantMicros: ["Omega-3 Fatty Acids", "Vitamin D", "Vitamin B12", "Iodine"],
    notes: "Freshwater catch delivering clean protein, anti-inflammatory fatty profiles, and crucial bone nutrients.",
  }
];

// Helper to filter and fetch compliant food items
export function getCompliantFoods(tier: DietaryTier): FoodItem[] {
  return INDIAN_INGREDIENT_DATABASE.filter(item => item.category.includes(tier));
}

/**
 * Simulates a clinical parser extracting blood metrics from raw text (e.g. lab reports).
 * Matches patterns like 'Vitamin D3: 15 ng/mL' or 'Hemoglobin = 10.5 g/dL' or 'B12: 180'.
 */
export function parseLabReportText(text: string): Record<string, number | null> {
  const result: Record<string, number | null> = {
    vitamin_d3: null,
    vitamin_b12: null,
    hemoglobin: null,
    calcium: null,
  };

  const normalized = text.toLowerCase();

  // 1. Vit D3 RegEx
  // Typical match: 'vitamin d3: 15 ng/ml' or 'vit d3 = 24' or 'vitamin d 30'
  const d3Regex = /(?:vitamin\s*d3|vit\s*d3|vitamin\s*d|vit\s*d)\s*[:=]?\s*(\d+(?:\.\d+)?)/i;
  const d3Match = normalized.match(d3Regex);
  if (d3Match && d3Match[1]) {
    result.vitamin_d3 = parseFloat(d3Match[1]);
  }

  // 2. Vit B12 RegEx
  // Typical match: 'vitamin b12: 150 pg/ml' or 'vit b12 = 180' or 'b12 250'
  const b12Regex = /(?:vitamin\s*b12|vit\s*b12|b12|cobalamin)\s*[:=]?\s*(\d+(?:\.\d+)?)/i;
  const b12Match = normalized.match(b12Regex);
  if (b12Match && b12Match[1]) {
    result.vitamin_b12 = parseFloat(b12Match[1]);
  }

  // 3. Hemoglobin RegEx
  // Typical match: 'hemoglobin: 11' or 'hb = 13.5'
  const hbRegex = /(?:hemoglobin|hb|haemoglobin)\s*[:=]?\s*(\d+(?:\.\d+)?)/i;
  const hbMatch = normalized.match(hbRegex);
  if (hbMatch && hbMatch[1]) {
    result.hemoglobin = parseFloat(hbMatch[1]);
  }

  // 4. Calcium RegEx
  // Typical match: 'calcium = 8.9' or 'serum calcium: 9.2'
  const calciumRegex = /(?:calcium|serum\s*calcium)\s*[:=]?\s*(\d+(?:\.\d+)?)/i;
  const calciumMatch = normalized.match(calciumRegex);
  if (calciumMatch && calciumMatch[1]) {
    result.calcium = parseFloat(calciumMatch[1]);
  }

  return result;
}

