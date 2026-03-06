import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import { DEMO_DATASET } from "@/data/demo_dataset";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

// UPDATED: Injected Real Examples from local 'dataset/spam_texts.csv'
const FEW_SHOT_EXAMPLES = `
REFERENCE FRAUD DATABASE (LOCAL DATASET PATTERNS):
1. [DATASET_BANK_01]: "Dear Customer, Your SBI Bank Account has been blocked by 5:00 PM. Please update your PAN card immediately: http://bit.ly/sbikyc" -> Risk: CRITICAL. Signals: Urgency (5:00 PM), Account Blocked, Short Link.
2. [DATASET_LOTTERY_02]: "Congratulation! Your number has won 25,00,000 in KBC Lottery. Call Rana Pratap Singh 9876543210" -> Risk: HIGH. Signals: Lottery, Large Amount, Personal Name for Authority.
3. [DATASET_JOB_03]: "Part time job! Earn Rs 5000-10000 daily working from home. No investment. Contact WhatsApp: wa.me/9199xxxxxx" -> Risk: HIGH. Signals: Unrealistic Earnings, WhatsApp Redirection, No Investment trap.
4. [DATASET_ELECTRICITY_04]: "Dear User, your electricity power will be disconnected tonight at 9:30 PM because your previous month bill was not updated. Call 890xxxx" -> Risk: CRITICAL. Signals: Utility Disconnection, Tonight Deadline, Personal Number.
5. [DATASET_LOAN_05]: "Pre-approved Personal Loan of Rs 5 Lakhs credited to your wallet. Click to claim: http://loan-bazaar.xyz" -> Risk: MEDIUM/HIGH. Signals: Pre-approved, Wallet Credit, Suspicious Domain.
`;

export interface AnalysisResponse {
  input_id?: string;
  is_fraud: boolean;
  risk_score: number;
  risk_level: "Safe" | "Suspicious" | "High" | "Gray" | "Critical";
  message_type:
    | "Friendly Message"
    | "Safe Link"
    | "Suspicious Link"
    | "Spam/Marketing"
    | "Job Scam"
    | "Phishing"
    | "Financial Fraud"
    | "Blackmail/Extortion"
    | "Tech Support Scam"
    | "UPI Fraud"
    | "Impersonation"
    | "Suspicious";
  fraud_type: string[];
  why_fraud: string[];
  risky_phrases: string[];
  detected_signals: {
    urgency: boolean;
    financial_lure: boolean;
    impersonation: boolean;
    credential_theft: boolean;
    suspicious_url: boolean;
    ai_generated_tone: boolean;
    spelling_grammar_issues: boolean;
    social_engineering: boolean;
    crypto_investment_pitch: boolean;
    threat_extortion: boolean;
    job_scam: boolean;
    spam_marketing: boolean;
    regional_upi_fraud: boolean;
    tech_support_refund: boolean;
  };
  link_analysis: {
    domain: string;
    shortened: boolean;
    brand_spoofing: boolean;
    google_presence: "High" | "Medium" | "Low" | "Not Found";
  };
  similar_case_match?: {
    id: string;
    similarity_score: number;
    description: string;
  };
  text_error_analysis?: {
    typos: string[];
    grammar_issues: string[];
    score: number;
  };
  bank_verification?: {
    detected_bank: string | null;
    is_official_domain: boolean;
    risk_reason: string | null;
  };
  counterfactual_safe_conditions: string[];
  campaign_detected: boolean;
  recommended_action: string[];
  model_self_check: {
    possible_misclassification_reason: string;
    confidence_calibration: "High" | "Medium" | "Low";
  };
  confidence: number;
  explanation: string;
  signals: string[];
  tone: "Normal" | "Urgent" | "Manipulative" | "AI-Like";
  author_prediction: "AI Generated" | "Human Typed" | "Unknown";
  api_signals?: Array<{
    api: string;
    icon: string;
    verdict: string;
    score: number;
    flagged: boolean;
    detail: string;
  }>;
}

async function resizeImageForFastOCR(
  file: File,
  maxDimension: number = 1400,
  quality: number = 0.75,
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(
    1,
    maxDimension / Math.max(bitmap.width, bitmap.height),
  );
  const targetWidth = Math.max(1, Math.round(bitmap.width * scale));
  const targetHeight = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Could not initialize image processing canvas.");
  }

  ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", quality);
  });

  if (!blob) {
    throw new Error("Could not process screenshot for OCR.");
  }

  return blob;
}

async function fileBlobToBase64(blob: Blob): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read processed image."));
    reader.readAsDataURL(blob);
  });

  const base64 = dataUrl.split(",")[1];
  if (!base64) {
    throw new Error("Invalid screenshot data.");
  }
  return base64;
}

export async function extractTextFromScreenshot(file: File): Promise<string> {
  if (!file || !file.type.startsWith("image/")) {
    throw new Error("Please upload an image screenshot.");
  }
  if (!API_KEY) {
    throw new Error(
      "Gemini API key is missing. Set NEXT_PUBLIC_GEMINI_API_KEY.",
    );
  }

  const compressed = await resizeImageForFastOCR(file);
  const base64Data = await fileBlobToBase64(compressed);

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt =
    "Extract all readable text from this screenshot. Return only plain extracted text with line breaks. No explanation.";

  const parts: Part[] = [
    { text: prompt },
    {
      inlineData: {
        mimeType: "image/jpeg",
        data: base64Data,
      },
    },
  ];

  const result = await model.generateContent(parts);
  const response = await result.response;
  const extracted = response
    .text()
    .replace(/```[\s\S]*?```/g, (match) =>
      match.replace(/```(?:text|plaintext)?/g, "").replace(/```/g, ""),
    )
    .trim();

  if (!extracted) {
    throw new Error("No readable text found in screenshot.");
  }

  return extracted;
}

