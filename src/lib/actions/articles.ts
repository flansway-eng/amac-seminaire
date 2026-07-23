'use server';

import { createClient } from '@/lib/supabase/server';
import { Article, TexteCode } from '@/lib/types';
import fs from 'fs';
import path from 'path';

export async function getArticles(texteCode?: TexteCode, search?: string) {
  try {
    const supabase = await createClient();

    // Query articles with related text and enjeux
    let query = supabase
      .from('articles')
      .select(`
        *,
        texte:textes(*),
        enjeux(*)
      `)
      .order('texte_id', { ascending: true })
      .order('ordre', { ascending: true });

    if (texteCode) {
      // Join the textes table to filter by code
      const { data: textData } = await supabase
        .from('textes')
        .select('id')
        .eq('code', texteCode)
        .single();

      if (textData) {
        query = query.eq('texte_id', textData.id);
      }
    }

    if (search && search.trim() !== '') {
      // Format search for Postgres textSearch
      const formattedSearch = search
        .trim()
        .split(/\s+/)
        .map(word => `${word}:*`)
        .join(' & ');
        
      query = query.textSearch('search_vector', formattedSearch, {
        config: 'french',
      });
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data as unknown as Article[];
  } catch (error: any) {
    console.warn('Supabase database offline or dummy key used. Falling back to local JSON seeds:', error.message || error);
    try {
      let localArticles: any[] = [];
      
      if (!texteCode) {
        // Load both files
        const statutsPath = path.join(process.cwd(), 'seed', 'statuts.json');
        const riPath = path.join(process.cwd(), 'seed', 'reglement_interieur.json');
        
        const statutsContent = fs.readFileSync(statutsPath, 'utf8');
        const riContent = fs.readFileSync(riPath, 'utf8');
        
        const statutsList = JSON.parse(statutsContent).map((art: any, index: number) => ({
          ...art,
          id: index + 1,
          texte_id: 1,
          enjeux: [],
          texte: {
            id: 1,
            code: 'STATUTS',
            titre: "Statuts de l'AMAC",
          }
        }));
        
        const riList = JSON.parse(riContent).map((art: any, index: number) => ({
          ...art,
          id: index + 50,
          texte_id: 2,
          enjeux: [],
          texte: {
            id: 2,
            code: 'RI',
            titre: "Règlement Intérieur de l'AMAC",
          }
        }));
        
        localArticles = [...statutsList, ...riList];
      } else {
        const isRI = texteCode === 'RI';
        const filePath = path.join(process.cwd(), 'seed', isRI ? 'reglement_interieur.json' : 'statuts.json');
        const fileContent = fs.readFileSync(filePath, 'utf8');
        
        localArticles = JSON.parse(fileContent).map((art: any, index: number) => ({
          ...art,
          id: isRI ? index + 50 : index + 1,
          texte_id: isRI ? 2 : 1,
          enjeux: [],
          texte: {
            id: isRI ? 2 : 1,
            code: isRI ? 'RI' : 'STATUTS',
            titre: isRI ? "Règlement Intérieur de l'AMAC" : "Statuts de l'AMAC",
          }
        }));
      }

      if (search && search.trim() !== '') {
        const lowerSearch = search.toLowerCase();
        localArticles = localArticles.filter((art: any) => 
          (art.titre && art.titre.toLowerCase().includes(lowerSearch)) || 
          (art.contenu_actuel && art.contenu_actuel.toLowerCase().includes(lowerSearch))
        );
      }

      return localArticles as unknown as Article[];
    } catch (fsError) {
      console.error('Failed to load local static article seeds:', fsError);
      return [];
    }
  }
}

export async function getArticleById(id: number) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        texte:textes(*),
        enjeux(*),
        questions(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data as unknown as Article;
  } catch (error: any) {
    console.warn(`Supabase offline. Fetching article ${id} from local JSON seeds:`, error.message || error);
    try {
      const isRI = id > 49;
      const filePath = path.join(process.cwd(), 'seed', isRI ? 'reglement_interieur.json' : 'statuts.json');
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const localArticles = JSON.parse(fileContent);
      
      const localIndex = isRI ? (id - 50) : (id - 1);
      const art = localArticles[localIndex];
      if (art) {
        return {
          ...art,
          id,
          texte_id: isRI ? 2 : 1,
          enjeux: [],
          questions: [],
          texte: {
            id: isRI ? 2 : 1,
            code: isRI ? 'RI' : 'STATUTS',
            titre: isRI ? "Règlement Intérieur" : "Statuts de l'AMAC",
          }
        } as unknown as Article;
      }
    } catch (fsError) {
      console.error('Failed to load local article seed:', fsError);
    }
    return null;
  }
}
