#!/usr/bin/env python3
"""
Edge Case Testing for Fraud Detection System
Tests additional scenarios to ensure robustness
"""

import re

def analyze_text(text):
    """Analyze text for fraud signals"""
    result = {
        "text": text,
        "risk_score": 0,
        "risk_level": "Safe",
        "grammar_score": 100,
        "fraud_types": [],
        "detected_signals": [],
        "link_analysis": None,
        "explanation": ""
    }
    
    text_lower = text.lower()
    text_length = len(text.split())
    
    # Friendly message detection
    friendly_words = ["thank you", "thanks", "appreciate", "can you", "help", "meeting", "notes", "lunch", "coffee"]
    friendly_count = sum(1 for word in friendly_words if word in text_lower)
    is_friendly = friendly_count >= 2
    
    # Signal detection
    score = 0
    signals = []
    
    # Urgency (15 points)
    urgency_words = ["urgent", "immediately", "blocked", "suspended", "now", "asap", "today", "tonight", "expire", "deadline"]
    if any(word in text_lower for word in urgency_words) and not is_friendly:
        score += 15
        signals.append("urgency")
    
    # Financial lure (20 points)
    financial_words = ["won", "winner", "prize", "lottery", "earn", "money", "cash", "lakh", "crore", "free money", "bonus"]
    if any(word in text_lower for word in financial_words) and not is_friendly:
        score += 20
        signals.append("financial_lure")
        result["fraud_types"].append("Financial Scam")
    
    # Impersonation (35 points)
    bank_words = ["sbi", "hdfc", "icici", "axis", "bank", "paypal", "paytm", "google pay", "phonepe"]
    if any(word in text_lower for word in bank_words) and not is_friendly:
        score += 35
        signals.append("impersonation")
        result["fraud_types"].append("Impersonation")
    
    # Credential theft (30 points)
    credential_words = ["kyc", "verify", "otp", "password", "bank details", "enter your", "confirm", "update details"]
    if any(word in text_lower for word in credential_words) and not is_friendly:
        score += 30
        signals.append("credential_theft")
        result["fraud_types"].append("Credential Theft")
    
    # Link verification (25 points for dangerous)
    urls = re.findall(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', text)
    if urls:
        url = urls[0]
        domain = url.replace("http://", "").replace("https://", "").split("/")[0]
        
        # Check for dangerous patterns
        dangerous_patterns = ["bit.ly", "tinyurl", ".xyz", ".tk", ".ml", "-verify", "-secure", "-update"]
        is_dangerous = any(pattern in url.lower() for pattern in dangerous_patterns)
        
        # Check for safe domains
        safe_domains = ["google.com", "github.com", "stackoverflow.com", "wikipedia.org", "sbi.co.in"]
        is_safe = any(safe in url.lower() for safe in safe_domains)
        
        if is_dangerous and not is_safe:
            score += 25
            signals.append("suspicious_url")
            result["fraud_types"].append("Suspicious Link")
            result["link_analysis"] = {"domain": domain, "reputation": "Dangerous"}
        elif not is_safe:
            score += 10
            signals.append("suspicious_url")
            result["link_analysis"] = {"domain": domain, "reputation": "Suspicious"}
        else:
            result["link_analysis"] = {"domain": domain, "reputation": "Safe"}
    
    # Job scam (22 points)
    job_words = ["work from home", "part time", "earn daily", "no investment", "side income", "flexible"]
    job_matches = sum(1 for word in job_words if word in text_lower)
    if job_matches >= 2 and not is_friendly:
        score += 22
        signals.append("job_scam")
        result["fraud_types"].append("Job Scam")
    
    # Extortion (40 points)
    extortion_words = ["hack", "recorded", "webcam", "bitcoin", "expose", "leak", "blackmail"]
    extortion_matches = sum(1 for word in extortion_words if word in text_lower)
    if extortion_matches >= 3:
        score += 40
        signals.append("threat_extortion")
        result["fraud_types"].append("Extortion")
    
    # Grammar/spelling analysis
    typo_words = ["plz", "ur", "u ", "gonna", "wanna", "cud", "shud", "thx", "txt"]
    typo_count = sum(1 for word in typo_words if word in text_lower)
    
    # Gibberish detection
    words = text.split()
    gibberish_count = 0
    for word in words:
        clean_word = re.sub(r'[^a-z]', '', word.lower())
        if len(clean_word) >= 5:
            vowels = len(re.findall(r'[aeiou]', clean_word))
            if vowels == 0:
                gibberish_count += 1
    
    # Excessive punctuation
    excessive_punct = len(re.findall(r'[!?]{2,}', text))
    
    # CAPS abuse
    caps_words = len(re.findall(r'\b[A-Z]{4,}\b', text))
    
    total_errors = typo_count + gibberish_count + excessive_punct + (caps_words if caps_words > 2 else 0)
    
    if total_errors > 0:
        score += min(15, total_errors * 3)
        signals.append("spelling_grammar_issues")
        
        # Calculate grammar score
        error_score = (typo_count * 2) + (gibberish_count * 10) + (excessive_punct * 5) + (caps_words * 3)
        error_ratio = error_score / max(10, text_length)
        result["grammar_score"] = max(20, 100 - int(error_ratio * 15))
    
    # Apply multiplier for multiple signals
    detected_count = len(signals)
    if detected_count >= 4:
        score = int(score * 1.4)
    elif detected_count >= 3:
        score = int(score * 1.2)
    elif detected_count >= 2:
        score = int(score * 1.1)
    
    # Reduce for friendly messages
    if is_friendly and score < 30:
        score = 5
    
    # Cap at 100
    score = min(100, score)
    
    # Determine risk level
    if score >= 75:
        result["risk_level"] = "Critical"
    elif score >= 55:
        result["risk_level"] = "High"
    elif score >= 35:
        result["risk_level"] = "Suspicious"
    else:
        result["risk_level"] = "Safe"
    
    result["risk_score"] = score
    result["detected_signals"] = signals
    
    if not result["fraud_types"]:
        result["fraud_types"] = ["None"] if result["risk_level"] == "Safe" else ["Possible Scam"]
    
    return result

def print_result(test_name, result):
    """Print formatted test result"""
    print(f"\n{'='*80}")
    print(f"TEST: {test_name}")
    print(f"{'='*80}")
    print(f"Text: \"{result['text'][:100]}{'...' if len(result['text']) > 100 else ''}\"")
    print(f"\n📊 ANALYSIS:")
    print(f"   Risk Score: {result['risk_score']}/100")
    print(f"   Risk Level: {result['risk_level']}")
    print(f"   Grammar Score: {result['grammar_score']}/100")
    print(f"   Fraud Types: {', '.join(result['fraud_types'])}")
    print(f"   Detected Signals: {', '.join(result['detected_signals']) if result['detected_signals'] else 'None'}")
    
    if result["link_analysis"]:
        print(f"\n🔗 LINK ANALYSIS:")
        print(f"   Domain: {result['link_analysis']['domain']}")
        print(f"   Reputation: {result['link_analysis']['reputation']}")

# Edge case tests
print("\n🧪 FRAUD DETECTION SYSTEM - EDGE CASE TESTING")
print("="*80)

# Test 1: Safe message with link
test1 = analyze_text("Check out this article on Wikipedia: https://en.wikipedia.org/wiki/Machine_learning")
print_result("Safe Message with Legitimate Link", test1)

# Test 2: Aggressive marketing (not fraud)
test2 = analyze_text("FLASH SALE! 50% OFF on all items! Limited time offer! Shop now at www.amazon.com")
print_result("Aggressive Marketing (Borderline)", test2)

# Test 3: Technical support scam
test3 = analyze_text("Your Microsoft Windows license has expired. Call our tech support immediately at 1800-FAKE-NUM to renew or your computer will be locked!")
print_result("Tech Support Scam", test3)

# Test 4: Romance scam
test4 = analyze_text("Hello dear, I'm stuck in another country and need money urgently. Please send $5000 to help me. I will pay you back when I return. Trust me.")
print_result("Romance/Social Engineering Scam", test4)

# Test 5: Crypto investment scam
test5 = analyze_text("🚀 Invest in Bitcoin now! Guaranteed 300% returns in 30 days! Limited slots available. Click here: https://crypto-millionaire.xyz/invest")
print_result("Crypto Investment Scam", test5)

# Test 6: Casual text with slang
test6 = analyze_text("sup dude! wanna grab lunch later? lemme know if ur free")
print_result("Casual Slang Message (Should be Safe)", test6)

# Test 7: Professional email
test7 = analyze_text("Dear Colleague, Please find attached the quarterly report. Let me know if you have any questions. Best regards, John")
print_result("Professional Email (Should be Safe)", test7)

# Test 8: UPI fraud
test8 = analyze_text("Amount of Rs 50,000 debited from your account. To reverse this transaction, please share your UPI PIN immediately on this number.")
print_result("UPI Fraud", test8)

print(f"\n{'='*80}")
print("✅ ALL EDGE CASE TESTS COMPLETED")
print(f"{'='*80}\n")