// Link verification function
function verifyLink(url: string): {
  reputation: "Safe" | "Suspicious" | "Dangerous";
  reason: string;
} {
  try {
    const domain = url
      .replace(/https?:\/\//, "")
      .split("/")[0]
      .toLowerCase();

    // Dangerous indicators
    const dangerousPatterns = [
      /bit\.ly|tinyurl|shorturl|goo\.gl|short\.link|ow\.ly|tiny\.cc|url\.short|is\.gd/i,
      /-secure|-verify|-update|-login|-confirm|-auth|-account/i,
      /\.xyz|\.tk|\.ml|\.ga|\.cf|\.top|\.space|\.online|\.store|\.club/i,
    ];

    // Check for dangerous patterns
    for (const pattern of dangerousPatterns) {
      if (pattern.test(url)) {
        return {
          reputation: "Dangerous",
          reason: "Shortened or suspicious domain",
        };
      }
    }

    // Suspicious but not immediately dangerous
    if (
      domain.includes("secure") ||
      domain.includes("verify") ||
      domain.includes("confirm")
    ) {
      return {
        reputation: "Suspicious",
        reason: "Mimics official domain structure",
      };
    }

    // Safe domains - major companies and services
    const safeDomains = [
      "google.com",
      "amazon.com",
      "facebook.com",
      "twitter.com",
      "linkedin.com",
      "sbi.co.in",
      "hdfc.com",
      "icici.com",
      "axis.com",
      "live.com",
      "gmail.com",
      "github.com",
      "stackoverflow.com",
      "medium.com",
      "youtube.com",
      "reddit.com",
      "wikipedia.org",
      "whatsapp.com",
      "telegram.org",
      "discord.com",
      "slack.com",
    ];

    if (safeDomains.some((safe) => domain.includes(safe))) {
      return { reputation: "Safe", reason: "Verified legitimate domain" };
    }

    // Default to suspicious if unknown
    return { reputation: "Suspicious", reason: "Unknown or unverified domain" };
  } catch {
    return { reputation: "Suspicious", reason: "Unable to parse URL" };
  }
}

// Enhanced grammar score calculation
function calculateGrammarScore(
  text: string,
  errors: { typos: number; grammar: number; gibberish: number },
): number {
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const textLength = words.length;

  // If text is very short (1-3 words), be more lenient
  if (textLength <= 3) {
    if (errors.gibberish > 0) return 50;
    if (errors.typos + errors.grammar === 0) return 100;
    return 85;
  }

  // Weight different error types
  const errorScore =
    errors.typos * 2 + // Text speak (minor): "plz", "ur", etc.
    errors.grammar * 4 + // Grammar issues (moderate): excessive punctuation, CAPS
    errors.gibberish * 12; // Gibberish (severe): unreadable words

  // Normalize by text length (longer texts get more tolerance)
  const errorRatio = errorScore / Math.max(5, textLength);

  // Calculate score: start at 100, subtract based on errors
  // Formula: 100 - (errorRatio * 12)
  // More forgiving for clean text, stricter for gibberish
  let score = 100 - errorRatio * 12;

  // Floor at 20 for completely broken text
  score = Math.max(20, score);

  // Boost score for clean professional text (no errors)
  if (errors.typos === 0 && errors.grammar === 0 && errors.gibberish === 0) {
    score = 100;
  }
  // Small penalty for minor typos in otherwise clean text
  else if (
    errors.typos <= 2 &&
    errors.grammar === 0 &&
    errors.gibberish === 0
  ) {
    score = Math.max(85, score);
  }
  // Heavy penalty for gibberish
  else if (errors.gibberish >= 3) {
    score = Math.min(40, score);
  }

  return Math.round(score);
}

// Improved risk score calculation with better weighting
function calculateRiskScore(
  signals: any,
  textLength: number,
  fraudTypes: string[],
): number {
  const weights = {
    urgency: 15, // Medium: creates panic
    financial_lure: 20, // High: immediate incentive
    impersonation: 35, // Critical: trusted entity spoofing
    credential_theft: 30, // Critical: direct account access
    suspicious_url: 25, // High: hidden destination
    ai_generated_tone: 12, // Low: could be legitimate
    spelling_grammar_issues: 8, // Low: quality indicator
    social_engineering: 18, // Medium: manipulation
    threat_extortion: 40, // Critical: threats
    job_scam: 22, // High: money/effort
    crypto_investment_pitch: 28, // High: financial loss
    romance_scam: 25, // High: emotional manipulation
    tech_support_refund: 20, // Medium: impersonation
    regional_upi_fraud: 30, // Critical: money theft
    spam_marketing: 5, // Very Low: mostly harmless
  };

  let baseScore = 0;
  let detectedSignalCount = 0;

  for (const [signal, detected] of Object.entries(signals)) {
    if (detected && weights[signal as keyof typeof weights]) {
      baseScore += weights[signal as keyof typeof weights];
      detectedSignalCount++;
    }
  }

  // Normalize by text length - shorter texts are more suspic ious
  const lengthFactor = Math.max(0.6, Math.min(1.2, textLength / 50));
  baseScore = baseScore / lengthFactor;

  // Signal combination multiplier (more signals = compound risk)
  let multiplier = 1;
  if (detectedSignalCount >= 4)
    multiplier = 1.4; // Multiple attack vectors
  else if (detectedSignalCount >= 3) multiplier = 1.2;
  else if (detectedSignalCount >= 2) multiplier = 1.1;

  baseScore = baseScore * multiplier;

  // Cap at 100
  return Math.min(100, Math.round(baseScore));
}

function clampScore(value: number, min: number = 0, max: number = 100): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function mergeAnalyses(
  aiAnalysis: AnalysisResponse,
  heuristicAnalysis: AnalysisResponse,
): AnalysisResponse {
  const aiRisk = clampScore(aiAnalysis.risk_score);
  const heuristicRisk = clampScore(heuristicAnalysis.risk_score);
  const riskGap = Math.abs(aiRisk - heuristicRisk);

  let mergedRisk = Math.max(aiRisk, heuristicRisk);
  if (riskGap <= 20) {
    mergedRisk = clampScore((aiRisk + heuristicRisk) / 2);
  }

  let mergedRiskLevel: AnalysisResponse["risk_level"] = "Safe";
  if (mergedRisk >= 75) mergedRiskLevel = "Critical";
  else if (mergedRisk >= 55) mergedRiskLevel = "High";
  else if (mergedRisk >= 35) mergedRiskLevel = "Suspicious";

  const mergedSignals = {
    urgency:
      aiAnalysis.detected_signals.urgency ||
      heuristicAnalysis.detected_signals.urgency,
    financial_lure:
      aiAnalysis.detected_signals.financial_lure ||
      heuristicAnalysis.detected_signals.financial_lure,
    impersonation:
      aiAnalysis.detected_signals.impersonation ||
      heuristicAnalysis.detected_signals.impersonation,
    credential_theft:
      aiAnalysis.detected_signals.credential_theft ||
      heuristicAnalysis.detected_signals.credential_theft,
    suspicious_url:
      aiAnalysis.detected_signals.suspicious_url ||
      heuristicAnalysis.detected_signals.suspicious_url,
    ai_generated_tone:
      aiAnalysis.detected_signals.ai_generated_tone ||
      heuristicAnalysis.detected_signals.ai_generated_tone,
    spelling_grammar_issues:
      aiAnalysis.detected_signals.spelling_grammar_issues ||
      heuristicAnalysis.detected_signals.spelling_grammar_issues,
    social_engineering:
      aiAnalysis.detected_signals.social_engineering ||
      heuristicAnalysis.detected_signals.social_engineering,
    crypto_investment_pitch:
      aiAnalysis.detected_signals.crypto_investment_pitch ||
      heuristicAnalysis.detected_signals.crypto_investment_pitch,
    threat_extortion:
      aiAnalysis.detected_signals.threat_extortion ||
      heuristicAnalysis.detected_signals.threat_extortion,
    job_scam:
      aiAnalysis.detected_signals.job_scam ||
      heuristicAnalysis.detected_signals.job_scam,
    spam_marketing:
      aiAnalysis.detected_signals.spam_marketing ||
      heuristicAnalysis.detected_signals.spam_marketing,
    regional_upi_fraud:
      aiAnalysis.detected_signals.regional_upi_fraud ||
      heuristicAnalysis.detected_signals.regional_upi_fraud,
    tech_support_refund:
      aiAnalysis.detected_signals.tech_support_refund ||
      heuristicAnalysis.detected_signals.tech_support_refund,
  };

  const mergedFraudTypes = Array.from(
    new Set([...aiAnalysis.fraud_type, ...heuristicAnalysis.fraud_type]),
  ).filter(Boolean);

  const mergedWhyFraud = Array.from(
    new Set([...aiAnalysis.why_fraud, ...heuristicAnalysis.why_fraud]),
  ).filter(Boolean);

  const mergedRiskyPhrases = Array.from(
    new Set([...aiAnalysis.risky_phrases, ...heuristicAnalysis.risky_phrases]),
  ).filter(Boolean);

  const aiGrammar = aiAnalysis.text_error_analysis?.score ?? 100;
  const heuristicGrammar = heuristicAnalysis.text_error_analysis?.score ?? 100;

  // Determine merged message type based on merged signals
  let mergedMessageType: AnalysisResponse["message_type"] = "Friendly Message";
  const isMergedFraud = mergedRisk >= 35;

  // Use heuristic's message type as base (it has URL detection logic)
  if (
    heuristicAnalysis.message_type === "Safe Link" ||
    heuristicAnalysis.message_type === "Suspicious Link"
  ) {
    mergedMessageType = heuristicAnalysis.message_type;
  } else if (isMergedFraud) {
    if (mergedSignals.threat_extortion) {
      mergedMessageType = "Blackmail/Extortion";
    } else if (mergedSignals.regional_upi_fraud) {
      mergedMessageType = "UPI Fraud";
    } else if (mergedSignals.credential_theft || mergedSignals.impersonation) {
      mergedMessageType = "Phishing";
    } else if (mergedSignals.job_scam) {
      mergedMessageType = "Job Scam";
    } else if (mergedSignals.tech_support_refund) {
      mergedMessageType = "Tech Support Scam";
    } else if (
      mergedSignals.crypto_investment_pitch ||
      mergedSignals.financial_lure
    ) {
      mergedMessageType = "Financial Fraud";
    } else if (mergedSignals.spam_marketing) {
      mergedMessageType = "Spam/Marketing";
    } else if (mergedSignals.suspicious_url) {
      mergedMessageType = "Suspicious Link";
    } else if (mergedSignals.impersonation) {
      mergedMessageType = "Impersonation";
    } else {
      mergedMessageType = "Suspicious";
    }
  } else if (mergedRisk < 20) {
    mergedMessageType = "Friendly Message";
  } else {
    mergedMessageType = "Suspicious";
  }

  return {
    ...heuristicAnalysis,
    is_fraud: isMergedFraud,
    risk_score: mergedRisk,
    risk_level: mergedRiskLevel,
    message_type: mergedMessageType,
    fraud_type: mergedFraudTypes.length > 0 ? mergedFraudTypes : ["None"],
    why_fraud:
      mergedWhyFraud.length > 0
        ? mergedWhyFraud
        : ["No significant fraud indicators"],
    risky_phrases: mergedRiskyPhrases,
    detected_signals: mergedSignals,
    text_error_analysis: {
      typos: heuristicAnalysis.text_error_analysis?.typos?.length
        ? heuristicAnalysis.text_error_analysis.typos
        : aiAnalysis.text_error_analysis?.typos || [],
      grammar_issues: heuristicAnalysis.text_error_analysis?.grammar_issues
        ?.length
        ? heuristicAnalysis.text_error_analysis.grammar_issues
        : aiAnalysis.text_error_analysis?.grammar_issues || [],
      score: Math.min(aiGrammar, heuristicGrammar),
    },
    explanation:
      mergedRisk >= 35
        ? `High-confidence fraud analysis (score ${mergedRisk}/100). ${mergedWhyFraud.slice(0, 3).join(". ")}`
        : heuristicAnalysis.explanation,
    confidence: Math.max(
      aiAnalysis.confidence || 0,
      heuristicAnalysis.confidence || 0,
    ),
  };
}

export async function analyzeContent(
  text: string,
  useMock: boolean = false,
): Promise<AnalysisResponse> {
  const heuristicAnalysis = analyzeContentHeuristic(text);
  if (useMock || !API_KEY) {
    return heuristicAnalysis;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an expert AI Fraud Intelligence Analyst focusing ONLY on TEXT scams.
      Analyze the text content for fraud patterns using the Local Reference Database.

      ${FEW_SHOT_EXAMPLES}
      
      INPUT TEXT: "${text || "No text provided."}"
      
      TASK Checklist:
      You MUST analyze the text for these 15 core scam signals:
      1. urgency (Pressure tactics, "act now")
      2. financial_lure (Lotteries, free money)
      3. impersonation (Pretending to be bank/authority)
      4. credential_theft (Asking for OTP/passwords)
      5. suspicious_url (Shady or shortened links)
      6. ai_generated_tone (Overly formal or robotic)
      7. spelling_grammar_issues (Intentional typos to bypass filters)
      8. social_engineering (Guilt trips, "I need help")
      9. crypto_investment_pitch (Guaranteed ROI, BTC)
      10. threat_extortion (Blackmail, data leaks)
      11. job_scam (Fake employment, upfront payment)
      12. spam_marketing (Unsolicited bulk marketing)
      13. regional_upi_fraud (Localized UPI or CashApp fraud)
      14. romance_scam (Fabricated relationships for exploitation)
      15. tech_support_refund (Fake tech support, overpayment refund)

      RETURN VALID JSON:
      {
        "is_fraud": boolean,
        "risk_score": number (0-100),
        "risk_level": "Safe" | "Suspicious" | "High" | "Gray" | "Critical",
        "fraud_type": ["Phishing", "Identity Theft", "Social Engineering", "Extortion", "None"],
        "why_fraud": ["Reason 1"],
        "risky_phrases": ["substring 1"],
        "detected_signals": {
            "urgency": boolean,
            "financial_lure": boolean,
            "impersonation": boolean,
            "credential_theft": boolean,
            "suspicious_url": boolean,
            "ai_generated_tone": boolean,
            "spelling_grammar_issues": boolean,
            "social_engineering": boolean,
            "crypto_investment_pitch": boolean,
            "threat_extortion": boolean,
            "job_scam": boolean,
            "spam_marketing": boolean,
            "regional_upi_fraud": boolean,
            "romance_scam": boolean,
            "tech_support_refund": boolean
        },
        "link_analysis": {
            "domain": "string",
            "shortened": boolean,
            "brand_spoofing": boolean,
            "google_presence": "High" | "Medium" | "Low" | "Not Found"
        },
        "similar_case_match": {
            "id": "PATTERN_ID_OR_NONE",
            "similarity_score": number, 
            "description": "reason"
        },
        "text_error_analysis": {
            "typos": ["list"],
            "grammar_issues": ["list"],
            "score": number
        },
        "bank_verification": {
            "detected_bank": "Name/null",
            "is_official_domain": boolean,
            "risk_reason": "string"
        },
        "counterfactual_safe_conditions": ["If X"],
        "campaign_detected": boolean,
        "recommended_action": ["Action"],
        "model_self_check": {
            "possible_misclassification_reason": "Reason",
            "confidence_calibration": "High"
        },
        "confidence": number,
        "explanation": "Summary",
        "signals": ["List"],
        "tone": "Normal" | "Urgent" | "Manipulative",
        "author_prediction": "AI Generated" | "Human Typed" | "Unknown"
      }
    `;

    const parts: Part[] = [{ text: prompt }];
    const result = await model.generateContent(parts);
    const response = await result.response;
    const textOutput = response.text();
    const cleanedJson = textOutput
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const aiAnalysis = JSON.parse(cleanedJson) as AnalysisResponse;
    return mergeAnalyses(aiAnalysis, heuristicAnalysis);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return heuristicAnalysis;
  }
}

function analyzeContentHeuristic(text: string): AnalysisResponse {
  const lowerText = text.toLowerCase();
  const textLength = text.split(/\s+/).length;

  // Check for demo dataset match first
  const demoMatch = DEMO_DATASET.find(
    (d) =>
      d.text.toLowerCase().includes(lowerText) ||
      lowerText.includes(d.text.toLowerCase()) ||
      (lowerText.length > 20 &&
        d.text.toLowerCase().substring(0, 30) === lowerText.substring(0, 30)),
  );

  // Initialize risk score and signals
  const detectedSignals = {
    urgency: false,
    financial_lure: false,
    impersonation: false,
    credential_theft: false,
    suspicious_url: false,
    ai_generated_tone: false,
    spelling_grammar_issues: false,
    social_engineering: false,
    crypto_investment_pitch: false,
    threat_extortion: false,
    job_scam: false,
    spam_marketing: false,
    regional_upi_fraud: false,
    tech_support_refund: false,
  };
  const fraudTypes: string[] = [];
  const whyFraud: string[] = [];
  const riskyPhrases: string[] = [];
  const signals: string[] = [];
  let errorMetrics = { typos: 0, grammar: 0, gibberish: 0 };

  // 1. CHECK FOR FRIENDLY/CASUAL MESSAGES FIRST (to reduce false positives)
  const friendlyIndicators = [
    "thank you",
    "thanks",
    "thanks mate",
    "cheers",
    "appreciate",
    "can you",
    "could you",
    "please send",
    "can i get",
    "meeting",
    "lunch",
    "coffee",
    "catch up",
    "how are you",
    "notes",
    "homework",
    "help with",
    "study",
    "project",
    "hey",
    "hi",
    "wassup",
    "yo",
    "lol",
    "haha",
    "i'll",
    "i'll help",
    "no problem",
    "sure",
    "see you",
    "talk soon",
    "later",
    "take care",
  ];

  const casualPhrases = [
    "notes",
    "homework",
    "meeting",
    "lunch",
    "coffee",
    "help with",
    "can you help",
    "do you know",
    "anyone here",
    "quick question",
    "anyone can",
    "anyone have",
  ];

  const friendlyMatches = friendlyIndicators.filter((ind) => {
    // Use word boundary regex to match whole words only
    const regex = new RegExp(
      `\\b${ind.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      "i",
    );
    return regex.test(text);
  }).length;
  const casualMatches = casualPhrases.filter((cw) => {
    // Use word boundary regex to match whole words only
    const regex = new RegExp(
      `\\b${cw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      "i",
    );
    return regex.test(text);
  }).length;

  // If high friendly matches and low risk signals, likely safe
  let isFriendlyMessage = false;
  if (
    friendlyMatches >= 2 ||
    (casualMatches >= 1 &&
      !lowerText.includes("link") &&
      !lowerText.includes("click"))
  ) {
    isFriendlyMessage = true;
  }

  // 1. URGENCY DETECTION
  const urgencyKeywords = [
    "urgent",
    "immediately",
    "act now",
    "asap",
    "today",
    "tonight",
    "right now",
    "blocked",
    "suspended",
    "disabled",
    "limited time",
    "deadline",
    "expire",
    "expires",
    "ends today",
    "must",
    "critical",
    "emergency",
    "hurry",
  ];
  const urgencyMatches = urgencyKeywords.filter((kw) => lowerText.includes(kw));
  if (urgencyMatches.length > 0 && !isFriendlyMessage) {
    detectedSignals.urgency = true;
    whyFraud.push(
      `Urgency pressure: "${urgencyMatches.join('", "')}" - typical panic-inducing scam tactic`,
    );
    riskyPhrases.push(...urgencyMatches);
    signals.push("Urgency Pressure");
  }

  // 2. FINANCIAL/PRIZE KEYWORDS (Lottery, Winnings, etc.)
  const financialKeywords = [
    "prize",
    "won",
    "winner",
    "lottery",
    "congratulations",
    "reward",
    "cash",
    "money",
    "transfer",
    "claim",
    "lakh",
    "crore",
    "million",
    "free money",
    "bonus",
    "crypto",
    "bitcoin",
    "earn fast",
    "easy money",
    "earn",
    "rupees",
    "rs.",
    "salary",
    "payment",
    "earning",
    "income",
    "per month",
    "per day",
  ];
  const financialMatches = financialKeywords.filter((kw) =>
    lowerText.includes(kw),
  );
  if (financialMatches.length > 0 && !isFriendlyMessage) {
    detectedSignals.financial_lure = true;
    fraudTypes.push("Financial Scam");
    whyFraud.push(
      `Financial incentive: "${financialMatches.join('", "')}" - classic lottery/prize scam`,
    );
    riskyPhrases.push(...financialMatches);
    signals.push("Prize/Money Offer");
  }

  // 3. BANK/ORGANIZATION IMPERSONATION
  const bankKeywords = [
    "sbi",
    "hdfc",
    "icici",
    "axis",
    "bank",
    "paypal",
    "paytm",
    "google pay",
    "phonepe",
    "amazon",
    "flipkart",
    "rbi",
    "rbi.org",
  ];
  const bankMatches = bankKeywords.filter((kw) => lowerText.includes(kw));
  if (bankMatches.length > 0 && !isFriendlyMessage) {
    detectedSignals.impersonation = true;
    fraudTypes.push("Impersonation");
    whyFraud.push(
      `Impersonating trusted brand: "${bankMatches.join('", "')}" - phishing attempt`,
    );
    signals.push("Brand Impersonation");
  }

  // 4. CREDENTIAL/OTP THEFT REQUEST
  const otpKeywords = [
    "otp",
    "verification code",
    "verify",
    "confirm",
    "validate",
    "kyc",
    "update details",
    "update pan",
    "update bank",
    "confirm password",
    "enter password",
    "send me otp",
  ];
  const otpMatches = otpKeywords.filter((kw) => lowerText.includes(kw));
  if (otpMatches.length > 0 && !isFriendlyMessage) {
    detectedSignals.credential_theft = true;
    fraudTypes.push("Credential Theft");
    whyFraud.push(
      `Requesting sensitive info: "${otpMatches.join('", "')}" - credential harvesting`,
    );
    riskyPhrases.push(...otpMatches);
    signals.push("Credential Request");
  }

  // 5. SUSPICIOUS LINKS WITH PROPER VERIFICATION
  const urlPattern =
    /(https?:\/\/[^\s]+)|(bit\.ly|tinyurl|short\.link|goo\.gl|[a-z0-9.-]+\.(com|net|org|in|xyz|tk|ml|ga|cf|top|space|online|store|club)(?:[\s]|$))/gi;
  const urls = text.match(urlPattern) || [];

  // Also detect bare domains (e.g., example.com without protocol)
  const bareDomainPattern =
    /\b([a-z0-9.-]+\.(com|net|org|in|xyz|tk|ml|ga|cf|top|space|online|store|club))\b/gi;
  const bareDomains = text.match(bareDomainPattern) || [];
  const allUrls = [...new Set([...urls, ...bareDomains])];

  const linkAnalysis: {
    domain: string;
    reputation: "Safe" | "Suspicious" | "Dangerous";
  } | null = null;

  if (allUrls && allUrls.length > 0) {
    for (const firstUrl of allUrls) {
      const linkVerification = verifyLink(firstUrl);

      if (linkVerification.reputation === "Dangerous") {
        detectedSignals.suspicious_url = true;
        fraudTypes.push("Suspicious Link");
        whyFraud.push(`Dangerous link detected: ${linkVerification.reason}`);
        signals.push("Malicious Link");
        break;
      } else if (
        linkVerification.reputation === "Suspicious" &&
        !isFriendlyMessage
      ) {
        detectedSignals.suspicious_url = true;
        fraudTypes.push("Suspicious Link");
        whyFraud.push(`Suspicious link: ${linkVerification.reason}`);
        signals.push("Suspicious Link");
        break;
      }
    }
  }

  // 6. AI-GENERATED TONE
  const aiPhrases = [
    "dear valued customer",
    "kindly request",
    "cooperation",
    "uninterrupted access",
    "we regret",
    "inconvenience caused",
    "click below",
    "confirm below",
    "verify below",
  ];
  const aiMatches = aiPhrases.filter((phrase) => lowerText.includes(phrase));
  if (aiMatches.length >= 2 && !isFriendlyMessage) {
    detectedSignals.ai_generated_tone = true;
    fraudTypes.push("AI-Generated Script");
    whyFraud.push("Overly formal/generic template-like language");
    signals.push("AI-Like Template");
  }

  // 7. SOCIAL ENGINEERING (Personal Connection Exploitation)
  const socialEngineering = [
    "please help",
    "emergency money",
    "stuck abroad",
    "battery dead",
    "phone lost",
    "can you send",
    "urgent transfer",
    "trusted you",
  ];
  const socialMatches = socialEngineering.filter((kw) =>
    lowerText.includes(kw),
  );
  if (socialMatches.length >= 2 && !isFriendlyMessage) {
    detectedSignals.social_engineering = true;
    fraudTypes.push("Social Engineering");
    whyFraud.push("Personal emergency exploitation");
    signals.push("Social Engineering");
  }

  // 8. JOB/WORK SCAMS
  const jobKeywords = [
    "part time",
    "work from home",
    "earn daily",
    "no investment",
    "quick money",
    "passive income",
    "side hustle",
    "flexible job",
    "high paying",
    "selected for",
    "hiring",
    "no experience",
    "limited positions",
    "register now",
    "work from",
    "job opportunity",
  ];
  const jobMatches = jobKeywords.filter((kw) => lowerText.includes(kw));
  // Job scam detected if: (1+ job keywords) AND (financial keywords present) OR (2+ job keywords alone)
  if (
    !isFriendlyMessage &&
    ((jobMatches.length >= 1 && financialMatches.length > 0) ||
      jobMatches.length >= 2)
  ) {
    detectedSignals.job_scam = true;
    fraudTypes.push("Job Scam");
    whyFraud.push(
      `Job fraud detected: "${jobMatches.join('", "')}" + financial incentive - classic job scam`,
    );
    signals.push("Job Scam Pattern");
    riskyPhrases.push(...jobMatches);
  }

  // 9. EXTORTION/THREAT
  const extortionKeywords = [
    "hack",
    "webcam",
    "recorded",
    "bitcoin",
    "payment",
    "expose",
    "leak",
    "blackmail",
    "compromised",
  ];
  const extortionMatches = extortionKeywords.filter((kw) =>
    lowerText.includes(kw),
  );
  if (extortionMatches.length >= 3 && !isFriendlyMessage) {
    detectedSignals.threat_extortion = true;
    fraudTypes.push("Extortion");
    whyFraud.push("Sextortion/blackmail threat");
    signals.push("Threat/Extortion");
  }

  // 10. CRYPTO INVESTMENT SCAMS
  const cryptoKeywords = [
    "bitcoin",
    "ethereum",
    "crypto",
    "trading bot",
    "investment returns",
    "guaranteed profit",
    "double money",
    "crypto wallet",
  ];
  const cryptoMatches = cryptoKeywords.filter((kw) => lowerText.includes(kw));
  if (
    cryptoMatches.length >= 2 &&
    financialMatches.length > 0 &&
    !isFriendlyMessage
  ) {
    detectedSignals.crypto_investment_pitch = true;
    fraudTypes.push("Crypto Investment Scam");
    whyFraud.push("Unrealistic cryptocurrency profit promises");
    signals.push("Crypto Investment");
  }

  // 11. UPI/PAYMENT FRAUD (Regional fraud patterns)
  const upiKeywords = [
    "upi pin",
    "share pin",
    "enter pin",
    "debit",
    "debited",
    "reverse transaction",
    "refund",
    "cashback",
    "paytm pin",
    "google pay pin",
    "phonepe pin",
  ];
  const upiMatches = upiKeywords.filter((kw) => lowerText.includes(kw));
  if (upiMatches.length >= 1 && !isFriendlyMessage) {
    detectedSignals.regional_upi_fraud = true;
    fraudTypes.push("UPI/Payment Fraud");
    whyFraud.push(
      "Requesting UPI PIN or payment credentials - classic fraud tactic",
    );
    signals.push("UPI Fraud");
  }

  // 12. TECH SUPPORT SCAMS
  const techSupportKeywords = [
    "microsoft",
    "windows",
    "license",
    "expired",
    "virus detected",
    "malware",
    "tech support",
    "call immediately",
    "computer locked",
    "system compromised",
    "antivirus",
    "renew license",
  ];
  const techMatches = techSupportKeywords.filter((kw) =>
    lowerText.includes(kw),
  );
  if (techMatches.length >= 2 && !isFriendlyMessage) {
    detectedSignals.tech_support_refund = true;
    fraudTypes.push("Tech Support Scam");
    whyFraud.push("Fake technical issue with urgent action required");
    signals.push("Tech Support Scam");
  }

  // 13. SPAM/MARKETING (Low priority)
  const spamKeywords = [
    "unsubscribe",
    "click here to stop",
    "limited offer",
    "flash sale",
    "% off",
    "discount",
    "shop now",
  ];
  const spamMatches = spamKeywords.filter((kw) => lowerText.includes(kw));
  if (spamMatches.length >= 2 && !isFriendlyMessage) {
    detectedSignals.spam_marketing = true;
    // Don't add to fraud types for marketing spam
    signals.push("Marketing Spam");
  }

  // BANK VERIFICATION
  let bankVerification = undefined;
  if (bankMatches.length > 0) {
    const detectedBank = bankMatches[0].toUpperCase();
    const hasOfficialDomain =
      /\.in|\.com|\.co\.in/.test(lowerText) &&
      !/-secure|-verify|-update/.test(lowerText);
    bankVerification = {
      detected_bank: detectedBank,
      is_official_domain: hasOfficialDomain,
      risk_reason: hasOfficialDomain ? null : "Non-official domain detected",
    };
  }

  // 15. ENHANCED GRAMMAR & SPELLING DETECTION
  const detectedTypos: string[] = [];
  const detectedGrammarIssues: string[] = [];

  const spellingKeywords = [
    "plz",
    "ur",
    "wud",
    "shud",
    "hav",
    "txt",
    "abt",
    "thnx",
    "clk",
    "nd",
    "pls",
    "thx",
    "msg",
    "srry",
    "wanna",
    "gonna",
    "cud",
    "shudnt",
    "cldnt",
  ];
  const spellingMatches = spellingKeywords.filter((kw) =>
    lowerText.includes(kw),
  );
  if (spellingMatches.length > 0) {
    detectedTypos.push(...spellingMatches.slice(0, 5));
    errorMetrics.typos += spellingMatches.length;
  }

  // Detect gibberish words
  const words = text.split(/\s+/);
  const gibberishWords: string[] = [];
  words.forEach((word) => {
    const cleanWord = word.toLowerCase().replace(/[^a-z]/g, "");
    if (cleanWord.length >= 5) {
      const vowels = (cleanWord.match(/[aeiou]/g) || []).length;
      const consonants = cleanWord.length - vowels;
      if (
        (vowels === 0 && consonants >= 5) ||
        consonants / cleanWord.length > 0.85
      ) {
        gibberishWords.push(word);
      }
    }
  });
  if (gibberishWords.length > 0) {
    detectedTypos.push(...gibberishWords.slice(0, 3));
    errorMetrics.gibberish += gibberishWords.length;
  }

  // Detect repeated characters
  const repeatedCharsPattern = /([a-z])\1{3,}/gi;
  const repeatedChars = text.match(repeatedCharsPattern);
  if (repeatedChars && repeatedChars.length > 0) {
    errorMetrics.typos += repeatedChars.length;
  }

  // Detect excessive punctuation
  const excessivePunctuation = text.match(/[!?]{2,}|[\.]{3,}/g);
  if (excessivePunctuation && excessivePunctuation.length > 0) {
    detectedGrammarIssues.push("Excessive punctuation");
    errorMetrics.grammar += excessivePunctuation.length;
  }

  // Detect excessive CAPS
  const capsWords = text.match(/\b[A-Z]{4,}\b/g);
  if (capsWords && capsWords.length > 2) {
    detectedGrammarIssues.push(`Excessive CAPS: ${capsWords.length} instances`);
    errorMetrics.grammar += capsWords.length;
  }

  // Set signal if errors detected
  if (
    errorMetrics.typos > 0 ||
    errorMetrics.grammar > 0 ||
    errorMetrics.gibberish > 0
  ) {
    detectedSignals.spelling_grammar_issues = true;
    signals.push(
      `${errorMetrics.typos + errorMetrics.grammar + errorMetrics.gibberish} Text Quality Issues`,
    );
  }

  // Calculate proper grammar score based on error metrics
  const grammarScore = calculateGrammarScore(text, errorMetrics);

  // CALCULATE NOW IMPROVED RISK SCORE with proper weighting
  let riskScore = 0;

  if (
    !isFriendlyMessage &&
    fraudTypes.length === 0 &&
    !detectedSignals.urgency &&
    !detectedSignals.suspicious_url
  ) {
    // Likely safe/friendly message
    riskScore = 5;
  } else {
    // Use improved calculation function
    riskScore = calculateRiskScore(detectedSignals, textLength, fraudTypes);
  }

  // Apply grammar impacts
  if (grammarScore < 50 && detectedSignals.spelling_grammar_issues) {
    riskScore = Math.min(100, riskScore + 15);
  }
  // If no vowels or consonant ratio too high, likely gibberish
  // Cap at 100
  riskScore = Math.min(100, Math.round(riskScore));

  const similarCaseMatch = demoMatch
    ? {
        id: demoMatch.id,
        similarity_score: 95,
        description: demoMatch.explanation,
      }
    : undefined;

  // Calculate final risk level and fraud determination
  let riskLevel: "Safe" | "Suspicious" | "High" | "Critical" = "Safe";
  let isFraud = false;

  if (riskScore >= 75) {
    riskLevel = "Critical";
    isFraud = true;
  } else if (riskScore >= 55) {
    riskLevel = "High";
    isFraud = true;
  } else if (riskScore >= 35) {
    riskLevel = "Suspicious";
    isFraud = true;
  } else {
    riskLevel = "Safe";
    isFraud = false;
  }

  // Determine message type based on detected signals
  let messageType: AnalysisResponse["message_type"] = "Friendly Message";

  // Check if input is primarily a URL (not conversational)
  const isUrlOnly =
    /^\s*(https?:\/\/[^\s]+|www\.[^\s]+|[a-z0-9.-]+\.(com|net|org|in|xyz|tk|ml|ga|cf|top|space|online|store|club|co\.in|gov|edu)([\s]|$))/i.test(
      text.trim(),
    );

  if (isFraud) {
    // Priority order: most severe first
    if (detectedSignals.threat_extortion) {
      messageType = "Blackmail/Extortion";
    } else if (detectedSignals.regional_upi_fraud) {
      messageType = "UPI Fraud";
    } else if (
      detectedSignals.credential_theft ||
      detectedSignals.impersonation
    ) {
      messageType = "Phishing";
    } else if (detectedSignals.job_scam) {
      messageType = "Job Scam";
    } else if (detectedSignals.tech_support_refund) {
      messageType = "Tech Support Scam";
    } else if (
      detectedSignals.crypto_investment_pitch ||
      detectedSignals.financial_lure
    ) {
      messageType = "Financial Fraud";
    } else if (detectedSignals.spam_marketing) {
      messageType = "Spam/Marketing";
    } else if (detectedSignals.suspicious_url || isUrlOnly) {
      messageType = "Suspicious Link";
    } else if (detectedSignals.impersonation) {
      messageType = "Impersonation";
    } else {
      messageType = "Suspicious";
    }
  } else if (isUrlOnly) {
    // URL-only input with low risk = Safe Link
    messageType = "Safe Link";
  } else if (isFriendlyMessage || riskScore < 20) {
    messageType = "Friendly Message";
  } else {
    messageType = "Suspicious";
  }

  // Ensure fraud types are populated
  if (fraudTypes.length === 0 && isFraud) {
    fraudTypes.push("Possible Scam");
  }
  if (fraudTypes.length === 0 && !isFraud) {
    fraudTypes.push("None");
  }

  // Build explanation
  let explanation = "";
  if (isFraud) {
    const risk_factor = riskScore > 60 ? "HIGH RISK" : "MODERATE RISK";
    explanation = `${risk_factor} (Score: ${riskScore}/100). ${whyFraud.join(". ")}.`;
  } else if (isFriendlyMessage) {
    explanation = `Safe - Appears to be friendly/casual message. Grammar score: ${grammarScore}/100.`;
  } else {
    explanation = `Low risk content. No significant fraud indicators detected. Grammar score: ${grammarScore}/100.`;
  }

  // Get link verification if URLs exist
  let linkReputation: "Safe" | "Suspicious" | "Dangerous" = "Safe";
  if (allUrls && allUrls.length > 0) {
    const verification = verifyLink(allUrls[0]);
    linkReputation = verification.reputation;
  }

  return {
    is_fraud: isFraud,
    risk_score: riskScore,
    risk_level: riskLevel,
    message_type: messageType,
    fraud_type: fraudTypes,
    why_fraud:
      whyFraud.length > 0 ? whyFraud : ["No significant fraud indicators"],
    risky_phrases: riskyPhrases,
    detected_signals: detectedSignals,
    link_analysis: {
      domain:
        allUrls && allUrls.length > 0
          ? allUrls[0].replace(/https?:\/\//, "").split("/")[0]
          : "",
      shortened: /bit\.ly|tinyurl|short\.link/i.test(text),
      brand_spoofing: detectedSignals.impersonation,
      google_presence:
        linkReputation === "Safe"
          ? "High"
          : linkReputation === "Suspicious"
            ? "Medium"
            : "Low",
    },
    similar_case_match: similarCaseMatch,
    text_error_analysis: {
      typos: detectedTypos.slice(0, 5),
      grammar_issues: detectedGrammarIssues.slice(0, 5),
      score: grammarScore,
    },
    bank_verification: bankVerification,
    counterfactual_safe_conditions: isFraud
      ? [
          "Remove urgency language",
          "Use official communication channels",
          "Verify sender identity",
        ]
      : [],
    campaign_detected: false,
    recommended_action: isFraud
      ? riskScore > 70
        ? [
            "Do not respond",
            "Do not click links",
            "Report as spam",
            "Verify through official channels",
          ]
        : [
            "Verify sender identity",
            "Check for official domain",
            "Ask sender to resend",
          ]
      : ["Message appears safe"],
    model_self_check: {
      possible_misclassification_reason:
        riskScore < 30
          ? "May miss sophisticated attacks"
          : "Heuristic and pattern-based detection",
      confidence_calibration:
        riskScore > 70 || riskScore < 15 ? "High" : "Medium",
    },
    confidence: isFraud ? (riskScore > 70 ? 85 : 70) : 75,
    explanation: explanation,
    signals: signals.length > 0 ? signals : ["Content Analysis Complete"],
    tone: detectedSignals.urgency
      ? "Urgent"
      : detectedSignals.ai_generated_tone
        ? "AI-Like"
        : "Normal",
    author_prediction: detectedSignals.ai_generated_tone
      ? "AI Generated"
      : isFriendlyMessage
        ? "Human Typed"
        : "Unknown",
  };
}

// Wrapper function - calls the heuristic analyzer
function getMockAnalysis(text: string): AnalysisResponse {
  return analyzeContentHeuristic(text);
}
