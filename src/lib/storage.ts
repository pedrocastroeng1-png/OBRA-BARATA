import { Offer } from '../types';

// This is a local storage abstraction that acts as a placeholder for the future Supabase integration.
// To switch to Supabase later, you will replace these implementations with supabase.from('offers')...

const STORAGE_KEY = '@obrabaratabrasil_offers';
const LAST_UPDATE_KEY = '@obrabaratabrasil_last_update';
const KEYWORDS_KEY = '@obrabaratabrasil_keywords';

const DEFAULT_KEYWORDS = [
  'Bosch', 'Makita', 'DeWalt', 'Vonder', 'Tramontina', 'Stanley', 
  'Tigre', 'Krona', 'Amanco', 'Quartzolit', 'Vedacit', 'Sika', 
  'Suvinil', 'Coral', 'Porcelanato', 'Argamassa', 'Furadeira', 
  'Parafusadeira', 'Martelete', 'Esmerilhadeira'
];

export function getStoredKeywords(): string[] {
  try {
    const data = localStorage.getItem(KEYWORDS_KEY);
    return data ? JSON.parse(data) : DEFAULT_KEYWORDS;
  } catch {
    return DEFAULT_KEYWORDS;
  }
}

export function saveStoredKeywords(keywords: string[]): void {
  localStorage.setItem(KEYWORDS_KEY, JSON.stringify(keywords));
}

export function getStoredOffers(): Offer[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveStoredOffers(offers: Offer[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(offers));
}

export function getLastUpdate(): string | null {
  return localStorage.getItem(LAST_UPDATE_KEY);
}

export function setLastUpdate(date: string): void {
  localStorage.setItem(LAST_UPDATE_KEY, date);
}

export function mergeNewOffers(existing: Offer[], fetched: Offer[]): Offer[] {
  const existingMap = new Map(existing.map(o => [o.id, o]));
  
  for (const newOffer of fetched) {
    if (!existingMap.has(newOffer.id)) {
      existingMap.set(newOffer.id, newOffer);
    }
  }
  
  return Array.from(existingMap.values());
}
