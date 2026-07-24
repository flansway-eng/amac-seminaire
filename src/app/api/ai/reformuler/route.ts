import { NextResponse } from 'next/server';
import { lireParticipant } from '@/lib/session';

export async function POST(request: Request) {
  try {
    // /api est exempté de la redirection du middleware : cette route doit
    // donc vérifier elle-même la session participant.
    const participant = await lireParticipant();
    if (!participant) {
      return NextResponse.json(
        { error: 'Session introuvable — reconnectez-vous via /rejoindre' },
        { status: 401 }
      );
    }

    const isAiEnabled = process.env.AI_ENABLED === 'true';
    const apiKey = process.env.DEEPSEEK_API_KEY;

    const { articleNum, articleTitre, contenuActuel, questionsEtReponses } = await request.json();

    if (!isAiEnabled || !apiKey) {
      // Elegant mock legal fallback when AI is disabled/unconfigured
      const mockRedaction = `Article ${articleNum} (Adopté) : ${articleTitre || 'Fonctionnement'}\n\n` +
        `Conformément aux principes d'équité, de gouvernance moderne et de conformité à la loi n° 60-315, l'association Les Amis de la Musique Afro-Cubaine (AMAC) adopte une rédaction clarifiée. Les instances décisionnelles et opérationnelles sont configurées de manière à garantir l'équilibre des pouvoirs, la représentativité des membres et l'inclusion de tous les collèges d'adhérents.`;
      
      const mockExpose = `Exposé des motifs : Cette formulation résout les ambiguïtés relevées sur l'Article ${articleNum} en supprimant les contradictions textuelles et en introduisant une gestion opérationnelle conforme aux recommandations du séminaire.`;

      return NextResponse.json({
        textePropose: mockRedaction,
        exposeMotifs: mockExpose,
        aiUsed: false,
      });
    }

    // Build the prompt for DeepSeek
    const prompt = `Vous êtes un juriste expert du droit des associations en Côte d'Ivoire (loi n° 60-315 du 21 septembre 1960).
Vous assistez l'association AMAC ("Les Amis de la Musique Afro-Cubaine") dans la réformation de ses textes fondateurs lors de son séminaire national.

Rédigez une proposition de texte amendé (l'article) et un court exposé des motifs pour l'article suivant :
---
ARTICLE D'ORIGINE :
Article ${articleNum} : ${articleTitre || ''}
${contenuActuel}
---
RÉPONSES DU PARTICIPANT AU QUESTIONNAIRE DE MODERNISATION :
${questionsEtReponses.map((qr: any) => `- Question : "${qr.intitule}"\n  Réponse choisie : "${qr.reponseValue}"\n  Commentaire du membre : "${qr.commentaire || 'Aucun'}"`).join('\n')}
---
EXIGENCES :
1. Rédigez le nouvel article dans un style juridique ivoirien formel, clair, précis et rigoureux.
2. Éliminez toute insécurité juridique, contradiction interne ou renvoi erroné.
3. Rédigez l'exposé des motifs de manière concise.

Retournez EXCLUSIVEMENT un objet JSON valide avec les clés suivantes, sans aucun autre texte autour :
{
  "textePropose": "Texte complet du nouvel article rédigé...",
  "exposeMotifs": "Explication claire et synthétique des motifs juridiques et opérationnels du changement..."
}`;

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        max_tokens: 1024,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('DeepSeek API error:', errText);
      throw new Error(`API DeepSeek error: ${response.status}`);
    }

    const resJson = await response.json();
    const replyText = resJson.choices[0].message.content;

    // Parse the JSON response from the model
    // Remove markdown code fences if present
    const cleanJsonText = replyText.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleanJsonText);

    return NextResponse.json({
      textePropose: result.textePropose,
      exposeMotifs: result.exposeMotifs,
      aiUsed: true,
    });
  } catch (error: any) {
    console.error('Error in API /api/ai/reformuler:', error);
    return NextResponse.json(
      { error: "Impossible de générer la reformulation juridique : " + error.message },
      { status: 500 }
    );
  }
}
