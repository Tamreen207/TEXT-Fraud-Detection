# FraudGuard Score Calculation Guide

This document explains how **Risk Score** and **Grammar Score** are calculated throughout the FraudGuard application.

---

## 🎯 Risk Score Calculation (0-100)

The risk score is calculated through **two main methods**:

### 1. Backend AI Calculation (`backend/ai_modules/text_classifier.py`)

The backend uses a **signal-based scoring system** with weighted values:

#### Signal Detection & Score Breakdown:

| Signal Type                 | Base Score | Description                                                |
| --------------------------- | ---------- | ---------------------------------------------------------- |
| **Urgency**                 | 12-22      | Words like "urgent", "immediately", "blocked", "suspended" |
| **Financial Lure**          | 18-32      | Words like "won", "prize", "lottery", "earn", "₹", "lakh"  |
| **Impersonation**           | 20-36      | Bank names, authority, government references               |
| **Credential Theft**        | 32-45      | Requests for OTP, password, KYC, verify                    |
| **Suspicious URL**          | 10 (base)  | + URL shorteners, high-risk TLDs                           |
| **Social Engineering**      | 12-28      | Emotional manipulation tactics                             |
| **Crypto Investment**       | 18-35      | Bitcoin, guaranteed returns, investment schemes            |
| **Threat/Extortion**        | 28-48      | Blackmail, data leak threats                               |
| **Job Scam**                | 14-30      | Work from home, easy money, upfront fees                   |
| **Spam Marketing**          | 6-14       | Bulk promotional messaging                                 |
| **UPI/Payment Fraud**       | 10-20      | Payment app references in scam context                     |
| **Tech Support Scam**       | 10-22      | Fake refunds, overpayment schemes                          |
| **Romance Fraud**           | 15-35      | Emotional manipulation + money requests                    |
| **Money Transfer**          | 16-32      | Explicit money transfer requests                           |
| **Spelling/Grammar Issues** | 3-15       | Typos + grammar mistakes                                   |

#### Scoring Algorithm:

```python
# 1. Start with base signal scores
total_score = sum(all_detected_signal_scores)

# 2. Apply signal count multiplier
if detected_signals >= 4:
    total_score *= 1.25  # 25% increase
elif detected_signals == 3:
    total_score *= 1.12  # 12% increase

# 3. Apply category floor (minimum score for certain fraud types)
category_floors = {
    "Phishing Attempt": 70,
    "Extortion/Blackmail": 85,
    "Romance Scam": 75,
    "Urgent Phishing": 75,
    "Job Fraud": 65,
    # ... etc
}
total_score = max(total_score, category_floor)

# 4. Apply context adjustments
# - Safe context detected: -12 points
# - Technical/educational content: cap at 20 points
# - Combined signals (e.g., job scam + financial lure): +8 bonus

# 5. Cap between 0-100
risk_score = min(100, max(0, total_score))
```

#### Risk Level Mapping:

- **Critical**: 75-100
- **High**: 55-74
- **Suspicious**: 35-54
- **Safe**: 0-34

---

### 2. Frontend Enhanced Calculation (`frontend/app/results/page.tsx`)

The frontend calculates **Advanced Risk Factors** for psychological analysis:

```typescript
// Urgency Pressure Score (0-100)
urgencyPressure = min(100, urgencyWordCount * 30);

// Financial Lure Score (0-100)
financialLure = min(100, moneyWordCount * 25);

// Credential Theft Risk (0-100)
credentialTheft = min(100, credentialWordCount * 40);

// Overall Manipulation Score (0-100)
manipulationScore = min(100, (urgency + money + credential) * 15);
```

**Analyzed Word Lists:**

- **Urgency**: urgent, immediately, asap, now, hurry, expire, limited
- **Money**: cash, prize, reward, refund, payment, win, lottery
- **Credentials**: password, otp, pin, verify, confirm, account

---

## 📝 Grammar Score Calculation (0-100)

Grammar score measures text quality and detects scam-like writing patterns.

### Frontend Enhanced Grammar Score (`frontend/app/results/page.tsx`)

