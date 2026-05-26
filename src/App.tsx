/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  DietaryTier, 
  Gender, 
  ActivityLevel, 
  UserMetrics, 
  calculateEnergy, 
  evaluateLabMetric, 
  getCompliantFoods, 
  parseLabReportText, 
  LAB_METRICS_INFO,
  INDIAN_INGREDIENT_DATABASE,
  CHRONIC_DISEASE_DIETARY_GUIDELINES
} from "./utils/nutrition";
import { 
  Activity, 
  Check, 
  ChevronRight, 
  FileText, 
  Flame, 
  Heart, 
  Info, 
  MessageSquare, 
  RefreshCw, 
  Send, 
  ShieldAlert, 
  Sparkles, 
  UploadCloud, 
  User, 
  Utensils,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// -------------------------------------------------------------
// CHAT VISUAL RENDERING CUSTOM ELEMENTS & PARSERS
// -------------------------------------------------------------

const colorSchemes: Record<string, { bg: string; border: string; accent: string; text: string; headerBg: string }> = {
  emerald: {
    bg: "bg-emerald-50/70 border-emerald-200/80",
    border: "border-l-4 border-l-emerald-600",
    accent: "bg-emerald-100 text-emerald-800",
    text: "text-slate-800",
    headerBg: "bg-emerald-100/60 text-emerald-950 font-bold"
  },
  amber: {
    bg: "bg-amber-50/70 border-amber-200/80",
    border: "border-l-4 border-l-amber-500",
    accent: "bg-amber-100 text-amber-800",
    text: "text-slate-800",
    headerBg: "bg-amber-100/60 text-amber-950 font-bold"
  },
  blue: {
    bg: "bg-blue-50/70 border-blue-200/80",
    border: "border-l-4 border-l-blue-500",
    accent: "bg-blue-100 text-blue-800",
    text: "text-slate-800",
    headerBg: "bg-blue-100/60 text-blue-950 font-bold"
  },
  rose: {
    bg: "bg-rose-50/60 border-rose-200/80",
    border: "border-l-4 border-l-rose-500",
    accent: "bg-rose-100 text-rose-800",
    text: "text-slate-800",
    headerBg: "bg-rose-100/60 text-rose-950 font-bold"
  },
  violet: {
    bg: "bg-violet-50/70 border-violet-200/80",
    border: "border-l-4 border-l-violet-500",
    accent: "bg-violet-100 text-violet-800",
    text: "text-slate-800",
    headerBg: "bg-violet-100/60 text-violet-950 font-bold"
  },
  orange: {
    bg: "bg-orange-50/70 border-orange-200/80",
    border: "border-l-4 border-l-orange-500",
    accent: "bg-orange-100 text-orange-800",
    text: "text-slate-800",
    headerBg: "bg-orange-100/60 text-orange-950 font-bold"
  },
  slate: {
    bg: "bg-slate-50/70 border-slate-200/80",
    border: "border-l-4 border-l-slate-400",
    accent: "bg-slate-200 text-slate-800",
    text: "text-slate-800",
    headerBg: "bg-slate-200/60 text-slate-950 font-bold"
  }
};

const extractNum = (str: string) => {
  if (!str) return 0;
  const match = str.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
};

const DietCardComponent = ({ title, calories, protein, carbs, fat, color = "emerald", body }: any) => {
  const scheme = colorSchemes[color] || colorSchemes.emerald;
  
  const pVal = extractNum(protein);
  const cVal = extractNum(carbs);
  const fVal = extractNum(fat);
  const total = pVal + cVal + fVal || 1;
  const pPct = `${(pVal / total) * 100}%`;
  const cPct = `${(cVal / total) * 100}%`;
  const fPct = `${(fVal / total) * 100}%`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border ${scheme.bg} ${scheme.border} p-4.5 my-4 shadow-sm hover:shadow transition duration-200 text-slate-800`}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200/40 pb-2.5 mb-3 gap-2">
        <h4 className="font-extrabold text-sm text-slate-900 flex items-center space-x-1.5 leading-tight">
          <span>{title}</span>
        </h4>
        <span className="font-sans text-xs font-bold bg-white text-slate-800 border border-slate-200/80 px-2.5 py-0.5 rounded-full shadow-2xs shrink-0 self-start sm:self-auto leading-none">
          🔥 {calories}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold font-mono bg-white/70 p-2 rounded-xl border border-slate-100">
        <div>
          <span className="text-emerald-600 block font-sans text-[7px] uppercase tracking-wider mb-0.5">Protein</span>
          <span className="text-emerald-700 font-extrabold">{protein}</span>
        </div>
        <div>
          <span className="text-amber-600 block font-sans text-[7px] uppercase tracking-wider mb-0.5">Carbohydrate</span>
          <span className="text-amber-700 font-extrabold">{carbs}</span>
        </div>
        <div>
          <span className="text-rose-600 block font-sans text-[7px] uppercase tracking-wider mb-0.5 font-bold">Fats</span>
          <span className="text-rose-700 font-extrabold">{fat}</span>
        </div>
      </div>

      {/* Dynamic nutrition composition slider representation */}
      <div className="my-3">
        <div className="flex justify-between text-[8px] text-slate-400 font-extrabold uppercase tracking-wider mb-1">
          <span>Meal Macro Distribution</span>
          <span className="flex space-x-2">
            <span className="text-emerald-500">P: {Math.round((pVal/total)*100)}%</span>
            <span className="text-amber-500">C: {Math.round((cVal/total)*100)}%</span>
            <span className="text-rose-500">F: {Math.round((fVal/total)*100)}%</span>
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden bg-slate-200/50 flex">
          <div style={{ width: pPct }} className="bg-emerald-500" title={`Protein: ${protein}`} />
          <div style={{ width: cPct }} className="bg-amber-400" title={`Carbohydrates: ${carbs}`} />
          <div style={{ width: fPct }} className="bg-rose-500" title={`Fat: ${fat}`} />
        </div>
      </div>

      <div className="text-xs text-slate-700 font-medium leading-relaxed mt-2 whitespace-pre-wrap pl-2 border-l border-slate-300">
        {body.trim()}
      </div>
    </motion.div>
  );
};

const BiomarkerRepletionComponent = ({ title, level, color = "rose", body }: any) => {
  const scheme = colorSchemes[color] || colorSchemes.rose;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border ${scheme.bg} ${scheme.border} p-4 my-4 shadow-sm hover:shadow transition duration-200 text-slate-800`}
    >
      <div className="flex items-center space-x-2 border-b border-slate-200/50 pb-2.5 mb-3">
        <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
        <div className="flex-1">
          <h4 className="font-extrabold text-xs text-slate-900 uppercase leading-none">{title}</h4>
          <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wide block mt-1">Grounded Intervention Guidance</span>
        </div>
        <span className={`font-sans text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${scheme.accent} shrink-0`}>
          {level}
        </span>
      </div>

      <div className="text-xs text-slate-700 font-medium leading-relaxed whitespace-pre-wrap pl-2 border-l border-slate-300">
        {body.trim()}
      </div>
    </motion.div>
  );
};

