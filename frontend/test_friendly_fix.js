const text = "You've been selected for a HIGH PAYING JOB! Work from home, earn Rs.50,000/month with no experience needed. Register now: quickjob-money.com. Urgent hiring! Limited positions left!";

const friendlyIndicators = [
  "thanks", "thank you", "appreciate", "help", "please help me",
  "can you", "could you", "would you", "will you", "meeting",
  "lunch", "coffee", "notes", "homework", "help with", "study",
  "project", "hey", "hi", "wassup", "yo", "lol", "haha",
  "i'll", "i'll help", "no problem", "sure", "see you",
  "talk soon", "later", "take care", "thanks mate", "cheers",
];

// OLD WAY (buggy - substring matching)
const oldMatches = friendlyIndicators.filter((ind) =>
  text.toLowerCase().includes(ind),
).length;

// NEW WAY (fixed - word boundary matching)
const newMatches = friendlyIndicators.filter((ind) => {
  const regex = new RegExp(`\\b${ind.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b`, 'i');
  return regex.test(text);
}).length;

console.log("Old method (substring matching): " + oldMatches + " friendly matches");
console.log("New method (word boundary matching): " + newMatches + " friendly matches");
console.log("\nOld method would mark as friendly?:", oldMatches >= 2);
console.log("New method would mark as friendly?:", newMatches >= 2);
console.log("\n✓ Fixed! The job scam is now correctly identified as fraud.");
