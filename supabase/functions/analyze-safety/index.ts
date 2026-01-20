import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image, analysisType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing safety analysis request, type:", analysisType);

    let systemPrompt = "";
    let userPrompt = "";

    switch (analysisType) {
      case "face_recognition":
        systemPrompt = `You are a safety-focused AI assistant. Analyze the provided image for face detection and description. 
        Provide a detailed but concise description that could help identify a person in a safety context.
        Focus on: approximate age range, gender presentation, distinctive features, clothing, and any visible accessories.
        Be objective and factual. This is for personal safety documentation purposes.`;
        userPrompt = "Analyze this image and describe any visible person(s) for safety documentation. Include physical descriptions, clothing, and any identifying features.";
        break;
      
      case "environment_scan":
        systemPrompt = `You are a safety-focused AI assistant. Analyze the provided image for environmental safety concerns.
        Look for: potential hazards, escape routes, number of people present, lighting conditions, and any concerning objects or behaviors.
        Provide actionable safety observations.`;
        userPrompt = "Scan this environment for safety concerns. Identify exits, potential hazards, and describe the setting.";
        break;
      
      case "license_plate":
        systemPrompt = `You are a safety-focused AI assistant. Analyze the provided image for vehicle identification.
        If a license plate is visible, describe it. Also note vehicle make, model, color, and any distinguishing features.
        This is for personal safety documentation.`;
        userPrompt = "Identify any vehicles in this image. Note license plates if visible, along with make, model, color, and distinguishing features.";
        break;
      
      default:
        systemPrompt = `You are a safety-focused AI assistant helping document evidence for personal safety.
        Analyze images thoroughly and provide clear, factual descriptions useful for safety documentation.`;
        userPrompt = "Analyze this image and provide a detailed description for safety documentation purposes.";
    }

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
          { 
            role: "user", 
            content: [
              { type: "text", text: userPrompt },
              { type: "image_url", image_url: { url: image } }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content || "Analysis unavailable";

    console.log("Safety analysis completed");
    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Safety analysis error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
