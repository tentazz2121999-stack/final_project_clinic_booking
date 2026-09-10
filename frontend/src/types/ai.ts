export interface SpecialtySuggestion {
  specialty: { id: number; name: string };
  reason: string;
}

export interface SuggestSpecialtyResult {
  suggestions: SpecialtySuggestion[];
  disclaimer: string;
  fallbackMessage: string | null;
}
