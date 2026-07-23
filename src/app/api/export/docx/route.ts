import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, WidthType, AlignmentType, BorderStyle } from 'docx';
import { TEXT_CODES, ROLES, PROPOSITION_STATUS } from '@/lib/constants/labels';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tab = searchParams.get('tab') || 'STATUTS';
    const gravite = searchParams.get('gravite') || '';
    const statut = searchParams.get('statut') || '';

    const supabase = await createClient();

    // Query textes table
    const { data: texteData } = await supabase
      .from('textes')
      .select('id, titre')
      .eq('code', tab)
      .single();

    if (!texteData) {
      return new Response("Texte non trouvé", { status: 404 });
    }

    // Query articles along with enjeux, propositions and decisions
    let query = supabase
      .from('articles')
      .select(`
        *,
        enjeux(*),
        propositions(*, profile:profiles(*, sections(*))),
        decisions(*, proposition:propositions(*))
      `)
      .eq('texte_id', texteData.id)
      .order('ordre', { ascending: true });

    const { data: articles, error } = await query;

    if (error || !articles) {
      throw new Error(error?.message || "Erreur de chargement des données");
    }

    // Filter by gravity local if requested
    let filteredArticles = articles;
    if (gravite) {
      filteredArticles = articles.filter(art => 
        art.enjeux && art.enjeux.some((e: any) => e.gravite === gravite)
      );
    }

    // Filter by proposition status if requested
    if (statut) {
      filteredArticles = filteredArticles.filter(art =>
        art.propositions && art.propositions.some((p: any) => p.statut === statut)
      );
    }

    // Construct the Word Document using docx
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Header block
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "LES AMIS DE LA MUSIQUE AFRO-CUBAINE (AMAC)",
                bold: true,
                color: "128A3E",
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "ASSOCIATION IVOIRIENNE REGIE PAR LA LOI N° 60-315 DU 21 SEPTEMBRE 1960",
                size: 16,
                color: "555555",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: "REF : REF/PR/Amac_National",
                bold: true,
                color: "E8730C",
                size: 16,
              }),
            ],
          }),

          // Separation line
          new Paragraph({
            text: "_________________________________________________________________________________",
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          // Document Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 400 },
            children: [
              new TextRun({
                text: `TABLE DE CONCORDANCE - ${texteData.titre.toUpperCase()}`,
                bold: true,
                color: "1C1C1E",
                size: 32,
              }),
            ],
          }),

          // Table of Concordance
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 8, color: "E2E8F0" },
              bottom: { style: BorderStyle.SINGLE, size: 8, color: "E2E8F0" },
              left: { style: BorderStyle.SINGLE, size: 8, color: "E2E8F0" },
              right: { style: BorderStyle.SINGLE, size: 8, color: "E2E8F0" },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 8, color: "F1F5F9" },
            },
            rows: [
              // Header Row
              new TableRow({
                tableHeader: true,
                children: [
                  new TableCell({
                    width: { size: 15, type: WidthType.PERCENTAGE },
                    shading: { fill: "128A3E" },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: "Article", bold: true, color: "FFFFFF", size: 18 })],
                        alignment: AlignmentType.LEFT,
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    shading: { fill: "128A3E" },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: "Problème Identifié", bold: true, color: "FFFFFF", size: 18 })],
                        alignment: AlignmentType.LEFT,
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 35, type: WidthType.PERCENTAGE },
                    shading: { fill: "128A3E" },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: "Proposition V1.0 / Scribe", bold: true, color: "FFFFFF", size: 18 })],
                        alignment: AlignmentType.LEFT,
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    shading: { fill: "128A3E" },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: "Décision & Statut", bold: true, color: "FFFFFF", size: 18 })],
                        alignment: AlignmentType.LEFT,
                      }),
                    ],
                  }),
                ],
              }),

              // Data Rows
              ...filteredArticles.map((art) => {
                const enjeuText = art.enjeux && art.enjeux.length > 0
                  ? art.enjeux.map((e: any) => `[${e.type.toUpperCase()}] ${e.description}`).join('\n\n')
                  : 'Aucun enjeu majeur identifié.';

                // Find adopted decision if any, or general status
                const latestDecision = art.decisions && art.decisions.length > 0 ? art.decisions[0] : null;
                const adoptedProp = latestDecision && latestDecision.decision === 'adopte'
                  ? art.propositions.find((p: any) => p.id === latestDecision.proposition_id)
                  : null;

                const propText = adoptedProp
                  ? adoptedProp.texte_propose
                  : (art.propositions && art.propositions.length > 0
                      ? art.propositions.map((p: any) => `[${p.version} par ${(p.profile as any)?.nom || 'Scribe'}] : ${p.texte_propose}`).join('\n\n')
                      : 'Aucune proposition déposée.');

                let decisionStatus = 'En attente';
                if (latestDecision) {
                  const labelMap = { adopte: 'Adoptée', rejete: 'Rejetée', reporte: 'Reportée' };
                  decisionStatus = `${labelMap[latestDecision.decision as 'adopte' | 'rejete' | 'reporte']} (Votes: +${latestDecision.votes_pour} / -${latestDecision.votes_contre} / ${latestDecision.abstentions} abst.)`;
                }

                return new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({ text: art.numero_affiche, bold: true, color: "E8730C", size: 16 }),
                            new TextRun({ text: art.titre ? `\n${art.titre}` : '', size: 16 }),
                          ],
                        }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: enjeuText, size: 16 })],
                        }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: propText, size: 16 })],
                        }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({ text: `Décision : ${decisionStatus}\n\n`, bold: true, size: 16 }),
                            new TextRun({ text: `Version actuelle : ${adoptedProp ? 'V1.0' : 'V0.9'}`, italics: true, size: 14 }),
                          ],
                        }),
                      ],
                    }),
                  ],
                });
              }),
            ],
          }),

          // Footer note
          new Paragraph({
            text: "\nSéminaire National AMAC - Loi 60-315 - Décembre 2026. Document généré automatiquement.",
            alignment: AlignmentType.RIGHT,
            spacing: { before: 400 },
            children: [
              new TextRun({
                text: "\nAMAC Gouvernance 2.0",
                bold: true,
                size: 14,
                color: "555555",
              }),
            ],
          }),
        ],
      }],
    });

    // Output buffer
    const buffer = await Packer.toBuffer(doc);

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename=AMAC_Concordance_${tab}_V1.0.docx`,
      },
    });
  } catch (error: any) {
    console.error('Error generating DOCX:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
