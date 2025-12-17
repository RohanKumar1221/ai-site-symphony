import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

interface AgentRole {
  name: string;
  systemPrompt: string;
}

const AGENTS: AgentRole[] = [
  {
    name: "Architect",
    systemPrompt: `You are the Architect AI agent. Your role is to analyze the website requirements and define the overall structure, sections, and layout. Focus on:
- Page structure and hierarchy
- Component breakdown
- Information architecture
- User flow considerations
Provide a brief, actionable response (2-3 sentences) about the structure you recommend.`,
  },
  {
    name: "Designer",
    systemPrompt: `You are the Designer AI agent. Your role is to define the visual direction based on the Architect's structure. Focus on:
- Color palette and typography
- Visual hierarchy
- Spacing and layout principles
- UI component styles
Provide a brief, actionable response (2-3 sentences) about the design direction.`,
  },
  {
    name: "Frontend",
    systemPrompt: `You are the Frontend AI agent. Your role is to recommend the best implementation approach. Focus on:
- HTML structure and semantic markup
- CSS framework recommendations
- Component patterns
- Responsive design approach
Provide a brief, actionable response (2-3 sentences) about implementation.`,
  },
  {
    name: "Backend",
    systemPrompt: `You are the Backend AI agent. Your role is to identify any backend requirements. Focus on:
- Form handling needs
- Data storage requirements
- API integrations needed
- Security considerations
Provide a brief, actionable response (2-3 sentences) about backend needs.`,
  },
  {
    name: "Optimizer",
    systemPrompt: `You are the Optimizer AI agent. Your role is to ensure the final result is optimal. Focus on:
- Performance optimizations
- SEO considerations
- Accessibility requirements
- Best practices
Provide a brief, actionable response (2-3 sentences) about optimizations.`,
  },
];

async function callAI(systemPrompt: string, userMessage: string): Promise<string> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("AI API error:", response.status, errorText);
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

async function generateFinalCode(prompt: string, discussion: { agent: string; message: string }[]): Promise<string> {
  const discussionSummary = discussion.map((d) => `${d.agent}: ${d.message}`).join("\n");

  const codePrompt = `Based on the following user request and agent discussion, generate a complete, professional HTML website with embedded CSS and JavaScript.

USER REQUEST: ${prompt}

AGENT DISCUSSION:
${discussionSummary}

Generate a complete, single-file HTML website that:
1. Is fully responsive and mobile-friendly
2. Has modern, professional styling with CSS variables
3. Includes smooth animations and transitions
4. Has all sections properly structured
5. Uses semantic HTML5
6. Includes a beautiful color scheme
7. Has proper typography hierarchy

Return ONLY the HTML code, no explanations. Start with <!DOCTYPE html> and include everything in one file.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: "You are an expert web developer. Generate complete, production-ready HTML/CSS/JS code. Return only code, no markdown formatting or explanations.",
        },
        { role: "user", content: codePrompt },
      ],
      max_tokens: 8000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Code generation error:", response.status, errorText);
    throw new Error(`Code generation error: ${response.status}`);
  }

  const data = await response.json();
  let code = data.choices?.[0]?.message?.content || "";
  
  // Clean up code if wrapped in markdown
  code = code.replace(/```html\n?/g, "").replace(/```\n?/g, "").trim();
  
  return code;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Starting website generation for prompt:", prompt);

    // Run agent discussions
    const discussion: { agent: string; message: string }[] = [];
    let conversationContext = `Website Request: ${prompt}\n\n`;

    for (const agent of AGENTS) {
      console.log(`Getting response from ${agent.name}...`);
      
      const agentPrompt = `${conversationContext}\nBased on the request and any previous agent inputs, provide your ${agent.name} perspective.`;
      const response = await callAI(agent.systemPrompt, agentPrompt);
      
      discussion.push({ agent: agent.name, message: response });
      conversationContext += `${agent.name}: ${response}\n\n`;
    }

    console.log("Agent discussion complete, generating code...");

    // Generate final code
    const code = await generateFinalCode(prompt, discussion);

    console.log("Website generation complete");

    return new Response(
      JSON.stringify({ discussion, code }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-website function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