const renderMessageContent = (content: string) => {
  const parts = [];
  let lastIndex = 0;
  const regex = /<(DietCard|BiomarkerRepletion)\s+([^>]*?)>([\s\S]*?)<\/\1>/gi;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const matchIndex = match.index;
    
    if (matchIndex > lastIndex) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex, matchIndex)
      });
    }

    const tagName = match[1];
    const attributesRaw = match[2];
    const bodyText = match[3];

    const attrs: Record<string, string> = {};
    const attrRegex = /(\w+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/g;
    let attrMatch;
    while ((attrMatch = attrRegex.exec(attributesRaw)) !== null) {
      attrs[attrMatch[1]] = attrMatch[2] || attrMatch[3] || attrMatch[4];
    }

    parts.push({
      type: tagName,
      attrs,
      body: bodyText
    });

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      content: content.slice(lastIndex)
    });
  }

  return parts;
};

export default function App() {
  // 1. STATE MANAGEMENT
  const [dietaryTier, setDietaryTier] = useState<DietaryTier>(DietaryTier.VEGETARIAN);
  const [gender, setGender] = useState<Gender>(Gender.FEMALE);
  const [age, setAge] = useState<number>(30);
  const [weight, setWeight] = useState<number>(65); // kg
  const [height, setHeight] = useState<number>(165); // cm
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(ActivityLevel.SEDENTARY);
  const [chronicConditions, setChronicConditions] = useState<string[]>([]);
  const [customBiomarkers, setCustomBiomarkers] = useState<{ name: string; value: string; unit: string; referenceRange: string; status: string; conditionContext: string }[]>([]);
  
  // Lab values
  const [labValues, setLabValues] = useState<{
    vitamin_d3: number | string;
    vitamin_b12: number | string;
    hemoglobin: number | string;
    calcium: number | string;
  }>({
    vitamin_d3: 35,
    vitamin_b12: 450,
    hemoglobin: 13.5,
    calcium: 9.4
  });

  const [notesLog, setNotesLog] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [scanResult, setScanResult] = useState<{
    status: "success" | "error" | null;
    message: string;
    metrics: { name: string; value: string; unit: string }[];
  } | null>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "math" | "foods">("chat");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Chat History
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `🙏 **Namaste! I am GharKaNutri AI**, your expert clinical-grade family nutritionist. 
      
I operate using strict medical dietetic rules grounded specifically under the traditional Indian household. Let's design a customized health menu for you!
4
👈 **Set up your family profile & medical biomarkers in the sidebar**, and ask me anything about recipe adaptations (e.g., "Give me a high-protein dinner plan"), herbal alternatives, or supplement details.`
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // 2. MATHEMATICAL DECOUPLED CALCULATOR FOR FRONTEND UX
  const metrics: UserMetrics = {
    age,
    weight,
    height,
    gender,
    activityLevel,
    dietaryTier,
    chronicConditions,
    customBiomarkers
  };

  const results = calculateEnergy(metrics);

  // Auto-scroll chats
  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3. FILE PARSER EVENT HANDLERS
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setScanResult(null);

    try {
      // 1. Read file as Base64 Data URL
      const reader = new FileReader();
      const filePromise = new Promise<{ base64: string; mimeType: string }>((resolve, reject) => {
        reader.onload = () => {
          const resStr = reader.result as string;
          const marker = ";base64,";
          const idx = resStr.indexOf(marker);
          if (idx === -1) {
            reject(new Error("Unable to parse base64 file data"));
            return;
          }
          const mimeType = resStr.substring(5, idx);
          const base64 = resStr.substring(idx + marker.length);
          resolve({ base64, mimeType });
        };
        reader.onerror = () => reject(new Error("Exception reading current file"));
        reader.readAsDataURL(file);
      });

      const { base64, mimeType } = await filePromise;

      // 2. Query multi-modal clinical scanner
      console.log("Contacting server document parses API with file...");
      const response = await fetch("/api/parse-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64Data: base64,
          mimeType: mimeType,
          filename: file.name
        })
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || `HTTP ${response.status} from document api`);
      }

      const { parsed } = await response.json();
      const updatedValues = { ...labValues };
      let logsAdded = [];
      let detectedBiomarkers = [];

      if (parsed.vitamin_d3 !== null && parsed.vitamin_d3 !== undefined) {
        updatedValues.vitamin_d3 = parsed.vitamin_d3;
        logsAdded.push(`Vitamin D3: ${parsed.vitamin_d3} ng/mL`);
        detectedBiomarkers.push({ name: "Vitamin D3", value: String(parsed.vitamin_d3), unit: "ng/mL" });
      }
      if (parsed.vitamin_b12 !== null && parsed.vitamin_b12 !== undefined) {
        updatedValues.vitamin_b12 = parsed.vitamin_b12;
        logsAdded.push(`Vitamin B12: ${parsed.vitamin_b12} pg/mL`);
        detectedBiomarkers.push({ name: "Vitamin B12", value: String(parsed.vitamin_b12), unit: "pg/mL" });
      }
      if (parsed.hemoglobin !== null && parsed.hemoglobin !== undefined) {
        updatedValues.hemoglobin = parsed.hemoglobin;
        logsAdded.push(`Hemoglobin: ${parsed.hemoglobin} g/dL`);
        detectedBiomarkers.push({ name: "Hemoglobin", value: String(parsed.hemoglobin), unit: "g/dL" });
      }
      if (parsed.calcium !== null && parsed.calcium !== undefined) {
        updatedValues.calcium = parsed.calcium;
        logsAdded.push(`Serum Calcium: ${parsed.calcium} mg/dL`);
        detectedBiomarkers.push({ name: "Serum Calcium", value: String(parsed.calcium), unit: "mg/dL" });
      }

      if (parsed.allExtracted && Array.isArray(parsed.allExtracted)) {
        setCustomBiomarkers(parsed.allExtracted);
        parsed.allExtracted.forEach((m: any) => {
          const nameNorm = m.name.toLowerCase();
          const valNum = parseFloat(m.value);
          if (!isNaN(valNum)) {
            if (nameNorm.includes("vitamin d") && nameNorm.includes("3")) {
              updatedValues.vitamin_d3 = valNum;
              if (!logsAdded.some(l => l.includes("Vitamin D3"))) {
                logsAdded.push(`Vitamin D3: ${valNum} ng/mL`);
              }
            } else if (nameNorm.includes("vitamin b") && nameNorm.includes("12")) {
              updatedValues.vitamin_b12 = valNum;
              if (!logsAdded.some(l => l.includes("Vitamin B12"))) {
                logsAdded.push(`Vitamin B12: ${valNum} pg/mL`);
              }
            } else if (nameNorm.includes("hemoglobin") || nameNorm === "hb") {
              updatedValues.hemoglobin = valNum;
              if (!logsAdded.some(l => l.includes("Hemoglobin"))) {
                logsAdded.push(`Hemoglobin: ${valNum} g/dL`);
              }
            } else if (nameNorm.includes("calcium")) {
              updatedValues.calcium = valNum;
              if (!logsAdded.some(l => l.includes("Serum Calcium"))) {
                logsAdded.push(`Serum Calcium: ${valNum} mg/dL`);
              }
            }
          }
          if (!detectedBiomarkers.some(b => b.name === m.name)) {
            detectedBiomarkers.push({ name: m.name, value: `${m.value} (${m.status})`, unit: m.unit });
          }
        });
      }

      setLabValues(updatedValues);
      
      if (detectedBiomarkers.length > 0) {
        setScanResult({
          status: "success",
          message: `Clinically scanned report "${file.name}" and extracted biomarkers successfully for diseases diagnostics!`,
          metrics: detectedBiomarkers
        });

        // Generate and stream deep analysis straight into the chat area as a beautiful clinical table!
        const reportTextDetails = `🧪 **[Diagnostic Report Scanned]**
GharKaNutri AI successfully analyzed report: **${file.name}**! 

Here are the key diagnostic outcomes and abnormal biomarkers extracted:

${parsed.allExtracted && parsed.allExtracted.length > 0 ? `| **Clinical Indicator / Biomarker** | **Reported Value** | **Reference Limits** | **Designation** | **Medical / Pathological Context** |
| :--- | :---: | :---: | :---: | :--- |
${parsed.allExtracted.map((b: any) => `| ${b.name} | \`${b.value} ${b.unit}\` | \`${b.referenceRange}\` | **${b.status}** | ${b.conditionContext} |`).join("\n")}

I have automatically registered these parameters in your clinical sliders and synchronised your active calculation engines. 

*Select appropriate Chronic Disease filters in the sidebar or ask me to draft a custom dietary intervention plan matching these metrics!*` : `| **Biomarker Standard** | **Result** | **Status** |
| :--- | :---: | :---: |
${detectedBiomarkers.map(b => `| ${b.name} | \`${b.value}\` | **Checked** |`).join("\n")}

I have synchronized these inputs to your metabolic calculation deck. How shall I adapt your weekly household diet?`}`;

        setMessages(prev => [...prev, {
          role: "assistant",
          content: reportTextDetails
        }]);

      } else {
        setScanResult({
          status: "error",
          message: `Parser completed scanning "${file.name}" but found no standard markers. Enter values below.`,
          metrics: []
        });
      }

    } catch (error: any) {
      console.error("Clinical multi-modal scanner failure, falling back to regex: ", error);
      
      // Local fallback for text formats (.txt)
      if (file.name.endsWith(".txt") || file.type.startsWith("text/")) {
        const txtReader = new FileReader();
        txtReader.onload = (event) => {
          const txt = event.target?.result as string;
          const parsed = parseLabReportText(txt);
          const updatedValues = { ...labValues };
          let logsAdded = [];
          let detectedBiomarkers = [];

          if (parsed.vitamin_d3 !== null) {
            updatedValues.vitamin_d3 = parsed.vitamin_d3;
            logsAdded.push(`Vitamin D3: ${parsed.vitamin_d3} ng/mL`);
            detectedBiomarkers.push({ name: "Vitamin D3", value: String(parsed.vitamin_d3), unit: "ng/mL" });
          }
          if (parsed.vitamin_b12 !== null) {
            updatedValues.vitamin_b12 = parsed.vitamin_b12;
            logsAdded.push(`Vitamin B12: ${parsed.vitamin_b12} pg/mL`);
            detectedBiomarkers.push({ name: "Vitamin B12", value: String(parsed.vitamin_b12), unit: "pg/mL" });
          }
          if (parsed.hemoglobin !== null) {
            updatedValues.hemoglobin = parsed.hemoglobin;
            logsAdded.push(`Hemoglobin: ${parsed.hemoglobin} g/dL`);
            detectedBiomarkers.push({ name: "Hemoglobin", value: String(parsed.hemoglobin), unit: "g/dL" });
          }
          if (parsed.calcium !== null) {
            updatedValues.calcium = parsed.calcium;
            logsAdded.push(`Serum Calcium: ${parsed.calcium} mg/dL`);
            detectedBiomarkers.push({ name: "Serum Calcium", value: String(parsed.calcium), unit: "mg/dL" });
          }

          setLabValues(updatedValues);
          if (logsAdded.length > 0) {
            setScanResult({
              status: "success",
              message: `[Fallback Local Parser] Scanned "${file.name}" and extracted biomarkers successfully.`,
              metrics: detectedBiomarkers
            });
          } else {
            setScanResult({
              status: "error",
              message: `Fallback parser completed scan on "${file.name}" but found no standard markers.`,
              metrics: []
            });
          }
        };
        txtReader.readAsText(file);
      } else {
        setScanResult({
          status: "error",
          message: `Scanner error: ${error.message || error}. Check your GEMINI_API_KEY inside Settings > Secrets or upload manually below.`,
          metrics: []
        });
      }
    } finally {
      setIsParsing(false);
      e.target.value = "";
    }
  };

  const handleManualTextParse = () => {
    if (!notesLog.trim()) return;
    setIsParsing(true);
    setScanResult(null);
    setTimeout(() => {
      const parsed = parseLabReportText(notesLog);
      const updatedValues = { ...labValues };
      let detectedBiomarkers = [];
      
      if (parsed.vitamin_d3 !== null) {
        updatedValues.vitamin_d3 = parsed.vitamin_d3;
        detectedBiomarkers.push({ name: "Vitamin D3", value: String(parsed.vitamin_d3), unit: "ng/mL" });
      }
      if (parsed.vitamin_b12 !== null) {
        updatedValues.vitamin_b12 = parsed.vitamin_b12;
        detectedBiomarkers.push({ name: "Vitamin B12", value: String(parsed.vitamin_b12), unit: "pg/mL" });
      }
      if (parsed.hemoglobin !== null) {
        updatedValues.hemoglobin = parsed.hemoglobin;
        detectedBiomarkers.push({ name: "Hemoglobin", value: String(parsed.hemoglobin), unit: "g/dL" });
      }
      if (parsed.calcium !== null) {
        updatedValues.calcium = parsed.calcium;
        detectedBiomarkers.push({ name: "Serum Calcium", value: String(parsed.calcium), unit: "mg/dL" });
      }

      setLabValues(updatedValues);
      setIsParsing(false);
      setNotesLog("");

      if (detectedBiomarkers.length > 0) {
        setScanResult({
          status: "success",
          message: "Raw diagnostic notes parsed successfully!",
          metrics: detectedBiomarkers
        });

        const reportTextDetails = `📝 **[Manual Diagnostic Logs Parsed]**
Parsed diagnostic insights from clipboard text block successfully! 

Here are the extracted biomarkers:
${detectedBiomarkers.map(b => `*   **${b.name}**: \`${b.value} ${b.unit || ""}\` (Physiologically parsed)`).join("\n")}

I have automatically calibrated your clinical sliders with these values. Let's design a customized household plan!`;

        setMessages(prev => [...prev, {
          role: "assistant",
          content: reportTextDetails
        }]);

      } else {
        setScanResult({
          status: "error",
          message: "Completed search, but failed to extract standard metrics. Use e.g., 'Hemoglobin 11.2, Hb is 12'.",
          metrics: []
        });
      }
    }, 450);
  };

  // Convert input values safely to numbers
  const d3Num = Number(labValues.vitamin_d3) || 0;
  const b12Num = Number(labValues.vitamin_b12) || 0;
  const hemoglobinNum = Number(labValues.hemoglobin) || 0;
  const calciumNum = Number(labValues.calcium) || 0;

  // Evaluate lab metrics for quick indicators
  const d3Rep = evaluateLabMetric("vitamin_d3", d3Num, gender);
  const b12Rep = evaluateLabMetric("vitamin_b12", b12Num, gender);
  const hbRep = evaluateLabMetric("hemoglobin", hemoglobinNum, gender);
  const calRep = evaluateLabMetric("calcium", calciumNum, gender);

  // 4. CHAT AGENT ACTIONS (CALLING SERVER ENDPOINT)
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const userText = inputMessage;
    setInputMessage("");
    setMessages(prev => [...prev, { role: "user", content: userText }]);
    setIsSending(true);

    try {
      const chatHistory = [...messages, { role: "user", content: userText }];
      
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatHistory,
          metrics,
          labValues: {
            vitamin_d3: d3Num,
            vitamin_b12: b12Num,
            hemoglobin: hemoglobinNum,
            calcium: calciumNum
          }
        })
      });

      if (!response.ok) {
        throw new Error("Failed to contact the backend service.");
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.text }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: `⚠️ **API Connection Hold:** I couldn't reach the server-side calculations. Please verify your internet connection or register your GEMINI_API_KEY in the Secrets menu.
        
*Deterministic numbers remain available in the next tab!*`
      }]);
    } finally {
      setIsSending(false);
    }
  };

  // 6. RENDER STYLED UI COMPONENTS
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans" id="gharkanutri-workspace">
      
      {/* HEADER SECTION */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-4 flex items-center justify-between" id="app-header">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-700">
            <span className="text-2xl font-bold">🥗</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900" id="main-title">
              GharKaNutri <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full ml-2">AI Indian Nutritionist</span>
            </h1>
            <p className="text-xs text-slate-500">Clinical-Grade Household Meal Architect & Dietologist</p>
          </div>
        </div>
      </header>

      {/* CORE SPLIT SCREEN */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 md:p-6 gap-6" id="split-workspace">
        
        {/* SIDEBAR: Streamlit Inspired Parameters Deck */}
        <aside className="w-full md:w-80 bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex flex-col space-y-6 shrink-0" id="sidebar-filters">
          
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <User className="w-5 h-5 text-emerald-600" />
              <h2 className="text-md font-bold text-slate-900">Household Profile</h2>
            </div>

            {/* Dietary Tier Buttons */}
            <div className="space-y-2 mb-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Dietary Constraint Filter</label>
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
                {[DietaryTier.VEGETARIAN, DietaryTier.VEGAN, DietaryTier.NON_VEGETARIAN].map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setDietaryTier(tier)}
                    className={`text-[10px] sm:text-xs font-bold py-1.5 px-1 rounded-lg text-center transition ${
                      dietaryTier === tier 
                        ? "bg-white text-emerald-700 shadow-sm border border-slate-200/50" 
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {tier === DietaryTier.NON_VEGETARIAN ? "Non-Veg" : tier}
                  </button>
                ))}
              </div>
            </div>

            {/* Row Gender & Age */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Gender</label>
                <select 
                  value={gender} 
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
                >
                  <option value={Gender.FEMALE}>Female</option>
                  <option value={Gender.MALE}>Male</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Age (Years)</label>
                <input 
                  type="number" 
                  min={1} 
                  max={110} 
                  value={age} 
                  onChange={(e) => setAge(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Height & Weight Inputs */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Weight (kg)</label>
                <input 
                  type="number" 
                  min={15} 
                  max={250} 
                  step="0.5"
                  value={weight} 
                  onChange={(e) => setWeight(Math.max(15, Number(e.target.value)))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Height (cm)</label>
                <input 
                  type="number" 
                  min={50} 
                  max={250} 
                  value={height} 
                  onChange={(e) => setHeight(Math.max(50, Number(e.target.value)))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Activity Level SELECT */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-500 block mb-1">Physical Activity</label>
              <select 
                value={activityLevel} 
                onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-800 focus:outline-none"
              >
                {[
                  ActivityLevel.SEDENTARY,
                  ActivityLevel.SLIGHTLY_ACTIVE,
                  ActivityLevel.MODERATELY_ACTIVE,
                  ActivityLevel.ACTIVE,
                  ActivityLevel.VERY_ACTIVE
                ].map((act) => (
                  <option key={act} value={act}>{act}</option>
                ))}
              </select>
            </div>

            {/* Chronic Conditions multi-select button panel */}
            <div className="space-y-2 mb-2">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Chronic Conditions Focus Filter</label>
              <div className="flex flex-wrap gap-1">
                {[
                  { id: "Diabetes", label: "Diabetes 🩸" },
                  { id: "Hypertension", label: "Hypertension 🫀" },
                  { id: "CKD", label: "Kidney CKD 🩺" },
                  { id: "Thyroid", label: "Thyroid 🦋" },
                  { id: "PCOS", label: "PCOS/PCOD 🌸" },
                  { id: "Celiac", label: "Celiac 🍞" },
                  { id: "Gout", label: "Gout/Uric 🦶" }
                ].map((cond) => {
                  const isChecked = chronicConditions.includes(cond.id);
                  return (
                    <button
                      key={cond.id}
                      type="button"
                      onClick={() => {
                        if (isChecked) {
                          setChronicConditions(chronicConditions.filter(c => c !== cond.id));
                        } else {
                          setChronicConditions([...chronicConditions, cond.id]);
                        }
                      }}
                      className={`text-[9.5px] font-bold px-2 py-1 rounded-lg border transition flex items-center space-x-1 cursor-pointer ${
                        isChecked 
                          ? "bg-rose-50 text-rose-700 border-rose-200 shadow-xs" 
                          : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <span>{cond.label}</span>
                      {isChecked && <Check className="w-2.5 h-2.5 shrink-0 text-rose-600 ml-0.5" />}
                    </button>
                  );
                })}
              </div>

              {/* Custom disease text tag builder */}
              <div className="flex space-x-1 pt-1">
                <input 
                  type="text" 
                  id="custom-condition-input"
                  placeholder="Custom condition... (e.g. Asthma, GERD)"
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-medium text-slate-800 flex-1 focus:outline-none focus:border-rose-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val) {
                        const capitalized = val.split(" ").map(w => w.charAt(0).toUpperCase() + w.substring(1)).join(" ");
                        if (!chronicConditions.includes(capitalized)) {
                          setChronicConditions([...chronicConditions, capitalized]);
                        }
                        (e.target as HTMLInputElement).value = "";
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("custom-condition-input") as HTMLInputElement;
                    const val = el?.value?.trim();
                    if (val) {
                      const capitalized = val.split(" ").map(w => w.charAt(0).toUpperCase() + w.substring(1)).join(" ");
                      if (!chronicConditions.includes(capitalized)) {
                        setChronicConditions([...chronicConditions, capitalized]);
                      }
                      el.value = "";
                    }
                  }}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-[9px] px-2.5 rounded-lg shrink-0 cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* LAB METRIC PANEL */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <FileText className="w-5 h-5 text-emerald-600" />
              <h2 className="text-md font-bold text-slate-900">Lab Diagnostic Scanners</h2>
            </div>

            {/* Real Intelligent Drag & Drop Multi-modal Uploader */}
            <div className={`relative border-2 border-dashed rounded-xl py-5 px-3 px-3.5 transition text-center cursor-pointer group mb-3 ${
              isParsing ? 'border-emerald-500 bg-emerald-50/20 animate-pulse' : 'border-slate-200 hover:border-emerald-500 bg-slate-50/80 hover:bg-slate-50'
            }`}>
              <input 
                type="file" 
                accept=".txt,.pdf,image/*" 
                onChange={handleFileUpload} 
                disabled={isParsing}
                className="absolute inset-0 opacity-0 w-full cursor-pointer h-full disabled:cursor-not-allowed"
              />
              {isParsing ? (
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-1.5" />
                  <p className="text-[10px] font-bold text-emerald-700">Gemini Clinical Deep-Scanning of Document...</p>
                  <p className="text-[8px] text-emerald-500">Processing text & visuals to extract biomarkers</p>
                </div>
              ) : (
                <>
                  <UploadCloud className="w-7 h-7 text-slate-400 group-hover:text-emerald-600 mx-auto mb-1.5 transition-colors" />
                  <p className="text-[10px] font-bold text-slate-700 group-hover:text-emerald-800">Scan Lab Report (PDF, Image, or TXT)</p>
                  <p className="text-[8px] text-slate-400">Powered by Gemini-3.5 vision-enabled lab analyst</p>
                </>
              )}
            </div>

            {/* Notes log parsing */}
            <div className="space-y-1.5 mb-4">
              <textarea 
                className="w-full text-[11px] font-medium bg-slate-50 border border-slate-200 rounded-lg p-2 h-14 focus:outline-none text-slate-700"
                placeholder="Or paste lab notes logs... e.g., 'Hb is 10.5, Vitamin D3: 15'"
                value={notesLog}
                onChange={(e) => setNotesLog(e.target.value)}
              />
              <button 
                onClick={handleManualTextParse}
                disabled={isParsing}
                className="w-full bg-slate-800 hover:bg-slate-950 text-white text-[10px] font-bold py-1.5 rounded-lg transition"
              >
                {isParsing ? "Analyzing biomarkers..." : "Parse Raw Logs"}
              </button>
            </div>

            {/* Visual Scan Output Feed Panel */}
            {scanResult && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-3.5 rounded-xl border mb-4 text-xs shadow-xs leading-normal ${
                  scanResult.status === "success" 
                    ? "bg-emerald-50 border-emerald-200 text-emerald-950" 
                    : "bg-amber-50 border-amber-200 text-amber-950"
                }`}
              >
                <div className="flex items-center justify-between font-extrabold mb-1.5 uppercase tracking-wide text-[10px]">
                  <div className="flex items-center space-x-1.5 text-slate-900">
                    {scanResult.status === "success" ? (
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 block" />
                    ) : (
                      <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0 block" />
                    )}
                    <span>Lab Scanner Feed</span>
                  </div>
                  <button 
                    onClick={() => setScanResult(null)}
                    className="text-[9px] uppercase font-bold text-slate-400 hover:text-slate-600 cursor-pointer border border-slate-200/50 hover:bg-slate-200/30 px-1.5 py-0.5 rounded"
                  >
                    Dismiss
                  </button>
                </div>
                <p className="text-[10px] font-semibold text-slate-850 leading-snug mb-2">{scanResult.message}</p>
                {scanResult.metrics.length > 0 && (
                  <div className="grid grid-cols-2 gap-1.5 bg-white/80 p-2 rounded-lg border border-slate-200/40">
                    {scanResult.metrics.map((m, mIdx) => (
                      <div key={mIdx} className="flex justify-between items-center text-[10px] p-1 font-bold text-slate-700 bg-white shadow-s border border-slate-100 rounded">
                        <span className="text-slate-500 font-sans tracking-tight">{m.name}:</span>
                        <span className="font-extrabold text-emerald-700 font-mono">{m.value} {m.unit}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Realtime overridable lab elements */}
            <div className="space-y-3.5 bg-slate-50 p-3 rounded-xl border border-slate-200/50">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active Lab Values Oversight</h3>
              
              {/* D3 */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span>Vitamin D3 (ng/mL)</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${d3Rep?.isLow ? "bg-red-50 text-red-600 font-bold" : "bg-emerald-50 text-emerald-600"}`}>
                    {labValues.vitamin_d3 || "N/A"} {d3Rep?.isLow ? "(Deficient)" : "(Normal)"}
                  </span>
                </div>
                <input 
                  type="range" min="5" max="150" 
                  value={d3Num} 
                  onChange={(e) => setLabValues({...labValues, vitamin_d3: Number(e.target.value)})}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

              {/* B12 */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span>Vitamin B12 (pg/mL)</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${b12Rep?.isLow ? "bg-red-50 text-red-600 font-bold" : "bg-emerald-50 text-emerald-600"}`}>
                    {labValues.vitamin_b12 || "N/A"} {b12Rep?.isLow ? "(Low)" : "(Normal)"}
                  </span>
                </div>
                <input 
                  type="range" min="50" max="1500" step="10"
                  value={b12Num} 
                  onChange={(e) => setLabValues({...labValues, vitamin_b12: Number(e.target.value)})}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

              {/* Hemoglobin */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span>Hemoglobin (g/dL)</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${hbRep?.isLow ? "bg-red-50 text-red-600 font-bold" : "bg-emerald-50 text-emerald-600"}`}>
                    {labValues.hemoglobin || "N/A"} {hbRep?.isLow ? "(Anemic)" : "(Normal)"}
                  </span>
                </div>
                <input 
                  type="range" min="5" max="22" step="0.1"
                  value={hemoglobinNum} 
                  onChange={(e) => setLabValues({...labValues, hemoglobin: Number(e.target.value)})}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

              {/* Calcium */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span>Calcium (mg/dL)</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${calRep?.isLow ? "bg-red-50 text-red-600 font-bold" : "bg-emerald-50 text-emerald-600"}`}>
                    {labValues.calcium || "N/A"} {calRep?.isLow ? "(Low)" : "(Optimal)"}
                  </span>
                </div>
                <input 
                  type="range" min="5" max="15" step="0.1"
                  value={calciumNum} 
                  onChange={(e) => setLabValues({...labValues, calcium: Number(e.target.value)})}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

            </div>
          </div>

        </aside>

        {/* WORKSPACE AREA: Dynamic Clinical Tabs */}
        <main className="flex-1 flex flex-col min-w-0" id="main-content-workspace">
          
          {/* TAB BUTTONS (Directly matching Streamlit panels) */}
          <div className="flex border-b border-slate-200 bg-white px-2 rounded-t-2xl pt-2 sm:space-x-2" id="nav-tabs">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex items-center space-x-2 px-4 py-3 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 ${
                activeTab === "chat" 
                  ? "border-emerald-600 text-emerald-700 bg-emerald-50/40" 
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>💬 Clinical Conversations</span>
            </button>
            <button
              onClick={() => setActiveTab("math")}
              className={`flex items-center space-x-2 px-4 py-3 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 ${
                activeTab === "math" 
                  ? "border-emerald-600 text-emerald-700 bg-emerald-50/40" 
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>📊 Pure Math Calculator</span>
            </button>
            <button
              onClick={() => setActiveTab("foods")}
              className={`flex items-center space-x-2 px-4 py-3 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 ${
                activeTab === "foods" 
                  ? "border-emerald-600 text-emerald-700 bg-emerald-50/40" 
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>🥬 Local Staple Index</span>
            </button>
          </div>

          {/* TAB DESKS */}
          <div className="flex-1 bg-white border-x border-b border-slate-200 rounded-b-2xl shadow-sm p-4 md:p-6 flex flex-col justify-between" id="active-panel">
            
            {/* VIEW 1: CONVERSATIONAL AGENT CHAT */}
            {activeTab === "chat" && (
              <div className="flex-1 flex flex-col h-[580px]" id="chat-tab-panel">
                <div className="bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-200/50 flex flex-wrap items-center justify-between text-xs mb-4 gap-2">
                  <div className="flex items-center space-x-1.5 font-semibold text-slate-600">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Active Plan Parameters:</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">{dietaryTier}</span>
                    <span className="bg-slate-200 text-slate-800 text-[10px] px-2 py-0.5 rounded-full font-bold">{results.tdee} Kcal TDEE</span>
                  </div>
                  <div className="text-slate-400 italic">Connected to Gemini-3.5-Flash (Server Proxy)</div>
                </div>

                {/* Messages scroll screen */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4 text-slate-800 scrollbar-thin max-h-[460px]">
                  <AnimatePresence initial={false}>
                    {messages.map((msg, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                          msg.role === "user" 
                            ? "bg-slate-800 text-white rounded-tr-sm font-medium" 
                            : "bg-slate-50 text-slate-800 border border-slate-200/50 rounded-tl-sm whitespace-pre-line"
                        }`}>
                          {msg.role === "assistant" ? (
                            <div className="prose prose-slate max-w-none text-slate-800">
                              {renderMessageContent(msg.content).map((part, pIdx) => {
                                if (part.type === "DietCard") {
                                  return (
                                    <DietCardComponent 
                                      key={pIdx}
                                      title={part.attrs.title || "Diet Recommendation"}
                                      calories={part.attrs.calories || "N/A"}
                                      protein={part.attrs.protein || "N/A"}
                                      carbs={part.attrs.carbs || "N/A"}
                                      fat={part.attrs.fat || "N/A"}
                                      color={part.attrs.color || "emerald"}
                                      body={part.body}
                                    />
                                  );
                                } else if (part.type === "BiomarkerRepletion") {
                                  return (
                                    <BiomarkerRepletionComponent 
                                      key={pIdx}
                                      title={part.attrs.title || "Repletion Target"}
                                      level={part.attrs.level || "Deficient"}
                                      color={part.attrs.color || "rose"}
                                      body={part.body}
                                    />
                                  );
                                } else {
                                  // Render standard content split by lines
                                  return (
                                    <div key={pIdx} className="space-y-1">
                                      {part.content.split("\n").map((line, lIdx) => {
                                        if (line.trim().startsWith("👨‍⚕️") || line.trim().startsWith("**👨‍⚕️") || line.trim().includes("Disclaimer:")) {
                                          return (
                                            <div key={lIdx} className="bg-red-50/50 border border-red-100/50 p-3 rounded-xl text-xs leading-normal font-medium text-slate-700 my-2">
                                              {line}
                                            </div>
                                          );
                                        }
                                        return <p key={lIdx} className="mb-1 leading-snug">{line}</p>;
                                      })}
                                    </div>
                                  );
                                }
                              })}
                            </div>
                          ) : (
                            msg.content
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {isSending && (
                    <div className="flex justify-start">
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center space-x-3 text-slate-500 text-xs">
                        <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                        <span>GharKaNutri Agent is solving math ratios and checking compliance tables...</span>
                      </div>
                    </div>
                  )}

                  <div ref={chatScrollRef} />
                </div>

                {/* Input field */}
                <form onSubmit={handleSendMessage} className="flex space-x-2 mt-auto">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={`Ask AI Nutritionist... e.g. "Draft an evening snack for my ${results.tdee} Kcal profile"`}
                    disabled={isSending}
                    className="flex-1 bg-slate-50 hover:bg-slate-50/50 border border-slate-200 focus:outline-none focus:border-emerald-600 rounded-xl px-4 py-3 text-sm font-medium text-slate-800"
                  />
                  <button
                    type="submit"
                    disabled={isSending || !inputMessage.trim()}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white p-3 rounded-xl transition shadow-sm"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            )}


            {/* VIEW 2: DETERMINISTIC SHIELDED CALCULATIONS & LAB REPORTS */}
            {activeTab === "math" && (
              <div className="space-y-6" id="math-tab-panel">
                
                {/* Calculations summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* BMR Card */}
                  <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-white shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-100 uppercase tracking-widest block">Basal Metabolic Rate</span>
                      <h3 className="text-3xl font-extrabold mt-1">{results.bmr} <span className="text-xs font-bold text-emerald-100">kcal/day</span></h3>
                    </div>
                    <p className="text-[10px] text-emerald-100 mt-4 font-medium leading-normal">
                      Metabolic cost expended completely at rest. Computed strictly using Mifflin-St Jeor.
                    </p>
                  </div>

                  {/* TDEE Card */}
                  <div className="bg-slate-800 text-white rounded-xl p-5 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Daily Maintenance TDEE</span>
                      <h3 className="text-3xl font-extrabold mt-1">{results.tdee} <span className="text-xs font-bold text-slate-400">kcal/day</span></h3>
                    </div>
                    <p className="text-[10px] text-slate-300 mt-4 font-medium leading-normal">
                      Energy intake required directly commensurate to daily activity coefficient ({activityLevel}).
                    </p>
                  </div>

                  {/* deficit/surplus ratios */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Target Deficit (-500)</span>
                      <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{results.deficitTarget} <span className="text-xs font-bold text-slate-400">kcal/day</span></h3>
                    </div>
                    <div className="border-t border-slate-100/80 pt-2.5 mt-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Surplus Target (+300)</span>
                      <h4 className="text-md font-bold text-slate-700">{results.surplusTarget} kcal/day</h4>
                    </div>
                  </div>

                </div>

                {/* Formulations & Reasoning Cards */}
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/50 space-y-4">
                  <div className="flex items-center space-x-2">
                    <Flame className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-bold text-slate-900 text-sm">Clinical Calculation Reasoning</h3>
                  </div>
                  
                  <div className="text-xs space-y-3 leading-normal font-medium text-slate-600">
                    <p>
                      All math values shown are computed natively in deterministic javascript. No model hallucination is allowed to interfere with these variables.
                    </p>
                    <div className="bg-white p-4 border border-slate-200 rounded-xl font-mono text-[11px] leading-relaxed relative">
                      <div className="absolute right-3 top-3 text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-400 font-sans font-bold">LaTeX Notation System</div>
                      <div className="font-bold mb-1.5 text-slate-950">Mifflin-St Jeor Equations:</div>
                      {gender === Gender.MALE ? (
                        <>
                          <div className="text-emerald-700 bg-emerald-50/50 p-2 rounded mb-2 font-mono">
                            BMR = (10 × W) + (6.25 × H) - (5 × A) + 5
                          </div>
                          <div>Value breakdown: (10 × {weight}kg) + (6.25 × {height}cm) - (5 × {age}yrs) + 5 = <strong className="text-slate-950">{results.bmr} Kcal</strong></div>
                        </>
                      ) : (
                        <>
                          <div className="text-emerald-700 bg-emerald-50/50 p-2 rounded mb-2 font-mono">
                            BMR = (10 × W) + (6.25 × H) - (5 × A) - 161
                          </div>
                          <div>Value breakdown: (10 × {weight}kg) + (6.25 × {height}cm) - (5 × {age}yrs) - 161 = <strong className="text-slate-950">{results.bmr} Kcal</strong></div>
                        </>
                      )}
                      <div className="mt-2 pt-2 border-t border-slate-100">
                        TDEE = BMR × Activity Coefficient (factor multipliers: Sedentary=1.2, Light=1.375, Moderate=1.55, Active=1.725, Heavy=1.9)<br />
                        TDEE = {results.bmr} × Factor = <strong className="text-slate-900">{results.tdee} Kcal/day</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SVG Visual Macro Distribution Graph */}
                <div className="bg-white border border-slate-200/80 rounded-xl p-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Responsive Macronutrient Targets (g / day)</h4>
                  
                  <div className="flex flex-col lg:flex-row items-center justify-around gap-6">
                    {/* Visual Pie Gauge */}
                    <div className="relative w-44 h-44 shrink-0">
                      <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                        {/* Carbs Arc (50%) - color amber */}
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="10" strokeDasharray="251.2" strokeDashoffset="62.8" />
                        {/* Protein Arc (25%) - color emerald */}
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="10" strokeDasharray="251.2" strokeDashoffset="188.4" />
                        {/* Fats Arc (25%) - color blue */}
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3b82f6" strokeWidth="10" strokeDasharray="251.2" strokeDashoffset="125.6" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xs font-bold text-slate-400">Total Weight Balance</span>
                        <span className="text-lg font-black text-slate-900">{results.proteinRange.min + results.carbRange.min + results.fatRange.min}g</span>
                      </div>
                    </div>

                    {/* Numeric Bar chart */}
                    <div className="w-full max-w-sm space-y-4">
                      {/* Carbs bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-amber-600 flex items-center"><span className="w-2.5 h-2.5 bg-amber-500 rounded-full mr-2 block"></span>Carbohydrates (45-60%)</span>
                          <span>{results.carbRange.min}g - {results.carbRange.max}g / day</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: "55%" }}></div>
                        </div>
                      </div>

                      {/* Protein bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-emerald-700 flex items-center"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full mr-2 block"></span>Protein (Target)</span>
                          <span>{results.proteinRange.min}g - {results.proteinRange.max}g / day</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: "25%" }}></div>
                        </div>
                        <p className="text-[10px] text-slate-400 italic">Adjusted deterministically relative to bodyweight & physical coefficient.</p>
                      </div>

                      {/* Fats bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-blue-600 flex items-center"><span className="w-2.5 h-2.5 bg-blue-500 rounded-full mr-2 block"></span>Fats (20-35%)</span>
                          <span>{results.fatRange.min}g - {results.fatRange.max}g / day</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: "20%" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lab parameters breakdown review */}
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">🩺 Active Labs Biomarkers Evaluation</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { report: d3Rep, name: LAB_METRICS_INFO.vitamin_d3.name, val: d3Num, unit: LAB_METRICS_INFO.vitamin_d3.unit },
                      { report: b12Rep, name: LAB_METRICS_INFO.vitamin_b12.name, val: b12Num, unit: LAB_METRICS_INFO.vitamin_b12.unit },
                      { report: hbRep, name: LAB_METRICS_INFO.hemoglobin.name, val: hemoglobinNum, unit: LAB_METRICS_INFO.hemoglobin.unit },
                      { report: calRep, name: LAB_METRICS_INFO.calcium.name, val: calciumNum, unit: LAB_METRICS_INFO.calcium.unit }
                    ].map((item, idx) => (
                      <div key={idx} className={`bg-slate-50 p-4 border rounded-xl shadow-sm hover:border-slate-300 transition ${item.report.isLow ? 'border-l-4 border-l-red-500' : 'border-slate-100'}`}>
                        <div className="flex justify-between mb-2">
                          <h4 className="font-bold text-xs text-slate-800">{item.name}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.report.isLow ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'}`}>
                            {item.report.status}
                          </span>
                        </div>

                        <div className="text-xs mb-3">
                          Value: <strong className="text-slate-900">{item.val} {item.unit}</strong>
                          <span className="text-slate-400 italic block mt-0.5">Reference limits: {item.report.currentValue > item.report.currentValue ? "" : "Normal range" }</span>
                        </div>

                        {item.report.isLow ? (
                          <div className="space-y-2 mt-2 pt-2 border-t border-slate-200/50">
                            <p className="text-[10px] text-slate-700 leading-normal bg-white p-2 rounded border border-slate-100">
                              <span className="font-bold block text-red-600 mb-0.5">💊 Repletion Guidance:</span>
                              {item.report.recommendation}
                            </p>
                            <p className="text-[10px] text-emerald-800 leading-normal">
                              <span className="font-bold block text-emerald-600">🥦 Dietary Grounding Booster:</span>
                              {item.report.dietaryAdjustment}
                            </p>
                          </div>
                        ) : (
                          <p className="text-[10px] text-emerald-600 leading-normal pt-2 border-t border-slate-200/50">
                            ✓ Satisfies target reference standards. No extra supplementation of this nutrient is recommended.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Safety Alert block */}
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4.5 text-xs font-semibold text-slate-600 flex items-start space-x-3">
                    <ShieldAlert className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-red-800 block mb-1">🏥 Mandatory Clinical Security Protocol:</span>
                      All repletion schedules displayed are derived relative to physiological references and UL targets. NEVER exceed the Tolerable Upper Limits chronic standard. Always obtain professional medical practitioner diagnostics prior to major changes or initiation of heavy supplements.
                    </div>
                  </div>

                  {/* DYNAMIC THERAPEUTIC DIET GUIDE (What to Have & Avoid) */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center space-x-2">
                        <Heart className="w-5 h-5 text-rose-500 animate-pulse" />
                        <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">Therapeutic Diet Directives (What to Have & Avoid)</h3>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">Deterministic Evidence</span>
                    </div>

                    {chronicConditions.length === 0 && customBiomarkers.length === 0 ? (
                      <div className="py-6 text-center text-slate-400 text-xs font-semibold">
                        <p>No chronic conditions selected in the sidebar yet.</p>
                        <p className="font-medium text-[10.5px] text-slate-400/80 mt-1">Select Diabetes, Hypertension, CKD, or Thyroid to load deterministic Dietary Do's & Don'ts maps.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Chronic conditions details */}
                        {chronicConditions.map((cond) => {
                          const standardGuy = CHRONIC_DISEASE_DIETARY_GUIDELINES[cond];
                          return (
                            <div key={cond} className="bg-slate-50/50 p-4 rounded-xl border border-slate-150 space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-black text-rose-800 uppercase flex items-center space-x-1">
                                  <span className="w-2.5 h-2.5 bg-rose-500 rounded-full"></span>
                                  <span>Condition focus: {standardGuy?.name || cond}</span>
                                </h4>
                                <button
                                  type="button"
                                  onClick={() => setChronicConditions(chronicConditions.filter(c => c !== cond))}
                                  className="text-[9px] font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-200/40 px-1.5 py-0.5 rounded transition uppercase border border-slate-200/50 cursor-pointer"
                                >
                                  Clear filter
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* WHAT TO HAVE (GREEN) */}
                                <div className="bg-emerald-50/40 border border-emerald-100 rounded-lg p-3">
                                  <h5 className="text-[10.5px] font-extrabold text-emerald-800 uppercase mb-2 flex items-center space-x-1.5">
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                                    <span>🟢 WHAT TO HAVE</span>
                                  </h5>
                                  <ul className="space-y-1.5 text-[10.5px] text-slate-700 font-medium leading-relaxed">
                                    {standardGuy ? standardGuy.dos.map((d, dIdx) => (
                                      <li key={dIdx} className="flex items-start">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1.5 mt-0.5 shrink-0" />
                                        <span>{d}</span>
                                      </li>
                                    )) : (
                                      <li className="list-disc ml-4">Prioritize high-fiber complex carbohydrates from regional organic grains, sprouted legumes, and lots of hydration.</li>
                                    )}
                                  </ul>
                                </div>

                                {/* WHAT NOT TO HAVE (RED) */}
                                <div className="bg-rose-50/30 border border-rose-100 rounded-lg p-3">
                                  <h5 className="text-[10.5px] font-extrabold text-rose-800 uppercase mb-2 flex items-center space-x-1.5">
                                    <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
                                    <span>🔴 WHAT NOT TO HAVE</span>
                                  </h5>
                                  <ul className="space-y-1.5 text-[10.5px] text-slate-750 font-semibold leading-relaxed">
                                    {standardGuy ? standardGuy.donts.map((d, dIdx) => (
                                      <li key={dIdx} className="flex items-start text-slate-900 font-semibold">
                                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500 mr-1.5 mt-0.5 shrink-0" />
                                        <span>{d}</span>
                                      </li>
                                    )) : (
                                      <li className="list-disc ml-4">Avoid processed seed oils, refined flours, high fructose syrups, and heavy sodium products.</li>
                                    )}
                                  </ul>
                                </div>
                              </div>

                              {standardGuy?.scientificInsight && (
                                <p className="text-[10px] text-slate-500 font-mono italic leading-relaxed pt-2 border-t border-slate-100 bg-white/70 px-2 py-1.5 rounded border">
                                  🔬 <strong>Clinical Pathology Mechanism:</strong> {standardGuy.scientificInsight}
                                </p>
                              )}
                            </div>
                          );
                        })}

                        {/* Custom Extracted Biomarker advice if any */}
                        {customBiomarkers.map((m, mIdx) => {
                          const isHigh = m.status === "High";
                          const isLow = m.status === "Low";
                          if (!isHigh && !isLow) return null;
                          
                          return (
                            <div key={mIdx} className="bg-gradient-to-r from-amber-50/20 to-blue-50/10 p-4 rounded-xl border border-slate-200/60 shadow-xs space-y-2">
                              <h4 className="text-xs font-bold text-slate-900 flex items-center justify-between">
                                <span>Biomarker Focus: <strong className="text-amber-800 font-mono">{m.name}</strong> is clinically {m.status} ({m.value} {m.unit})</span>
                                <span className="bg-amber-100 text-amber-800 text-[8px] font-bold uppercase tracking-wider px-1.5 rounded-full">{m.conditionContext}</span>
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10.5px] font-medium leading-snug">
                                <div className="bg-emerald-50/20 p-2.5 rounded border border-emerald-100">
                                  <span className="font-extrabold text-emerald-800 block text-[9.5px] mb-1">🟢 SUGGESTED BOOSTERS:</span>
                                  {isHigh ? "Choose nutrient-dense, high-hydration alkaline foods to balance this marker. Sip high-potassium/mineral infusions to dilute serum content." : 
                                   "Directly increase dietary repletion carriers (e.g. whole grains, seeds, A2 dahi, organic leafy produce) to boost low cellular activity."}
                                </div>
                                <div className="bg-rose-50/10 p-2.5 rounded border border-rose-100">
                                  <span className="font-extrabold text-rose-800 block text-[9.5px] mb-1">🔴 CRITICAL AVOIDS:</span>
                                  {isHigh ? "Do NOT consume foods containing high-fats, processed trans oils, table salts, or concentrated fructose syrup that amplify diagnostic metric values." : 
                                   "Strictly avoid maida/gluten flours, carbonated fizzy foods that impair metabolic bio-absorption of primary vitamins/minerals."}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}


            {/* VIEW 3: COMPLIANT INDIGENOUS STAPLE DIRECTORY */}
            {activeTab === "foods" && (
              <div className="space-y-5" id="grounded-food-panel bg-slate-50">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-1.5 animate-pulse">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                      <span>Verified Grounded Local Foods Map — {dietaryTier} Dietary restriction</span>
                    </h3>
                    <p className="text-xs text-slate-400">Standard Indian ingredients strictly matching dietary filtration requirements</p>
                  </div>

                  <input 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search ingredients..."
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs text-slate-800 w-full sm:w-56 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {INDIAN_INGREDIENT_DATABASE
                    .filter(item => item.category.includes(dietaryTier) && 
                      (item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       item.localName.toLowerCase().includes(searchTerm.toLowerCase())))
                    .map((item, idx) => (
                      <div key={idx} className="bg-white border border-slate-200 hover:shadow-sm transition p-4 rounded-xl flex flex-col justify-between">
                        
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-extrabold text-xs text-slate-900 uppercase">
                              {item.localName} <span className="text-[10px] text-slate-400 lowercase italic">({item.name})</span>
                            </h4>
                            <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase">
                              {item.category.includes(DietaryTier.VEGAN) 
                                ? "Vegan" 
                                : item.category.includes(DietaryTier.VEGETARIAN) 
                                  ? "Vegetarian" 
                                  : "Non-Veg"}
                            </span>
                          </div>

                          <div className="grid grid-cols-5 text-center text-slate-500 font-bold font-mono text-[9px] gap-1 bg-slate-50 p-2 rounded-lg mb-2">
                            <div>
                              <span className="text-slate-400 block uppercase font-sans text-[7px]">Cal/100g</span>
                              <span className="text-slate-900 font-extrabold">{item.macrosPer100g.calories}</span>
                            </div>
                            <div>
                              <span className="text-emerald-600 block uppercase font-sans text-[7px]">Protein</span>
                              <span className="text-emerald-700 font-extrabold">{item.macrosPer100g.protein}g</span>
                            </div>
                            <div>
                              <span className="text-amber-600 block uppercase font-sans text-[7px]">Carb</span>
                              <span className="text-amber-700 font-extrabold">{item.macrosPer100g.carbs}g</span>
                            </div>
                            <div>
                              <span className="text-blue-600 block uppercase font-sans text-[7px]">Fat</span>
                              <span className="text-blue-700 font-extrabold">{item.macrosPer100g.fat}g</span>
                            </div>
                            <div>
                              <span className="text-teal-600 block uppercase font-sans text-[7px]">Fiber</span>
                              <span className="text-teal-700 font-extrabold">{item.macrosPer100g.fiber}g</span>
                            </div>
                          </div>

                          <p className="text-[10px] text-slate-600 leading-normal mb-3">
                            <span className="font-semibold text-slate-800">Dominant Biomarker Boosters:</span> {item.dominantMicros.join(", ")}
                          </p>
                        </div>

                        <p className="text-[10px] text-slate-400 italic bg-slate-50 p-2 rounded border border-slate-100/50 leading-relaxed">
                          ⚡ <span className="font-semibold text-slate-600">Dietic Note:</span> {item.notes}
                        </p>

                      </div>
                    ))
                  }
                </div>

              </div>
            )}

          </div>

        </main>

      </div>

      <footer className="bg-slate-900 text-slate-500 text-center py-6 border-t border-slate-800 mt-auto text-xs" id="footer">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="text-slate-400 font-semibold">GharKaNutri Clinical Decision Support Hub</p>
          <p className="text-[10px] leading-relaxed">
            *Clinical Disclaimer: The values calculated by our deterministic engines representing nutritional evaluations do not replace dynamic lab tests or dedicated diagnosis by a medical practitioner (MD/Dietitian). Information should always be checked prior to initiation.*
          </p>
        </div>
      </footer>

    </div>
  );
}