```typescript
// Start with perfect score
let score = 100;

// Apply penalties:

// 1. All Caps Abuse (-15 points)
if (text === text.toUpperCase() && length > 20) {
    score -= 15;
}

// 2. Excessive Punctuation (-5 per instance)
excessive_punct = text.match(/[!?]{2,}/g).length;
score -= excessive_punct * 5;

// 3. Common Scam Grammar Mistakes (-8 each)
scam_patterns = [
    /\b(u r|ur)\b/i,      // "u r" instead of "you are"
    /\b(pls|plz)\b/i,     // "pls" instead of "please"
    /\b(msg|msgs)\b/i,    // "msg" instead of "message"
    /\bcongrat\b/i,       // "congrat" instead of "congratulations"
    /\bwin ned\b/i,       // "win ned" instead of "won"
    /\b(yr|yrs)\b/i,      // "yr" instead of "year"
];
score -= pattern_matches * 8;

// 4. Inconsistent Spacing (-10 points)
if (text has double spaces, space before comma/period) {
    score -= 10;
}

// 5. Proper Capitalization Bonus (+5 points)
if (80%+ sentences start with capital letter) {
    score += 5;
}

// Final score clamped between 0-100
grammar_score = max(0, min(100, score));
```

### Backend Grammar Analysis (`backend/ai_modules/text_classifier.py`)

```python
def _analyze_text_quality(text):
    grammar = {
        "score": 100,
        "typos": [],
        "grammar_issues": [],
    }

    # Detect typos
    typo_words = ["plzzz", "immeditly", "ur", "gonna", "blcked"]
    typos = [word for word in typo_words if word in text.lower()]

    # Detect gibberish words (5+ letters, no vowels)
    for word in text.split():
        clean = re.sub(r'[^a-z]', '', word.lower())
        if len(clean) >= 5 and not re.search(r'[aeiou]', clean):
            typos.append(word)

    # Detect excessive punctuation
    excessive = len(re.findall(r'[!?]{2,}', text))

    # Detect CAPS abuse
    caps = len(re.findall(r'\b[A-Z]{4,}\b', text))

    # Calculate score reduction
    total_errors = len(typos) + excessive + (caps if caps > 2 else 0)
    error_penalty = (len(typos) * 2) + (excessive * 5) + (caps * 3)

    grammar["score"] = max(20, 100 - error_penalty)
    grammar["typos"] = typos

    return grammar
```

---

## 🔗 Link Threat Level Calculation

**Frontend Link Analysis** (`frontend/app/results/page.tsx`):

```typescript
// Extract all URLs from text
urls = text.match(url_pattern);

// Check threat indicators
hasShortener = urls.includes("bit.ly", "tinyurl", "goo.gl", etc);
hasSuspiciousTLD = urls.includes(".tk", ".ml", ".ga", ".xyz", etc);
hasIPAddress = urls.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/);

// Determine threat level
if (hasIPAddress || (hasShortener && hasSuspiciousTLD)):
    linkThreatLevel = "Critical"
elif (hasShortener || hasSuspiciousTLD):
    linkThreatLevel = "High"
elif (urls.length > 3):
    linkThreatLevel = "Medium"
else:
    linkThreatLevel = "Low"
```

---

## 📊 Summary

### Risk Score = Backend AI Signals + Frontend Context Analysis

- **Backend**: Weighted signal detection (0-100)
- **Multipliers**: Signal count, category floors, context adjustments
- **Frontend**: Psychological risk factors (urgency, money, credentials)

### Grammar Score = Text Quality Analysis

- **Frontend**: Pattern-based penalties and bonuses (0-100)
- **Backend**: Typo detection, gibberish, caps abuse, punctuation
- **Lower scores** indicate scam-like writing quality

### Link Threat Level = URL Risk Assessment

- **Critical**: IP addresses + shorteners with suspicious TLDs
- **High**: URL shorteners OR suspicious TLDs
- **Medium**: Multiple URLs (>3)
- **Low**: Normal URLs

---

## 🎨 Visual Indicators

**Risk Score Colors:**

- 🟢 Safe (0-34): Green
- 🟡 Suspicious (35-54): Yellow
- 🟠 High (55-74): Orange
- 🔴 Critical (75-100): Red

**Grammar Score Colors:**

- 🟢 Excellent (80-100): Green
- 🟡 Fair (60-79): Yellow
- 🔴 Poor (0-59): Red

---

## 📁 Key Files

1. **Backend Risk Calculation**: `/backend/ai_modules/text_classifier.py`
2. **Frontend Enhanced Scores**: `/frontend/app/results/page.tsx`
3. **Test/Dev Calculation**: `/test_fraud_system.py`
4. **Advanced Features**: `/frontend/lib/advancedFraudFeatures.ts`

---

_Last Updated: March 7, 2026_
