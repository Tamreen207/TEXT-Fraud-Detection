"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { detectScamLanguage } from "@/lib/scamLanguageDetector";
import {
  Mail,
  Shield,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Search,
  Languages,
} from "lucide-react";

interface EmailAnalysisResult {
  is_spam: boolean;
  risk_score: number;
  risk_level: string;
  message_type: string;
  grammar_score: number;
  scam_type: string[];
  why_spam: string[];
  detected_signals: Record<string, boolean>;
  sender_analysis: {
    email: string;
    domain: string;
    is_suspicious: boolean;
    is_trusted_domain: boolean;
    reason: string;
  } | null;
  subject_analysis: {
    subject: string;
    spam_keyword_count: number;
    is_suspicious: boolean;
    reason: string;
  } | null;
  content_analysis: {
    text_category: string;
    grammar_score: number;
    author_style: string;
    fraud_signals: string[];
  };
  recommended_action: string[];
  confidence: number;
}

const EMAIL_DEMOS = {
  safe: {
    sender: "hr@company.com",
    subject: "Interview schedule update",
    body: "Hi Alex, your interview is confirmed for Tuesday at 10:30 AM. Please bring your ID and portfolio. Reply if you need to reschedule.",
  },
  scam: {
    sender: "noreply@secure-alert.tk",
    subject: "URGENT verify account now",
    body: "Dear user, your account is blocked due to suspicious activity. Verify OTP and password now to avoid permanent suspension.",
  },
};

