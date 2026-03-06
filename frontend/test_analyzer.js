// Import the analyzer function
const text = "You've been selected for a HIGH PAYING JOB! Work from home, earn Rs.50,000/month with no experience needed. Register now: quickjob-money.com. Urgent hiring! Limited positions left!";

const lowerText = text.toLowerCase();

// Check friendly keywords
const friendlyIndicators = [
  "thanks", "thank you", "appreciate", "help", "please help me",
  "can you", "could you", "would you", "will you", "meeting",
  "lunch", "coffee", "notes", "homework", "help with", "study",
  "project", "hey", "hi", "wassup", "yo", "lol", "haha",
];

const friendlyMatches = friendlyIndicators.filter((ind) =>
  lowerText.includes(ind),
).length;

console.log("Friendly keyword matches:", friendlyMatches);
console.log("Is friendly message?:", friendlyMatches >= 2);

// Check if it would skip risk calculation
const fraudTypes = [];
const detectedSignals = {
  urgency: lowerText.includes("urgent") || lowerText.includes("immediately"),
  suspicious_url: text.includes("quickjob-money.com"),
};

console.log("\nDetected signals:");
console.log("- urgency:", detectedSignals.urgency);
console.log("- suspicious_url:", detectedSignals.suspicious_url);

const isFriendlyMessage = friendlyMatches >= 2;

// Now check if the riskScore calculation logic would trigger
const skipCalculation = (
  !isFriendlyMessage &&
  fraudTypes.length === 0 &&
  !detectedSignals.urgency &&
  !detectedSignals.suspicious_url
);

console.log("\nWould skip risk calculation?:", skipCalculation);
console.log("This means risk score would be set to:", skipCalculation ? "5" : "calculateRiskScore()");
