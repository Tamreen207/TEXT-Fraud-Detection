import subprocess
import json

message = "You've been selected for a HIGH PAYING JOB! Work from home, earn Rs.50,000/month with no experience needed. Register now: quickjob-money.com. Urgent hiring! Limited positions left!"

test_data = {
    "messages": [
        {
            "id": "test_job_spam",
            "text": message,
            "expected": "HIGH"
        }
    ]
}

# Test via direct JavaScript simulation
test_js = f"""
const text = {json.dumps(message)};
const lowerText = text.toLowerCase();

// Financial keywords
const financialKeywords = [
    "prize", "won", "winner", "lottery", "congratulations", "reward", "cash", "money",
    "transfer", "claim", "lakh", "crore", "million", "free money", "bonus", "crypto",
    "bitcoin", "earn fast", "easy money", "earn", "rupees", "rs.", "salary", "payment",
    "earning", "income", "per month", "per day",
];
const financialMatches = financialKeywords.filter((kw) => lowerText.includes(kw));

// Job keywords
const jobKeywords = [
    "part time", "work from home", "earn daily", "no investment", "quick money",
    "passive income", "side hustle", "flexible job", "high paying", "selected for",
    "hiring", "no experience", "limited positions", "register now", "work from",
    "job opportunity",
];
const jobMatches = jobKeywords.filter((kw) => lowerText.includes(kw));

// Urgency
const urgencyKeywords = ["urgent", "immediately", "act now", "asap", "today", "now"];
const urgencyMatches = urgencyKeywords.filter((kw) => lowerText.includes(kw));

console.log("Text:", text);
console.log("Financial matches:", financialMatches, "Count:", financialMatches.length);
console.log("Job matches:", jobMatches, "Count:", jobMatches.length);
console.log("Urgency matches:", urgencyMatches, "Count:", urgencyMatches.length);

// Simulate detection
let signals = [];
let baseScore = 0;

if (urgencyMatches.length > 0) {{
  signals.push("Urgency");
  baseScore += 15;
}}
if (financialMatches.length > 0) {{
  signals.push("Money");
  baseScore += 20;
}}
if ((jobMatches.length >= 1 && financialMatches.length > 0) || jobMatches.length >= 2) {{
  signals.push("Job Scam");
  baseScore += 22;
}}

console.log("\\nDetected signals:", signals);
console.log("Base score:", baseScore);

// URL check
const urlPattern = /\\b([a-z0-9.-]+\\.(com|net|org|in|xyz|tk|ml|ga|cf|top|space|online|store|club))\\b/gi;
const urls = text.match(urlPattern);
if (urls) {{
  console.log("URLs detected:", urls);
  baseScore += 25; // Suspicious URL
  signals.push("Suspicious Link");
}}

console.log("\\nFinal score:", baseScore);
if (baseScore >= 0 && baseScore <= 34) console.log("Risk Level: SAFE ❌");
if (baseScore >= 35 && baseScore <= 54) console.log("Risk Level: SUSPICIOUS ⚠️");
if (baseScore >= 55 && baseScore <= 74) console.log("Risk Level: HIGH ⚠️⚠️");
if (baseScore >= 75) console.log("Risk Level: CRITICAL 🔴");
"""

print("=" * 60)
print("TESTING JOB SCAM MESSAGE")
print("=" * 60)
print(f"\nMessage: {message}\n")

# Print expected detection
print("JavaScript Simulation:")
print("-" * 60)
import subprocess
result = subprocess.run(['node', '-e', test_js], capture_output=True, text=True)
print(result.stdout)
if result.stderr:
    print("Error:", result.stderr)

print("\n" + "=" * 60)
print("EXPECTED RESULT: HIGH RISK FRAUD (Score >= 55)")
print("=" * 60)
