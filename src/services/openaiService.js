import OpenAI from "openai";
import { getKnowledge } from "../knowledge_base/index.js";

// const openai = new OpenAI({
//   apiKey:
//     "sk-prloj-kKhu1iDT4WgWp29AJyHMKLAq6jc6hH1MuXkE_nn1mvPbP5NGNipraDPtuhMJZfamKhHLJ8E96zT3BlbkFJy-9yu-dBDsy-Z3vg0rMCTdmZ7pClnNxphVm3O-ZYRtGRs5ifyASsW5gTSt78q61uFj1m4zT6YA",
// });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const FAQ_KNOWLEDGE = getKnowledge(["LAYER_1_CORE_FAQ"]);

// FAQ Knowledge Base - ReferMe specific
const DASHBOARD_BUDDY_PROMPT = `
You are **Dashboard Buddy**, the official AI assistant for **ReferMe Business Portfolio Managers (BPMs)**.

---

### ROLE & PURPOSE
Your job is to support BPMs by providing accurate, concise, and friendly answers **only** based on the information in this FAQ.

If a question is not covered in the FAQ, you must respond with:
> "I don't have that information yet. Please check the Help Center or contact support."

---

### RESPONSE GUIDELINES
1. **Identity**: Always introduce or refer to yourself as *Dashboard Buddy*.
2. **Tone**: Professional, supportive, and approachable — never robotic or overly casual.
3. **Source Limitation**: Only use the FAQ below. Do not make assumptions or add external info.
4. **Prohibited Topics**: Do not make legal, medical, or financial claims.
5. **Format**: Use clear, complete sentences. Keep responses short and focused (2–4 sentences).
6. **Fallback**: If unsure, refer users to the Help Center or support team.

${FAQ_KNOWLEDGE}

`;

// Estimate token count (rough approximation)
function estimateTokens(text) {
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

// Generate chat response
export async function generateChatResponse(messages) {
  try {
    const systemMessage = {
      role: "system",
      content: DASHBOARD_BUDDY_PROMPT,
    };

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Fast and cost-effective
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0].message.content;
    const tokensUsed = completion.usage.total_tokens;

    // Check if answer indicates unknown question
    const isUnknownQuestion = response.includes("don't have that information");

    return {
      response,
      tokensUsed,
      isUnknownQuestion,
    };
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw new Error("Failed to generate response");
  }
}

// Calculate cost based on tokens (GPT-4o-mini pricing)
export function calculateCost(tokens) {
  // GPT-4o-mini: $0.150 per 1M input tokens, $0.600 per 1M output tokens
  // Simplified: average $0.375 per 1M tokens
  const costPerToken = 0.375 / 1000000;
  return tokens * costPerToken;
}

export { estimateTokens };