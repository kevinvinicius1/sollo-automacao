import Fuse from "fuse.js";

/** Remove acentos e caixa: busca insensível a diacríticos (pt-BR). */
export function normalizeSearchText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

type Searchable = { code: string; name: string; shortDescription: string };

/**
 * Índice de busca único do site (header e página /busca).
 * Campos são normalizados na indexação; normalizar também a consulta
 * em searchProducts() para o casamento ser simétrico.
 */
export function buildSearchIndex<T extends Searchable>(items: T[]): Fuse<T> {
  return new Fuse(items, {
    keys: [
      { name: "code", weight: 2, getFn: (i: T) => normalizeSearchText(i.code) },
      { name: "name", weight: 2, getFn: (i: T) => normalizeSearchText(i.name) },
      {
        name: "shortDescription",
        weight: 1,
        getFn: (i: T) => normalizeSearchText(i.shortDescription),
      },
    ],
    threshold: 0.3,
    ignoreLocation: true,
    minMatchCharLength: 2,
  });
}

/** Consulta com menos de 2 caracteres úteis retorna vazio. */
export function searchProducts<T extends Searchable>(
  fuse: Fuse<T>,
  query: string
): T[] {
  const q = normalizeSearchText(query.trim());
  if (q.length < 2) return [];
  return fuse.search(q).map((r) => r.item);
}
