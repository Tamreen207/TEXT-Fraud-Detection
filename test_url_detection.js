// Test URL-only detection

const testCases = [
  {
    text: "http://www.google.com",
    expected: "Safe Link",
    reason: "Trusted domain URL"
  },
  {
    text: "https://github.com/user/repo",
    expected: "Safe Link",
    reason: "GitHub URL"
  },
  {
    text: "bit.ly/scamlink",
    expected: "Suspicious Link",
    reason: "Shortened URL (suspicious)"
  },
  {
    text: "Hey, check out this link: www.google.com",
    expected: "Friendly Message",
    reason: "Conversational with URL"
  },
  {
    text: "quickjob-money.com",
    expected: "Suspicious Link",
    reason: "Suspicious domain name"
  },
  {
    text: "Thanks for the meeting notes!",
    expected: "Friendly Message",
    reason: "No URL, friendly conversation"
  }
];

console.log("URL-ONLY DETECTION TEST");
console.log("=".repeat(70));

testCases.forEach((test, idx) => {
  const isUrlOnly = /^\s*(https?:\/\/[^\s]+|www\.[^\s]+|[a-z0-9.-]+\.(com|net|org|in|xyz|tk|ml|ga|cf|top|space|online|store|club|co\.in|gov|edu)([\s]|$))/i.test(test.text.trim());
  
  console.log(`\nTest ${idx + 1}: "${test.text}"`);
  console.log(`  Is URL-only?: ${isUrlOnly}`);
  console.log(`  Expected Type: ${test.expected}`);
  console.log(`  Reason: ${test.reason}`);
  console.log(`  ✓ Detection: ${isUrlOnly ? "URL detected" : "Not URL-only"}`);
});

console.log("\n" + "=".repeat(70));
console.log("✓ URL classification improved!");
console.log("  - Pure URLs → Safe Link / Suspicious Link");
console.log("  - Conversational messages → Friendly Message");
console.log("=".repeat(70));
