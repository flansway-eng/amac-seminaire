import { describe, it, expect } from 'vitest';
import * as crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const statutsPath = path.resolve(__dirname, '../../seed/statuts.json');
const riPath = path.resolve(__dirname, '../../seed/reglement_interieur.json');

// Hashes calculés sur le corpus vérifié le 2026-07-24.
// Toute modification du contenu des articles sera détectée.
const CORPUS_HASH_STATUTS = 'ceb360bf80f5dc7f86872be1c500d06c39e37cc3e61e82f89b538cdec49cc531';
const CORPUS_HASH_RI = '44fb94a8a179eb50ee4733fcbb842856fd56c003d7d1a772de6b0d56ff114703';

describe('Intégrité du corpus AMAC (textes de 2013)', () => {
  it('Charge 49 articles des Statuts sans modification', () => {
    const data = JSON.parse(fs.readFileSync(statutsPath, 'utf-8'));
    expect(data.articles).toHaveLength(49);

    const article1 = data.articles.find((a: any) => a.numero === 1);
    expect(article1.contenu_actuel).toContain('Il est constitué en Côte d\'Ivoire');
    expect(article1.titre_parent).toBe('TITRE I : DISPOSITIONS GÉNÉRALES');
  });

  it('Charge 47 articles du RI sans modification', () => {
    const data = JSON.parse(fs.readFileSync(riPath, 'utf-8'));
    expect(data.articles).toHaveLength(47);

    const article1 = data.articles.find((a: any) => a.numero === 1);
    expect(article1.titre_parent).toBe('TITRE I : DISPOSITIONS GÉNÉRALES');
  });

  it('Détecte toute altération du corpus Statuts via hash SHA-256', () => {
    const data = JSON.parse(fs.readFileSync(statutsPath, 'utf-8'));
    const contenu = data.articles.map((a: any) => a.contenu_actuel).join('');
    const hash = crypto.createHash('sha256').update(contenu).digest('hex');
    expect(hash).toBe(CORPUS_HASH_STATUTS);
  });

  it('Détecte toute altération du corpus RI via hash SHA-256', () => {
    const data = JSON.parse(fs.readFileSync(riPath, 'utf-8'));
    const contenu = data.articles.map((a: any) => a.contenu_actuel).join('');
    const hash = crypto.createHash('sha256').update(contenu).digest('hex');
    expect(hash).toBe(CORPUS_HASH_RI);
  });

  it('Vérifie que les titres parents commencent par TITRE', () => {
    const statuts = JSON.parse(fs.readFileSync(statutsPath, 'utf-8'));
    const ri = JSON.parse(fs.readFileSync(riPath, 'utf-8'));

    for (const art of statuts.articles) {
      expect(art.titre_parent).toMatch(/^TITRE /);
    }
    for (const art of ri.articles) {
      expect(art.titre_parent).toMatch(/^TITRE /);
    }
  });
});
