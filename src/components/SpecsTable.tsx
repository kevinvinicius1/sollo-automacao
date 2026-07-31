/**
 * Renderiza as especificações técnicas (HTML sanitizado pelo scraper)
 * dentro de um wrapper com tipografia própria (.specs-content em globals.css).
 */
export default function SpecsTable({ specsHtml }: { specsHtml: string }) {
  if (!specsHtml.trim()) return null;
  return (
    <section aria-labelledby="specs-heading" className="mt-10">
      <h2
        id="specs-heading"
        className="mb-4 border-b-2 border-accent-500 pb-2 text-xl font-bold text-brand-700"
      >
        Especificações técnicas
      </h2>
      <div
        className="specs-content"
        dangerouslySetInnerHTML={{ __html: specsHtml }}
      />
    </section>
  );
}
