export type CatalogNode = {
  id: string;
  title: string;
  description?: string;
  imageSrc?: string;
  productCount?: number;
  href?: string;
  children?: CatalogNode[];
};

export type CatalogCategoryRecord = {
  id: string;
  title: string;
  parentId?: string | null;
  description?: string;
  imageSrc?: string;
  productCount?: number;
  href?: string;
  order?: number;
  isActive?: boolean;
};

export const leafHref = (category: string) => `/kategori/${encodeURIComponent(category)}`;

export const categoryHref = (path: string[]) =>
  `/kategori/${path.map((segment) => encodeURIComponent(segment)).join("/")}`;

export const countLeafNodes = (nodes: CatalogNode[] = []): number =>
  nodes.reduce((total, node) => {
    if (!node.children?.length) return total + 1;
    return total + countLeafNodes(node.children);
  }, 0);

export const countProducts = (nodes: CatalogNode[] = []): number =>
  nodes.reduce((total, node) => {
    if (node.productCount) return total + node.productCount;
    return total + countProducts(node.children);
  }, 0);

export const findNodeByPath = (
  nodes: CatalogNode[],
  path: string[]
): CatalogNode | null => {
  if (!path.length) return null;

  let currentNodes = nodes;
  let currentNode: CatalogNode | undefined;

  for (const segment of path) {
    currentNode = currentNodes.find((node) => node.id === segment);
    if (!currentNode) return null;
    currentNodes = currentNode.children ?? [];
  }

  return currentNode ?? null;
};

export const buildCatalogTree = (
  records: CatalogCategoryRecord[]
): CatalogNode[] => {
  const activeRecords = records
    .filter((record) => record.isActive !== false)
    .sort((first, second) => (first.order ?? 0) - (second.order ?? 0));

  const nodes = new Map<string, CatalogNode>();
  const roots: CatalogNode[] = [];

  activeRecords.forEach((record) => {
    nodes.set(record.id, {
      id: record.id,
      title: record.title,
      description: record.description,
      imageSrc: record.imageSrc,
      productCount: record.productCount,
      href: record.href,
      children: [],
    });
  });

  activeRecords.forEach((record) => {
    const node = nodes.get(record.id);
    if (!node) return;

    const parentId = record.parentId ?? null;
    const parent = parentId ? nodes.get(parentId) : null;

    if (parent) parent.children?.push(node);
    else roots.push(node);
  });

  const normalize = (node: CatalogNode): CatalogNode => {
    const children = node.children?.map(normalize).filter(Boolean);
    const hasChildren = Boolean(children?.length);

    return {
      ...node,
      href: hasChildren ? undefined : node.href ?? leafHref(node.title),
      children: hasChildren ? children : undefined,
    };
  };

  return roots.map(normalize);
};

export const catalogTree: CatalogNode[] = [
  {
    id: "celik-urunlerimiz",
    title: "Çelik Ürünlerimiz",
    description: "Kolye, küpe ve bileklik grupları",
    imageSrc: "/catalog/categories/category-01-steel-family.png",
    children: [
      {
        id: "celik-kupe",
        title: "Çelik Küpe",
        description: "Günlük ve özel seri küpeler",
        imageSrc: "/catalog/categories/category-02-steel-earrings.png",
        children: [
          {
            id: "celik-kupe-6li-kdt-120",
            title: "6’lı KDT / 120 TL",
            productCount: 9,
            href: leafHref("6’lı KDT / 120 TL"),
          },
          {
            id: "celik-kupe-kdt-70",
            title: "KDT / 70 TL",
            productCount: 12,
            href: leafHref("KDT / 70 TL"),
          },
        ],
      },
      {
        id: "celik-bileklik",
        title: "Çelik Bileklik",
        description: "Minimal ve premium bileklikler",
        imageSrc: "/catalog/categories/category-03-steel-bracelets.png",
        children: [
          {
            id: "celik-bileklik-kdt-80",
            title: "KDT / 80 TL",
            productCount: 6,
            href: leafHref("KDT / 80 TL"),
          },
          {
            id: "celik-bileklik-kdt-65",
            title: "KDT / 65 TL",
            productCount: 10,
            href: leafHref("KDT / 65 TL"),
          },
        ],
      },
      {
        id: "celik-kolye",
        title: "Çelik Kolye",
        description: "Zarif zincir ve kolye serileri",
        imageSrc: "/catalog/categories/category-04-steel-necklaces.png",
        children: [
          {
            id: "celik-kolye-kds-55",
            title: "KDS / 55 TL",
            productCount: 14,
            href: leafHref("KDS / 55 TL"),
          },
          {
            id: "celik-kolye-kdt-55",
            title: "KDT / 55 TL",
            productCount: 18,
            href: leafHref("KDT / 55 TL"),
          },
          {
            id: "celik-kolye-kdt-65",
            title: "KDT / 65 TL",
            productCount: 11,
            href: leafHref("KDT / 65 TL"),
          },
          {
            id: "celik-kolye-kdt-105",
            title: "KDT / 105 TL",
            productCount: 7,
            href: leafHref("KDT / 105 TL"),
          },
        ],
      },
    ],
  },
  {
    id: "ysx-urunlerimiz",
    title: "YSX Ürünlerimiz",
    description: "YSX ve Vip Series seçkileri",
    imageSrc: "/catalog/categories/category-05-ysx.png",
    children: [
      {
        id: "ysx-3lu-kupe",
        title: "YSX 3’lü Küpe",
        productCount: 10,
        href: leafHref("YSX 3’lü Küpe"),
      },
      {
        id: "vip-series-kupe",
        title: "Vip Series Küpe",
        description: "Özel seri küpeler",
        imageSrc: "/catalog/categories/category-06-vip-series.png",
        children: [
          {
            id: "vip-series-kupe-kdt-105",
            title: "KDT / 105 TL",
            productCount: 5,
            href: leafHref("Vip Series Küpe / KDT 105 TL"),
          },
        ],
      },
    ],
  },
];
