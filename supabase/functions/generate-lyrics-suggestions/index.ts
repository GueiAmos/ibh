
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { currentText, context } = await req.json();
    
    const geminiApiKey = 'AIzaSyBo3gNMAfmFBesB82lcNaa8AN-cqEN5UE0';
    
    const prompt = `Tu es un assistant créatif spécialisé dans l'écriture de paroles de chanson en français. 
    
Contexte actuel: ${context || 'chanson générale'}
Texte actuel: "${currentText}"

Propose 3 suggestions créatives pour continuer cette ligne de paroles. Les suggestions doivent:
- Être en français
- Respecter le flow et le rythme
- Être cohérentes avec le contexte
- Être créatives et originales
- Faire environ 1-2 lignes chacune

Format de réponse: retourne uniquement un tableau JSON avec 3 suggestions sous forme de strings.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 1000,
        }
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${data.error?.message || 'Unknown error'}`);
    }

    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('No text generated from Gemini');
    }

    // Try to parse as JSON, fallback to simple suggestions
    let suggestions;
    try {
      suggestions = JSON.parse(generatedText);
    } catch {
      // If not valid JSON, create suggestions from the text
      const lines = generatedText.split('\n').filter(line => line.trim());
      suggestions = lines.slice(0, 3).map(line => line.replace(/^\d+\.?\s*/, '').trim());
    }

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-lyrics-suggestions function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
