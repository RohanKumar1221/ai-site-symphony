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
    systemPrompt: `You are a web architect. Analyze requirements and define structure, sections, and layout. Focus on:
- Page structure and hierarchy
- Component breakdown
- Information architecture
- User flow
Provide a brief response (2-3 sentences) about the structure you recommend.`,
  },
  {
    name: "Designer",
    systemPrompt: `You are a UI/UX designer. Define visual direction based on the structure. Focus on:
- Color palette and typography
- Visual hierarchy
- Spacing and layout principles
- Modern UI component styles
Provide a brief response (2-3 sentences) about the design direction.`,
  },
  {
    name: "Frontend",
    systemPrompt: `You are a frontend developer. Recommend the best implementation approach. Focus on:
- HTML structure and semantic markup
- CSS styling approach
- Component patterns
- Responsive design
Provide a brief response (2-3 sentences) about implementation.`,
  },
  {
    name: "Backend",
    systemPrompt: `You are a backend developer. Identify any backend requirements. Focus on:
- Form handling needs
- Data storage requirements
- API integrations needed
- Security considerations
Provide a brief response (2-3 sentences) about backend needs.`,
  },
  {
    name: "Optimizer",
    systemPrompt: `You are a performance optimizer. Ensure the final result is optimal. Focus on:
- Performance optimizations
- SEO considerations
- Accessibility requirements
- Best practices
Provide a brief response (2-3 sentences) about optimizations.`,
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

async function generateFinalCode(prompt: string, discussion: { agent: string; message: string }[], references: string[]): Promise<string> {
  const discussionSummary = discussion.map((d) => `${d.agent}: ${d.message}`).join("\n");
  const referenceInfo = references.length > 0 ? `\n\nREFERENCE FILES PROVIDED:\n${references.join("\n")}` : "";

  const codePrompt = `Based on the following user request and team discussion, generate a complete, professional HTML website with embedded CSS and JavaScript.

USER REQUEST: ${prompt}${referenceInfo}

TEAM DISCUSSION:
${discussionSummary}

CRITICAL REQUIREMENTS:
1. Generate a complete, single-file HTML website
2. Must be fully responsive and mobile-friendly
3. Use modern, professional styling with CSS variables
4. Include smooth animations and transitions
5. Use semantic HTML5 elements
6. Include a beautiful, cohesive color scheme
7. Have proper typography hierarchy
8. DO NOT include any comments mentioning AI, generated, or any tool names
9. DO NOT include any meta tags or comments about how the code was created
10. Make it look like hand-crafted professional code
11. Use realistic company/brand names if needed (not placeholder text)

Return ONLY the clean HTML code starting with <!DOCTYPE html>. No explanations, no markdown, no comments about generation.`;

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
          content: "You are an expert web developer creating production-ready websites. Generate clean, professional HTML/CSS/JS code. Never include comments about AI, generation tools, or how the code was made. The code should look like it was written by a professional developer. Return only code, no markdown formatting.",
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
  
  // Clean up code - remove markdown and any AI-related comments
  code = code.replace(/```html\n?/g, "").replace(/```\n?/g, "").trim();
  code = code.replace(/<!--.*?(AI|Generated|Lovable|GPT|Claude|Gemini|automated|auto-generated).*?-->/gi, "");
  code = code.replace(/\/\*.*?(AI|Generated|Lovable|GPT|Claude|Gemini|automated|auto-generated).*?\*\//gi, "");
  code = code.replace(/\/\/.*?(AI|Generated|Lovable|GPT|Claude|Gemini|automated|auto-generated).*$/gmi, "");
  
  return code;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, references = [] } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Starting website generation for prompt:", prompt);
    if (references.length > 0) {
      console.log("References provided:", references);
    }

    // Run agent discussions
    const discussion: { agent: string; message: string }[] = [];
    let conversationContext = `Website Request: ${prompt}\n\n`;
    
    if (references.length > 0) {
      conversationContext += `Reference materials provided: ${references.join(", ")}\n\n`;
    }

    for (const agent of AGENTS) {
      console.log(`Getting response from ${agent.name}...`);
      
      const agentPrompt = `${conversationContext}\nBased on the request and any previous team inputs, provide your ${agent.name} perspective.`;
      const response = await callAI(agent.systemPrompt, agentPrompt);
      
      discussion.push({ agent: agent.name, message: response });
      conversationContext += `${agent.name}: ${response}\n\n`;
    }

    console.log("Team discussion complete, generating code...");

    // Generate final code
    const code = await generateFinalCode(prompt, discussion, references);

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
