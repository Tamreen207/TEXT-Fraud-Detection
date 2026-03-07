"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFraudStore } from "@/store/useFraudStore";
import { analyzeContent } from "@/lib/gemini";
import { detectScamLanguage } from "@/lib/scamLanguageDetector";
import {
  calculateThreatIntelligence,
  detectSocialEngineering,
  calculateTrustScore,
  predictRiskTrajectory,
  performMultiLayerVerification,
  analyzeBehavioralPatterns,
} from "@/lib/advancedFraudFeatures";
import {
  ScanLine,
  Shield,
  Zap,
  Copy,
  CheckCircle,
  Search,
  AlertCircle,
  Languages,
  Target,
  Brain,
  TrendingUp,
  CheckSquare,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

const FRAUD_EXAMPLES = [
  {
    title: "UPI Payment Scam",
    description: "Fake UPI payment request",
    text: "Hi! Your UPI account has suspicious activity. Click here urgently to verify: bit.ly/upi-verify. Don't share this with anyone! Your money is at risk! Reply ASAP.",
  },
  {
    title: "Bank Account Compromise",
    description: "Account lockout threat",
    text: "ALERT: Your HDFC Bank Account will be CLOSED immediately due to suspicious transactions! Update your details now: secure-hdfc-verify.com/login. Your account has been flagged. Act now!",
  },
  {
    title: "Amazon/PayPal Refund",
    description: "Fake refund offer scam",
    text: "Congratulations! You've been selected for a Rs.5000 Amazon refund. Click below to claim your refund before it expires in 24 hours: amazon-refund-claim.tk. Limited slots available!",
  },
  {
    title: "Mobile Recharge Fraud",
    description: "Subscription trap message",
    text: "Your mobile plan expires today! Recharge now and get 50% OFF on next recharge. Click: mobile-recharge-offer.xyz. Valid only for 2 hours! Don't miss this amazing deal!",
  },
  {
    title: "Job Offer Scam",
    description: "Employment fraud",
    text: "You've been selected for a HIGH PAYING JOB! Work from home, earn Rs.50,000/month with no experience needed. Register now: quickjob-money.com. Urgent hiring! Limited positions left!",
  },
  {
    title: "Tax Refund Phishing",
    description: "Government impersonation",
    text: "Income Tax Dept: Your tax refund amount is Rs.23,456. To receive it immediately, verify your Aadhaar: itd-refund-verify.gov.fake. Process will take only 5 minutes. Don't wait!",
  },
];

const SAFE_EXAMPLES = [
  {
    title: "Team Update",
    text: "Hi team, the client review is moved to 3 PM tomorrow. Please bring your sprint notes and blockers list.",
  },
  {
    title: "Order Confirmation",
    text: "Your order #12984 has been confirmed and will be delivered by Monday. Track status from your account dashboard.",
  },
];

export default function AnalyzePage() {
  const router = useRouter();
  const { inputText, setInputText, setIsAnalyzing, setResult, demoMode } =
    useFraudStore();

  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [scamLanguageResult, setScamLanguageResult] = useState<any>(null);
  const [advancedFeatures, setAdvancedFeatures] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!inputText) return;

    setIsLoading(true);
    setIsAnalyzing(true);
    setResult(null);
    setScamLanguageResult(null);

    try {
      // Detect scam language
      const langResult = detectScamLanguage(inputText);
      setScamLanguageResult(langResult);

      const data = await analyzeContent(inputText, demoMode);

      // Calculate advanced features
      const threatIntel = calculateThreatIntelligence(
        inputText,
        data.risk_score,
      );
      const socialEng = detectSocialEngineering(inputText);
      const trustScore = calculateTrustScore(inputText, data.risk_score);
      const riskTraj = predictRiskTrajectory(
        data.risk_score,
        langResult.detectedPatterns,
      );
      const multiLayer = performMultiLayerVerification(inputText);
      const behavioral = analyzeBehavioralPatterns(inputText);

      setAdvancedFeatures({
        threatIntel,
        socialEng,
        trustScore,
        riskTraj,
        multiLayer,
        behavioral,
      });

      setTimeout(() => {
        setResult(data);
        router.push("/results");
        setIsLoading(false);
        setIsAnalyzing(false);
      }, 2000);
    } catch (e) {
      console.error(e);
      setIsLoading(false);
      setIsAnalyzing(false);
      alert("Error analyzing content. Please try again.");
    }
  };

  const handleGoogleCompare = () => {
    if (!inputText || inputText.trim().length < 10) {
      alert("Please enter at least 10 characters before comparing.");
      return;
    }

    // Detect scam language
    const langResult = detectScamLanguage(inputText);
    setScamLanguageResult(langResult);

    const query = `is this message fraud or scam: ${inputText.trim().slice(0, 220)}`;
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(googleUrl, "_blank", "noopener,noreferrer");
  };

  const handleExampleClick = (text: string) => {
    setInputText(text);
  };

  const handleCopyExample = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/10 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Header Section - Clean & Simple */}
      <div className="text-center space-y-6 mb-12 pt-8">
        {/* Simple Logo */}
        <div className="inline-flex items-center justify-center mb-4">
          <div className="relative">
            {/* Hexagon Logo */}
            <div
              className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center"
              style={{
                clipPath:
                  "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
              }}
            >
              <Shield className="w-10 h-10 text-white" strokeWidth={2} />
            </div>
          </div>
        </div>
        <h1 className="text-4xl sm:text-5xl font-display font-bold tracking-tight gradient-text">
          Fraud Analysis
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Paste text or share a link to instantly detect fraud with{" "}
          <span className="text-blue-600 dark:text-blue-400 font-semibold">
            AI-powered analysis
          </span>
          .
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto w-full space-y-8 flex-1 animate-in fade-in slide-in-from-bottom-8 duration-700 px-4">
        {/* Scanner Overlay - Simplified */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center"
            >
              {/* Content Container */}
              <div className="bg-card border-2 border-blue-500/30 p-8 rounded-lg text-center max-w-md">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="flex justify-center mb-4"
                >
                  <Shield className="w-12 h-12 text-blue-600" />
                </motion.div>
                <h3 className="text-xl font-bold mb-3">Analyzing Content...</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4" />
                    <span>Detecting Patterns</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>Verifying Authenticity</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <ScanLine className="w-4 h-4" />
                    <span>Running Forensics</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Section */}
        <div className="space-y-6">
          {/* Text Input Card */}
          <div className="relative border-2 border-border focus-within:border-blue-500 transition-colors duration-200 bg-card rounded-lg overflow-hidden">
            <Textarea
              placeholder="Paste suspicious text, link, or message here to analyze..."
              className="min-h-[220px] text-base resize-none border-none focus-visible:ring-0 p-6 shadow-none bg-transparent"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>

          {/* Character Count & Status */}
          <div className="flex items-center justify-between text-sm text-muted-foreground px-2">
            <span>{inputText.length} characters</span>
            {inputText.length > 0 && inputText.length < 10 && (
              <span className="text-orange-500 text-xs">
                Enter at least 10 characters
              </span>
            )}
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm font-semibold mb-3">
              Demo Examples (Safe + Scam)
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setInputText(SAFE_EXAMPLES[0].text)}
                className="flex-1 px-4 py-2 rounded-md border border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm font-medium hover:opacity-90"
              >
                Load Safe Demo
              </button>
              <button
                onClick={() => setInputText(FRAUD_EXAMPLES[0].text)}
                className="flex-1 px-4 py-2 rounded-md border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm font-medium hover:opacity-90"
              >
                Load Scam Demo
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              className="gradient-button flex-1 text-base h-12 rounded-lg font-semibold hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleAnalyze}
              disabled={!inputText || inputText.length < 10 || isLoading}
            >
              <Zap className="w-5 h-5 mr-2" />
              {isLoading ? "Analyzing..." : "Analyze Now"}
            </Button>
            <Button
              size="lg"
              className="flex-1 text-base h-12 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              onClick={handleGoogleCompare}
              disabled={!inputText || inputText.length < 10 || isLoading}
            >
              <Search className="w-5 h-5 mr-2" />
              Compare with Google
            </Button>
          </div>

          {/* Scam Language Detector Result */}
          {scamLanguageResult && (
            <Card className="p-4 border-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
              <div className="flex items-center gap-2 mb-3">
                <Languages className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                  🔍 Scam Language Detector
                </h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Language Score:</span>
                  <span className="text-lg font-bold text-purple-600">
                    {scamLanguageResult.languageScore}/100
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Urgency Level:</span>
                  <span
                    className={`text-sm font-bold uppercase ${scamLanguageResult.urgencyLevel === "critical" ? "text-red-600" : scamLanguageResult.urgencyLevel === "high" ? "text-orange-600" : scamLanguageResult.urgencyLevel === "medium" ? "text-yellow-600" : "text-green-600"}`}
                  >
                    {scamLanguageResult.urgencyLevel}
                  </span>
                </div>
                {scamLanguageResult.detectedPatterns.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium mb-1">
                      Detected Patterns:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {scamLanguageResult.detectedPatterns.map(
                        (pattern: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded-full border border-red-300 dark:border-red-700"
                          >
                            {pattern}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                )}
                {scamLanguageResult.suspiciousWords.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium mb-1">
                      Suspicious Keywords:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {scamLanguageResult.suspiciousWords
                        .slice(0, 8)
                        .map((word: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs rounded border border-yellow-300 dark:border-yellow-700"
                          >
                            {word}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Advanced Features Display */}
          {advancedFeatures && (
            <div className="space-y-4 animate-in fade-in duration-500">
              {/* Threat Intelligence */}
              <Card className="p-5 border-2 border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-6 h-6 text-red-600" />
                  <h3 className="font-bold text-red-900 dark:text-red-100 text-lg">
                    🎯 Threat Intelligence Level
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Threat Level:
                    </p>
                    <p
                      className={`text-2xl font-bold uppercase ${
                        advancedFeatures.threatIntel.level === "critical"
                          ? "text-red-700"
                          : advancedFeatures.threatIntel.level === "high"
                            ? "text-orange-600"
                            : advancedFeatures.threatIntel.level === "moderate"
                              ? "text-yellow-600"
                              : "text-green-600"
                      }`}
                    >
                      {advancedFeatures.threatIntel.level}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Confidence:
                    </p>
                    <p className="text-2xl font-bold text-red-600">
                      {advancedFeatures.threatIntel.confidence}%
                    </p>
                  </div>
                </div>
                {advancedFeatures.threatIntel.indicators.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">
                      Threat Indicators:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {advancedFeatures.threatIntel.indicators.map(
                        (ind: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-red-600 text-white text-xs rounded-full font-semibold"
                          >
                            {ind}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </Card>

              {/* Social Engineering Detection */}
              {advancedFeatures.socialEng.detected && (
                <Card className="p-5 border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-6 h-6 text-purple-600" />
                    <h3 className="font-bold text-purple-900 dark:text-purple-100 text-lg">
                      🧠 Social Engineering Detected
                    </h3>
                  </div>
                  <div className="mb-3">
                    <p className="text-sm text-purple-700 dark:text-purple-300 mb-1">
                      Manipulation Score:
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-purple-200 dark:bg-purple-900/50 rounded-full h-3">
                        <div
                          className="bg-purple-600 h-3 rounded-full transition-all duration-500"
                          style={{
                            width: `${advancedFeatures.socialEng.manipulationScore}%`,
                          }}
                        />
                      </div>
                      <span className="text-lg font-bold text-purple-600">
                        {advancedFeatures.socialEng.manipulationScore}%
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {advancedFeatures.socialEng.tactics.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2">
                          Tactics Used:
                        </p>
                        <ul className="space-y-1">
                          {advancedFeatures.socialEng.tactics.map(
                            (tactic: string, idx: number) => (
                              <li
                                key={idx}
                                className="text-xs text-purple-700 dark:text-purple-300 flex items-center gap-1"
                              >
                                <span className="text-purple-600">▸</span>
                                {tactic}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}
                    {advancedFeatures.socialEng.psychologicalTriggers.length >
                      0 && (
                      <div>
                        <p className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2">
                          Psychological Triggers:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {advancedFeatures.socialEng.psychologicalTriggers.map(
                            (trigger: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-purple-200 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 text-xs rounded-full"
                              >
                                {trigger}
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Trust Score */}
              <Card className="p-5 border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-6 h-6 text-blue-600" />
                  <h3 className="font-bold text-blue-900 dark:text-blue-100 text-lg">
                    🛡️ Trust Score Analysis
                  </h3>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Overall Trust Score:
                    </p>
                    <p className="text-4xl font-bold text-blue-600">
                      {advancedFeatures.trustScore.score}/100
                    </p>
                  </div>
                  <div
                    className={`px-4 py-2 rounded-lg font-bold uppercase ${
                      advancedFeatures.trustScore.verdict === "highly_trusted"
                        ? "bg-green-200 text-green-800"
                        : advancedFeatures.trustScore.verdict === "trusted"
                          ? "bg-blue-200 text-blue-800"
                          : advancedFeatures.trustScore.verdict === "neutral"
                            ? "bg-gray-200 text-gray-800"
                            : advancedFeatures.trustScore.verdict ===
                                "suspicious"
                              ? "bg-yellow-200 text-yellow-800"
                              : "bg-red-200 text-red-800"
                    }`}
                  >
                    {advancedFeatures.trustScore.verdict.replace("_", " ")}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-blue-700 dark:text-blue-300 mb-1">
                      Domain Reputation
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-blue-200 dark:bg-blue-900/50 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${advancedFeatures.trustScore.factors.domainReputation}%`,
                          }}
                        />
                      </div>
                      <span className="font-semibold">
                        {advancedFeatures.trustScore.factors.domainReputation}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-blue-700 dark:text-blue-300 mb-1">
                      Content Quality
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-blue-200 dark:bg-blue-900/50 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${advancedFeatures.trustScore.factors.contentQuality}%`,
                          }}
                        />
                      </div>
                      <span className="font-semibold">
                        {advancedFeatures.trustScore.factors.contentQuality}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-blue-700 dark:text-blue-300 mb-1">
                      Linguistic Authenticity
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-blue-200 dark:bg-blue-900/50 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${advancedFeatures.trustScore.factors.linguisticAuthenticity}%`,
                          }}
                        />
                      </div>
                      <span className="font-semibold">
                        {
                          advancedFeatures.trustScore.factors
                            .linguisticAuthenticity
                        }
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-blue-700 dark:text-blue-300 mb-1">
                      Historical Patterns
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-blue-200 dark:bg-blue-900/50 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${advancedFeatures.trustScore.factors.historicalPatterns}%`,
                          }}
                        />
                      </div>
                      <span className="font-semibold">
                        {advancedFeatures.trustScore.factors.historicalPatterns}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Risk Trajectory */}
              <Card className="p-5 border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/30 dark:to-yellow-950/30">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                  <h3 className="font-bold text-orange-900 dark:text-orange-100 text-lg">
                    📈 Risk Trajectory Prediction
                  </h3>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      Current Risk:
                    </p>
                    <p className="text-2xl font-bold text-orange-600">
                      {advancedFeatures.riskTraj.current}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      24h Prediction:
                    </p>
                    <p className="text-2xl font-bold text-orange-600">
                      {advancedFeatures.riskTraj.predicted24h}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      Trend:
                    </p>
                    <p
                      className={`text-lg font-bold uppercase ${
                        advancedFeatures.riskTraj.trend === "spiking"
                          ? "text-red-600"
                          : advancedFeatures.riskTraj.trend === "increasing"
                            ? "text-orange-600"
                            : advancedFeatures.riskTraj.trend === "decreasing"
                              ? "text-green-600"
                              : "text-blue-600"
                      }`}
                    >
                      {advancedFeatures.riskTraj.trend}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    Volatility:
                  </p>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      advancedFeatures.riskTraj.volatility === "high"
                        ? "bg-red-200 text-red-800"
                        : advancedFeatures.riskTraj.volatility === "medium"
                          ? "bg-yellow-200 text-yellow-800"
                          : "bg-green-200 text-green-800"
                    }`}
                  >
                    {advancedFeatures.riskTraj.volatility.toUpperCase()}
                  </span>
                </div>
              </Card>

              {/* Multi-Layer Verification */}
              <Card className="p-5 border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
                <div className="flex items-center gap-2 mb-3">
                  <CheckSquare className="w-6 h-6 text-green-600" />
                  <h3 className="font-bold text-green-900 dark:text-green-100 text-lg">
                    ✅ Multi-Layer Verification
                  </h3>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Layers Passed:
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {advancedFeatures.multiLayer.layersPassed}/
                      {advancedFeatures.multiLayer.totalLayers}
                    </p>
                  </div>
                  <div
                    className={`px-4 py-2 rounded-lg font-bold uppercase ${
                      advancedFeatures.multiLayer.overallVerification ===
                      "passed"
                        ? "bg-green-200 text-green-800"
                        : advancedFeatures.multiLayer.overallVerification ===
                            "partial"
                          ? "bg-yellow-200 text-yellow-800"
                          : "bg-red-200 text-red-800"
                    }`}
                  >
                    {advancedFeatures.multiLayer.overallVerification}
                  </div>
                </div>
                <div className="space-y-2">
                  {Object.entries(advancedFeatures.multiLayer.layers).map(
                    ([key, layer]: [string, any]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-green-800 dark:text-green-200 capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}:
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-green-700 dark:text-green-300">
                            {layer.details}
                          </span>
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center ${
                              layer.passed
                                ? "bg-green-500 text-white"
                                : "bg-red-500 text-white"
                            }`}
                          >
                            {layer.passed ? "✓" : "✗"}
                          </span>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </Card>

              {/* Behavioral Patterns */}
              {advancedFeatures.behavioral.length > 0 && (
                <Card className="p-5 border-2 border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-6 h-6 text-indigo-600" />
                    <h3 className="font-bold text-indigo-900 dark:text-indigo-100 text-lg">
                      📊 Behavioral Pattern Analysis
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {advancedFeatures.behavioral.map(
                      (pattern: any, idx: number) => (
                        <div
                          key={idx}
                          className="border border-indigo-200 dark:border-indigo-800 rounded-lg p-3 bg-white/50 dark:bg-black/20"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold text-indigo-900 dark:text-indigo-100">
                              {pattern.pattern}
                            </p>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                pattern.frequency === "frequent"
                                  ? "bg-red-200 text-red-800"
                                  : pattern.frequency === "common"
                                    ? "bg-orange-200 text-orange-800"
                                    : pattern.frequency === "occasional"
                                      ? "bg-yellow-200 text-yellow-800"
                                      : "bg-green-200 text-green-800"
                              }`}
                            >
                              {pattern.frequency.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="text-indigo-700 dark:text-indigo-300">
                              Risk: +{pattern.riskContribution}
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {pattern.examples.map(
                                (ex: string, exIdx: number) => (
                                  <span
                                    key={exIdx}
                                    className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded"
                                  >
                                    {ex}
                                  </span>
                                ),
                              )}
                            </div>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Info Box */}
          <div className="bg-card border border-border rounded-lg p-4 text-sm text-muted-foreground space-y-2">
            <p className="font-semibold text-foreground">
              💡 Tips for Best Results:
            </p>
            <ul className="space-y-1 text-xs">
              <li>
                • Include the full message or link for comprehensive analysis
              </li>
              <li>• Copy-paste suspicious content exactly as received</li>
              <li>
                • Include URLs, sender details, and any unusual formatting
              </li>
              <li>• Analysis takes 2-3 seconds with AI-powered insights</li>
            </ul>
          </div>
        </div>

        {/* Fraud Examples Section */}
        <div className="mt-16 pt-12 border-t border-border/40">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-display font-bold mb-2">
              Common Fraud Examples
            </h2>
            <p className="text-sm text-muted-foreground">
              Try these real-world fraud examples to see FraudGuard in action
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FRAUD_EXAMPLES.map((example, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.3 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="relative bg-card border-2 border-border rounded-lg p-4 h-full transition-all duration-200 flex flex-col hover:border-red-500/40 hover:-translate-y-0.5">
                  {/* Subtle shadow that doesn't affect layout */}
                  <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg shadow-red-500/10 -z-10"></div>

                  {/* Fraud Badge */}
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold">
                    FRAUD
                  </div>

                  {/* Header */}
                  <div className="mb-3 pr-16">
                    <h3 className="font-semibold text-sm text-foreground">
                      {example.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {example.description}
                    </p>
                  </div>

                  {/* Preview Text - Fixed height to prevent layout shift */}
                  <p className="text-xs leading-relaxed text-muted-foreground mb-4 flex-1 line-clamp-4">
                    "{example.text}"
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExampleClick(example.text)}
                      className="flex-1 px-3 py-2 rounded-md bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-xs font-semibold transition-colors duration-200"
                    >
                      Use Example
                    </button>
                    <button
                      onClick={() => handleCopyExample(example.text, idx)}
                      className="px-3 py-2 rounded-md border border-border hover:border-blue-500/40 hover:bg-blue-500/5 text-muted-foreground hover:text-foreground text-xs transition-all duration-200"
                    >
                      {copiedId === idx ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground text-center mt-8">
            Note: These are examples of common fraud patterns. Analysis results
            are for educational purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
