/**
 * Scam Language Detector
 * Detects scam patterns, urgency indicators, and suspicious language
 */

export interface ScamLanguageResult {
  isScamLanguage: boolean;
  confidence: number;
  detectedPatterns: string[];
  urgencyLevel: "low" | "medium" | "high" | "critical";
  suspiciousWords: string[];
  languageScore: number;
  riskFactors: {
    urgencyWords: number;
    moneyRelated: number;
    credentialRequests: number;
    threatening: number;
    tooGoodToBeTrue: number;
  };
}

// Urgency and pressure words
const URGENCY_WORDS = [
  "urgent",
  "immediately",
  "asap",
  "now",
  "hurry",
  "quick",
  "fast",
  "limited time",
  "expires",
  "deadline",
  "act now",
  "don't wait",
  "instant",
  "right now",
  "today only",
  "last chance",
  "final notice",
];

// Money-related scam indicators
const MONEY_KEYWORDS = [
  "money",
  "cash",
  "payment",
  "refund",
  "reward",
  "prize",
  "lottery",
  "bitcoin",
  "crypto",
  "investment",
  "profit",
  "earn",
  "income",
  "transfer",
  "wire",
  "bank",
  "account",
  "credit card",
  "debit card",
  "paypal",
  "venmo",
  "zelle",
  "western union",
  "gift card",
];

// Credential theft indicators
const CREDENTIAL_WORDS = [
  "password",
  "pin",
  "otp",
  "verify",
  "confirm",
  "authenticate",
  "login",
  "username",
  "security code",
  "cvv",
  "ssn",
  "social security",
  "account number",
  "routing number",
  "personal information",
];

// Threatening language
const THREAT_WORDS = [
  "suspended",
  "blocked",
  "locked",
  "closed",
  "terminated",
  "banned",
  "legal action",
  "lawsuit",
  "arrest",
  "police",
  "fine",
  "penalty",
  "consequences",
  "fraud",
  "unauthorized",
  "suspicious activity",
];

// Too good to be true
const PROMISE_WORDS = [
  "guaranteed",
  "free",
  "won",
  "winner",
  "congratulations",
  "selected",
  "approved",
  "qualified",
  "eligible",
  "easy money",
  "risk-free",
  "no strings attached",
  "limited offer",
  "exclusive",
  "secret",
];

// Impersonation indicators
const IMPERSONATION_WORDS = [
  "irs",
  "fbi",
  "dea",
  "social security",
  "microsoft",
  "apple",
  "amazon",
  "google",
  "facebook",
  "netflix",
  "bank of america",
  "wells fargo",
  "paypal",
  "government",
  "tax department",
  "customs",
  "immigration",
];

export function detectScamLanguage(text: string): ScamLanguageResult {
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);

  const detectedPatterns: string[] = [];
  const suspiciousWords: string[] = [];

  // Count risk factors
  const riskFactors = {
    urgencyWords: 0,
    moneyRelated: 0,
    credentialRequests: 0,
    threatening: 0,
    tooGoodToBeTrue: 0,
  };

  // Check urgency
  URGENCY_WORDS.forEach((word) => {
    if (lowerText.includes(word)) {
      riskFactors.urgencyWords++;
      suspiciousWords.push(word);
    }
  });

  // Check money keywords
  MONEY_KEYWORDS.forEach((word) => {
    if (lowerText.includes(word)) {
      riskFactors.moneyRelated++;
      suspiciousWords.push(word);
    }
  });

  // Check credential requests
  CREDENTIAL_WORDS.forEach((word) => {
    if (lowerText.includes(word)) {
      riskFactors.credentialRequests++;
      suspiciousWords.push(word);
    }
  });

  // Check threats
  THREAT_WORDS.forEach((word) => {
    if (lowerText.includes(word)) {
      riskFactors.threatening++;
      suspiciousWords.push(word);
    }
  });

  // Check promises
  PROMISE_WORDS.forEach((word) => {
    if (lowerText.includes(word)) {
      riskFactors.tooGoodToBeTrue++;
      suspiciousWords.push(word);
    }
  });

  // Detect patterns
  if (riskFactors.urgencyWords >= 2) {
    detectedPatterns.push("High urgency pressure");
  }
  if (riskFactors.credentialRequests >= 1 && riskFactors.urgencyWords >= 1) {
    detectedPatterns.push("Credential theft attempt");
  }
  if (riskFactors.threatening >= 2) {
    detectedPatterns.push("Threatening language");
  }
  if (riskFactors.tooGoodToBeTrue >= 2) {
    detectedPatterns.push("Too good to be true offers");
  }
  if (riskFactors.moneyRelated >= 2 && riskFactors.urgencyWords >= 1) {
    detectedPatterns.push("Financial scam indicators");
  }

  // Check for impersonation
  IMPERSONATION_WORDS.forEach((word) => {
    if (lowerText.includes(word)) {
      detectedPatterns.push(`Potential ${word.toUpperCase()} impersonation`);
      suspiciousWords.push(word);
    }
  });

  // Check for suspicious URLs
  const urlPatterns = [
    /bit\.ly/i,
    /tinyurl/i,
    /t\.co/i,
    /goo\.gl/i,
    /ow\.ly/i,
    /is\.gd/i,
    /buff\.ly/i,
    /adf\.ly/i,
    /secure-[a-z]+/i,
    /verify-[a-z]+/i,
    /account-[a-z]+/i,
  ];

  urlPatterns.forEach((pattern) => {
    if (pattern.test(text)) {
      detectedPatterns.push("Suspicious URL pattern detected");
    }
  });

  // Calculate language score (0-100)
  const totalSuspicious = Object.values(riskFactors).reduce((a, b) => a + b, 0);
  let languageScore = Math.min(100, totalSuspicious * 8);

  // Boost score for dangerous combinations
  if (riskFactors.credentialRequests >= 1 && riskFactors.urgencyWords >= 1) {
    languageScore = Math.min(100, languageScore + 20);
  }
  if (riskFactors.threatening >= 2 && riskFactors.credentialRequests >= 1) {
    languageScore = Math.min(100, languageScore + 25);
  }

  // Determine urgency level
  let urgencyLevel: "low" | "medium" | "high" | "critical" = "low";
  if (riskFactors.urgencyWords >= 4) urgencyLevel = "critical";
  else if (riskFactors.urgencyWords >= 3) urgencyLevel = "high";
  else if (riskFactors.urgencyWords >= 2) urgencyLevel = "medium";
  else if (riskFactors.urgencyWords >= 1) urgencyLevel = "low";

  // Determine if scam language
  const isScamLanguage = languageScore >= 30 || detectedPatterns.length >= 2;
  const confidence = Math.min(100, languageScore + detectedPatterns.length * 5);

  return {
    isScamLanguage,
    confidence,
    detectedPatterns,
    urgencyLevel,
    suspiciousWords: Array.from(new Set(suspiciousWords)).slice(0, 10),
    languageScore,
    riskFactors,
  };
}

// Get urgency color for UI
export function getUrgencyColor(level: string): string {
  switch (level) {
    case "critical":
      return "text-red-600 dark:text-red-400";
    case "high":
      return "text-orange-600 dark:text-orange-400";
    case "medium":
      return "text-yellow-600 dark:text-yellow-400";
    default:
      return "text-green-600 dark:text-green-400";
  }
}

// Get urgency badge color
export function getUrgencyBadgeColor(level: string): string {
  switch (level) {
    case "critical":
      return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700";
    case "high":
      return "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-700";
    case "medium":
      return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700";
    default:
      return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700";
  }
}