export default function EmailAnalyzePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [emailContent, setEmailContent] = useState("");
  const [sender, setSender] = useState("");
  const [subject, setSubject] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<EmailAnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [scamLanguageResult, setScamLanguageResult] = useState<any>(null);

  const getBackendBaseUrls = (): string[] => {
    const fromEnv = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
    const fromWindow =
      typeof window !== "undefined"
        ? `${window.location.protocol}//${window.location.hostname}:8000`
        : undefined;

    const candidates = [
      fromEnv,
      fromWindow,
      "http://127.0.0.1:8000",
      "http://localhost:8000",
    ].filter((value): value is string => Boolean(value));

    return [...new Set(candidates)];
  };

  const analyzeEmail = async () => {
    if (!emailContent.trim()) {
      setError("Please enter email content");
      return;
    }

    setIsAnalyzing(true);
    setError("");
    setResult(null);

    try {
      let lastError: unknown = null;
      let response: Response | null = null;

      for (const baseUrl of getBackendBaseUrls()) {
        try {
          response = await fetch(`${baseUrl}/api/v1/email/analyze`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: emailContent.trim(),
              sender: sender.trim() || null,
              subject: subject.trim() || null,
            }),
          });
          if (response.ok) {
            break;
          }
          lastError = new Error(`Backend returned status ${response.status}`);
        } catch (err) {
          lastError = err;
          response = null;
        }
      }

      if (!response || !response.ok) {
        throw lastError ?? new Error("Analysis failed");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(
        "Failed to connect to backend email analyzer. Ensure backend is running on port 8000.",
      );
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "Critical":
        return "text-red-600 dark:text-red-400";
      case "High":
        return "text-orange-600 dark:text-orange-400";
      case "Suspicious":
        return "text-yellow-600 dark:text-yellow-400";
      default:
        return "text-green-600 dark:text-green-400";
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "Critical":
      case "High":
        return <AlertTriangle className="w-6 h-6" />;
      default:
        return <CheckCircle className="w-6 h-6" />;
    }
  };

  const handleGoogleCompare = () => {
    if (!emailContent.trim()) {
      setError("Enter email content before verifying with Google.");
      return;
    }

    // Detect scam language
    const fullEmail = `${sender} ${subject} ${emailContent}`;
    const langResult = detectScamLanguage(fullEmail);
    setScamLanguageResult(langResult);

    const searchParts = [
      sender && `from ${sender}`,
      subject && `subject ${subject}`,
      emailContent.trim().slice(0, 180),
    ]
      .filter(Boolean)
      .join(" ");

    const searchQuery = `is this email fraud scam phishing: ${searchParts}`;
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    window.open(googleUrl, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    const demoSender = searchParams.get("sender");
    const demoSubject = searchParams.get("subject");
    const demoBody = searchParams.get("body");

    if (demoSender || demoSubject || demoBody) {
      setSender(demoSender ?? "");
      setSubject(demoSubject ?? "");
      setEmailContent(demoBody ?? "");
      setResult(null);
      setError("");
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Mail className="w-12 h-12 text-purple-600" />
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
              Email Analyzer
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Detect spam, phishing, and fraudulent emails with AI
          </p>
        </div>

        {/* Input Section */}
        <Card className="max-w-4xl mx-auto p-8 mb-8 border-2">
          <div className="space-y-4">
            <div className="rounded-lg border border-border p-4 bg-muted/20">
              <p className="text-sm font-semibold mb-3">
                Demo Examples (Safe + Scam)
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setSender(EMAIL_DEMOS.safe.sender);
                    setSubject(EMAIL_DEMOS.safe.subject);
                    setEmailContent(EMAIL_DEMOS.safe.body);
                  }}
                  className="flex-1 px-4 py-2 rounded-md border border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm font-medium hover:opacity-90"
                >
                  Load Safe Demo Email
                </button>
                <button
                  onClick={() => {
                    setSender(EMAIL_DEMOS.scam.sender);
                    setSubject(EMAIL_DEMOS.scam.subject);
                    setEmailContent(EMAIL_DEMOS.scam.body);
                  }}
                  className="flex-1 px-4 py-2 rounded-md border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm font-medium hover:opacity-90"
                >
                  Load Scam Demo Email
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Sender Email (Optional)
              </label>
              <Input
                type="email"
                placeholder="sender@example.com"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                className="text-base"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Subject Line (Optional)
              </label>
              <Input
                type="text"
                placeholder="Email subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="text-base"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Email Content <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="Paste the email content here..."
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                rows={8}
                className="text-base resize-none"
              />
            </div>

            {error && (
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={analyzeEmail}
                disabled={isAnalyzing}
                className="flex-1 py-6 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing Email...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5 mr-2" />
                    Analyze Email
                  </>
                )}
              </Button>
              <Button
                onClick={handleGoogleCompare}
                disabled={isAnalyzing || !emailContent.trim()}
                className="flex-1 py-6 text-lg bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Search className="w-5 h-5 mr-2" />
                Compare with Google
              </Button>
            </div>

            {/* Scam Language Detector Result */}
            {scamLanguageResult && (
              <div className="p-4 border-2 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                <div className="flex items-center gap-2 mb-3">
                  <Languages className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                    🔍 Scam Language Detector
                  </h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Language Score:</span>
                    <span className="font-bold text-purple-600">
                      {scamLanguageResult.languageScore}/100
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Urgency Level:</span>
                    <span
                      className={`font-bold uppercase ${scamLanguageResult.urgencyLevel === "critical" ? "text-red-600" : scamLanguageResult.urgencyLevel === "high" ? "text-orange-600" : scamLanguageResult.urgencyLevel === "medium" ? "text-yellow-600" : "text-green-600"}`}
                    >
                      {scamLanguageResult.urgencyLevel}
                    </span>
                  </div>
                  {scamLanguageResult.detectedPatterns.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium mb-1">Detected Patterns:</p>
                      <div className="flex flex-wrap gap-1">
                        {scamLanguageResult.detectedPatterns.map(
                          (pattern: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded-full"
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
                      <p className="font-medium mb-1">Suspicious Keywords:</p>
                      <div className="flex flex-wrap gap-1">
                        {scamLanguageResult.suspiciousWords
                          .slice(0, 8)
                          .map((word: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs rounded"
                            >
                              {word}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Results */}
        {result && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Risk Score Card */}
            <Card className="p-8 border-2">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={getRiskColor(result.risk_level)}>
                    {getRiskIcon(result.risk_level)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Risk Assessment</h2>
                    <p className="text-muted-foreground">
                      {result.is_spam ? "Spam/Fraud Detected" : "Appears Safe"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-4xl font-bold ${getRiskColor(result.risk_level)}`}
                  >
                    {result.risk_score}/100
                  </div>
                  <div
                    className={`text-lg font-semibold ${getRiskColor(result.risk_level)}`}
                  >
                    {result.risk_level}
                  </div>
                </div>
              </div>

              {/* Risk Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-6">
                <div
                  className={`h-3 rounded-full transition-all ${
                    result.risk_level === "Critical"
                      ? "bg-red-600"
                      : result.risk_level === "High"
                        ? "bg-orange-500"
                        : result.risk_level === "Suspicious"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                  }`}
                  style={{ width: `${result.risk_score}%` }}
                ></div>
              </div>

              {/* Scam Types */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">
                  Detected Scam Types
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.scam_type.map((type, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              {/* Message Type */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Message Type</h3>
                <p className="text-base">{result.message_type}</p>
              </div>

              {/* Why Spam */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Analysis Details</h3>
                <ul className="space-y-2">
                  {result.why_spam.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400 mt-1">
                        •
                      </span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>

            {/* Sender & Subject Analysis */}
            {(result.sender_analysis || result.subject_analysis) && (
              <div className="grid md:grid-cols-2 gap-6">
                {result.sender_analysis && (
                  <Card className="p-6 border-2">
                    <h3 className="text-lg font-bold mb-4">Sender Analysis</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Email Address
                        </p>
                        <p className="font-mono text-sm">
                          {result.sender_analysis.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Domain</p>
                        <p className="font-mono text-sm">
                          {result.sender_analysis.domain}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Trusted Domain
                        </p>
                        <p className="font-semibold text-sm">
                          {result.sender_analysis.is_trusted_domain
                            ? "Yes ✓"
                            : "No ⚠️"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Assessment
                        </p>
                        <p
                          className={`font-semibold text-sm ${
                            result.sender_analysis.is_suspicious
                              ? "text-red-600 dark:text-red-400"
                              : "text-green-600 dark:text-green-400"
                          }`}
                        >
                          {result.sender_analysis.reason}
                        </p>
                      </div>
                    </div>
                  </Card>
                )}

                {result.subject_analysis && (
                  <Card className="p-6 border-2">
                    <h3 className="text-lg font-bold mb-4">Subject Analysis</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Subject Line
                        </p>
                        <p className="text-sm italic">
                          &quot;{result.subject_analysis.subject}&quot;
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Spam Keywords
                        </p>
                        <p className="font-semibold text-sm">
                          {result.subject_analysis.spam_keyword_count} detected
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Assessment
                        </p>
                        <p
                          className={`font-semibold text-sm ${
                            result.subject_analysis.is_suspicious
                              ? "text-red-600 dark:text-red-400"
                              : "text-green-600 dark:text-green-400"
                          }`}
                        >
                          {result.subject_analysis.reason}
                        </p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* Content Analysis */}
            <Card className="p-8 border-2">
              <h3 className="text-xl font-bold mb-4">Content Analysis</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Grammar Score</p>
                  <p className="text-2xl font-bold">
                    {result.grammar_score}/100
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Author Style</p>
                  <p className="font-semibold">
                    {result.content_analysis.author_style}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Confidence</p>
                  <p className="text-2xl font-bold">
                    {(result.confidence * 100).toFixed(0)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fraud Signals</p>
                  <p className="font-semibold">
                    {result.content_analysis.fraud_signals.length}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8 border-2">
              <h3 className="text-xl font-bold mb-4">
                Signal Detection Matrix
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(result.detected_signals).map(
                  ([signal, detected]) => (
                    <div
                      key={signal}
                      className={`p-3 rounded-lg border ${
                        detected
                          ? "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700"
                          : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <p className="text-sm font-medium capitalize">
                        {signal.replace(/_/g, " ")}
                      </p>
                      <p
                        className={`text-xs ${
                          detected
                            ? "text-red-600 dark:text-red-400"
                            : "text-gray-500"
                        }`}
                      >
                        {detected ? "Detected" : "Not Detected"}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </Card>

            {/* Recommendations */}
            <Card className="p-8 border-2 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
              <h3 className="text-xl font-bold mb-4">Recommended Actions</h3>
              <ul className="space-y-3">
                {result.recommended_action.map((action, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span className="font-medium">{action}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Unique Features Showcase */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></div>
                  <p className="text-xs uppercase tracking-wider text-purple-700 dark:text-purple-300 font-bold">
                    Email Intel
                  </p>
                </div>
                <p className="font-semibold text-sm text-purple-900 dark:text-purple-100">
                  Sender Analysis
                </p>
                <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                  Domain reputation check with trusted/suspicious sender
                  detection.
                </p>
              </Card>

              <Card className="p-4 border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  <p className="text-xs uppercase tracking-wider text-blue-700 dark:text-blue-300 font-bold">
                    Content AI
                  </p>
                </div>
                <p className="font-semibold text-sm text-blue-900 dark:text-blue-100">
                  Semantic Analysis
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Deep content analysis with subject and body fraud detection.
                </p>
              </Card>

              <Card className="p-4 border-2 border-pink-200 dark:border-pink-800 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/30 dark:to-pink-900/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-pink-600"></div>
                  <p className="text-xs uppercase tracking-wider text-pink-700 dark:text-pink-300 font-bold">
                    Google Verify
                  </p>
                </div>
                <p className="font-semibold text-sm text-pink-900 dark:text-pink-100">
                  Cross-Validation
                </p>
                <p className="text-xs text-pink-700 dark:text-pink-300 mt-1">
                  One-click Google search verification for instant validation.
                </p>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
