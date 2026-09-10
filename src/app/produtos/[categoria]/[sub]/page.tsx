import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageTitleBar from "@/components/PageTitleBar";
import ProductCard from "@/components/ProductCard";
import {
  getCategories,
  getCategoryBySlug,
  getGroup,
  getGroupOfSubcategory,
  getProductsBySubcategory,
  subcategoriesOfGroup,
  type Category,
  type Product,
  type Subcategory,
} from "@/lib/catalog";
import { isWipCategory, whatsappLink } from "../../../../../site.config";

type Props = { params: Promise<{ categoria: string; sub: string }> };

/**
 * A rota atende tanto a sublinha (`/produtos/<linha>/<sublinha>/`) quanto o
 * grupo (`/produtos/<linha>/<grupo>/`), quando a linha tem `groups`. A
 * página do grupo lista os produtos de todas as sublinhas dele, com um
 * título por sublinha quando há mais de uma.
 */
export async function generateStaticParams() {
  const categories = await getCategories();
  // Linhas em prévia não geram páginas de subcategoria
  return categories
    .filter((c) => !isWipCategory(c.slug))
    .flatMap((c) =>
      [...(c.groups ?? []), ...c.subcategories].map((s) => ({
        categoria: c.slug,
        sub: s.slug,
      }))
    );
}

type Section = { subcategory: Subcategory; products: Product[] };

async function resolve(categoria: string, sub: string) {
  const category = await getCategoryBySlug(categoria);
  if (!category) return null;
  const group = getGroup(category, sub);
  if (group) {
    const sections: Section[] = await Promise.all(
      subcategoriesOfGroup(category, group).map(async (subcategory) => ({
        subcategory,
        products: await getProductsBySubcategory(category.slug, subcategory.slug),
      }))
    );
    return { category, name: group.name, parent: null, sections };
  }
  const subcategory = category.subcategories.find((s) => s.slug === sub);
  if (!subcategory) return null;
  return {
    category,
    name: subcategory.name,
    parent: getGroupOfSubcategory(category, subcategory) ?? null,
    sections: [
      {
        subcategory,
        products: await getProductsBySubcategory(category.slug, subcategory.slug),
      },
    ] as Section[],
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria, sub } = await params;
  const page = await resolve(categoria, sub);
  if (!page) return {};
  return {
    title: `${page.name} — ${page.category.name}`,
    description: `Catálogo de ${page.name.toLowerCase()}: consulte os produtos e solicite seu orçamento pelo WhatsApp.`,
  };
}

function ProductGrid({ products, category }: { products: Product[]; category: Category }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.slug} product={p} brand={category.brand} />
      ))}
    </div>
  );
}

export default async function SubcategoriaPage({ params }: Props) {
  const { categoria, sub } = await params;
  const page = await resolve(categoria, sub);
  if (!page) notFound();
  const { category, name, parent, sections } = page;

  const hasProducts = sections.some((s) => s.products.length > 0);
  const backHref = parent
    ? `/produtos/${category.slug}/${parent.slug}/`
    : `/produtos/${category.slug}/`;

  return (
    <>
      <PageTitleBar
        title={name}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Produtos", href: "/produtos/" },
          { label: category.name, href: `/produtos/${category.slug}/` },
          ...(parent ? [{ label: parent.name, href: backHref }] : []),
          { label: name },
        ]}
        backHref={backHref}
      />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {!hasProducts ? (
          <div className="rounded border border-slate-200 bg-white p-8 text-center">
            <p className="text-slate-600">
              Os itens desta linha ainda não foram publicados no site. Consulte
              disponibilidade e preço com a equipe comercial.
            </p>
            <a
              href={whatsappLink(
                `Olá! Gostaria de consultar produtos da linha ${name}.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded bg-accent-500 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-accent-600"
            >
              Consultar pelo WhatsApp
            </a>
          </div>
        ) : sections.length === 1 ? (
          <ProductGrid products={sections[0].products} category={category} />
        ) : (
          <div className="space-y-12">
            {sections
              .filter((s) => s.products.length > 0)
              .map(({ subcategory, products }) => (
                <section key={subcategory.slug}>
                  <h2 className="mb-5 border-l-4 border-accent-500 pl-3 text-xl font-bold text-brand-700">
                    <Link
                      href={`/produtos/${category.slug}/${subcategory.slug}/`}
                      className="hover:underline"
                    >
                      {subcategory.name}
                    </Link>
                  </h2>
                  <ProductGrid products={products} category={category} />
                </section>
              ))}
          </div>
        )}
      </div>
    </>
  );
}
