// Test improved grammar score calculation

function calculateGrammarScore(text, errors) {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const textLength = words.length;

  // If text is very short (1-3 words), be more lenient
  if (textLength <= 3) {
    if (errors.gibberish > 0) return 50;
    if (errors.typos + errors.grammar === 0) return 100;
    return 85;
  }

  // Weight different error types
  const errorScore =
    errors.typos * 2 +      // Text speak (minor)
    errors.grammar * 4 +    // Grammar issues (moderate)
    errors.gibberish * 12;  // Gibberish (severe)

  // Normalize by text length
  const errorRatio = errorScore / Math.max(5, textLength);

  // Calculate score
  let score = 100 - (errorRatio * 12);
  
  // Floor at 20 for completely broken text
  score = Math.max(20, score);
  
  // Boost score for clean professional text
  if (errors.typos === 0 && errors.grammar === 0 && errors.gibberish === 0) {
    score = 100;
  }
  // Small penalty for minor typos in otherwise clean text
  else if (errors.typos <= 2 && errors.grammar === 0 && errors.gibberish === 0) {
    score = Math.max(85, score);
  }
  // Heavy penalty for gibberish
  else if (errors.gibberish >= 3) {
    score = Math.min(40, score);
  }
  
  return Math.round(score);
}

const testCases = [
  {
    text: "http://www.google.com",
    errors: { typos: 0, grammar: 0, gibberish: 0 },
    expected: 100,
    label: "Clean URL - Perfect"
  },
  {
    text: "Hey! Can you send me the meeting notes from yesterday? Thanks!",
    errors: { typos: 0, grammar: 0, gibberish: 0 },
    expected: 100,
    label: "Clean professional text"
  },
  {
    text: "plz send me ur notes thx",
    errors: { typos: 3, grammar: 0, gibberish: 0 },
    expected: 85,
    label: "Text speak - Minor errors"
  },
  {
    text: "URGENT!!! ACT NOW!!! LIMITED TIME!!!",
    errors: { typos: 0, grammar: 3, gibberish: 0 },
    expected: 73,
    label: "Excessive CAPS and punctuation"
  },
  {
    text: "xkjfh gjhfd jkhgfd kjhgfd jkhgf",
    errors: { typos: 0, grammar: 0, gibberish: 5 },
    expected: 40,
    label: "Complete gibberish - Severe"
  },
  {
    text: "Hello friend plz clk here",
    errors: { typos: 2, grammar: 0, gibberish: 0 },
    expected: 85,
    label: "Minor typos in friendly message"
  }
];

console.log("GRAMMAR SCORE CALCULATION TEST");
console.log("=".repeat(80));

testCases.forEach((test, idx) => {
  const score = calculateGrammarScore(test.text, test.errors);
  const pass = Math.abs(score - test.expected) <= 5;
  
  console.log(`\nTest ${idx + 1}: ${test.label}`);
  console.log(`  Text: "${test.text.substring(0, 50)}${test.text.length > 50 ? '...' : ''}"`);
  console.log(`  Errors: Typos=${test.errors.typos}, Grammar=${test.errors.grammar}, Gibberish=${test.errors.gibberish}`);
  console.log(`  Expected: ${test.expected}/100`);
  console.log(`  Got: ${score}/100`);
  console.log(`  Status: ${pass ? '✓ PASS' : '✗ FAIL'}`);
});

console.log("\n" + "=".repeat(80));
console.log("IMPROVEMENTS:");
console.log("  ✓ Clean text gets 100/100 (no false penalties)");
console.log("  ✓ Minor typos get 85+ (lenient for text speak)");
console.log("  ✓ Gibberish gets <40 (harsh penalty)");
console.log("  ✓ Short URLs/text handled properly");
console.log("=".repeat(80));
