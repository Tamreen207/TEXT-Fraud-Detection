/**
 * Demo Image Generator
 * Generates demo images with text for OCR and fraud detection testing
 */

export interface DemoImageConfig {
  text: string;
  type: "safe" | "scam" | "otp";
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
}

/**
 * Generates a demo image as a Blob with the specified text
 */
export async function generateDemoImage(
  config: DemoImageConfig,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas context not available");
  }

  // Set canvas dimensions
  canvas.width = 800;
  canvas.height = 600;

  // Background
  ctx.fillStyle =
    config.backgroundColor || (config.type === "scam" ? "#FFF5F5" : "#F0FFF4");
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add border
  ctx.strokeStyle = config.type === "scam" ? "#DC2626" : "#10B981";
  ctx.lineWidth = 4;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

  // Text styling
  ctx.fillStyle = config.textColor || "#1F2937";
  ctx.font = `${config.fontSize || 24}px Arial, sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  // Word wrap text
  const maxWidth = canvas.width - 80;
  const lineHeight = (config.fontSize || 24) * 1.4;
  const words = config.text.split(" ");
  let lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    const testLine = currentLine + (currentLine ? " " : "") + word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  // Draw text
  let y = 60;
  lines.forEach((line) => {
    ctx.fillText(line, 40, y);
    y += lineHeight;
  });

  // Add watermark
  ctx.font = "14px Arial";
  ctx.fillStyle = "#9CA3AF";
  ctx.textAlign = "center";
  ctx.fillText("FraudGuard Demo Image", canvas.width / 2, canvas.height - 30);

  // Convert to Blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Failed to create image blob"));
      }
    }, "image/png");
  });
}

/**
 * Get predefined demo image configs
 */
export const DEMO_IMAGES: Record<string, DemoImageConfig> = {
  safe: {
    type: "safe",
    text: "Hi Team, the project meeting is scheduled for tomorrow at 2 PM. Please review the presentation slides and come prepared with your updates. Looking forward to discussing the Q2 roadmap. Best regards, Sarah",
    backgroundColor: "#F0FDF4",
    textColor: "#166534",
    fontSize: 22,
  },
  scam: {
    type: "scam",
    text: "URGENT ALERT! Your bank account has been BLOCKED due to suspicious activity. You must verify your account IMMEDIATELY by providing your OTP and password. Click this link now or your account will be permanently closed within 24 hours! Verify: bit.ly/verify-urgent-4829",
    backgroundColor: "#FEF2F2",
    textColor: "#991B1B",
    fontSize: 22,
  },
  otp: {
    type: "otp",
    text: "Security Alert! We detected unusual login from unknown device. Your account is temporarily suspended. Please share the OTP code sent to your phone IMMEDIATELY to restore access. This is time-sensitive. Reply with: OTP code + Password + Date of Birth",
    backgroundColor: "#FFF7ED",
    textColor: "#9A3412",
    fontSize: 22,
  },
  lottery: {
    type: "scam",
    text: "CONGRATULATIONS!!! You have WON $50,000 in our monthly lottery draw! Claim your prize now by paying a small processing fee of $500. Send payment details urgently to claim@lottery-winner.tk Limited time offer!",
    backgroundColor: "#FEF3C7",
    textColor: "#92400E",
    fontSize: 20,
  },
  job: {
    type: "scam",
    text: "Amazing Job Opportunity! Work from home and earn $10,000/month! No experience needed. Just pay $200 registration fee to get started. Contact us ASAP at jobs-easy-money@gmail.com",
    backgroundColor: "#FEE2E2",
    textColor: "#7F1D1D",
    fontSize: 21,
  },
};

/**
 * Create a File object from demo config
 */
export async function createDemoFile(demoType: string): Promise<File> {
  const config = DEMO_IMAGES[demoType];
  if (!config) {
    throw new Error(`Unknown demo type: ${demoType}`);
  }

  const blob = await generateDemoImage(config);
  return new File([blob], `demo-${demoType}.png`, { type: "image/png" });
}
