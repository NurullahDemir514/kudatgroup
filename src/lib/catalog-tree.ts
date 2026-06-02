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

export const pruneCatalogTreeByProductCounts = (
  nodes: CatalogNode[],
  productCounts: Map<string, number>
): CatalogNode[] =>
  nodes
    .map((node) => {
      const children = pruneCatalogTreeByProductCounts(node.children ?? [], productCounts);
      const directProductCount = productCounts.get(node.id) ?? 0;
      const totalProductCount = directProductCount + countProducts(children);

      if (!totalProductCount) return null;

      return {
        ...node,
        productCount: totalProductCount,
        children: children.length ? children : undefined,
      };
    })
    .filter((node): node is CatalogNode => Boolean(node));

export type CatalogLeafMatch = {
  node: CatalogNode;
  path: string[];
};

export const findSingleProductLeaf = (
  nodes: CatalogNode[]
): CatalogLeafMatch | null => {
  const leaves: CatalogLeafMatch[] = [];

  const visit = (node: CatalogNode, path: string[]) => {
    const nextPath = [...path, node.id];
    if (node.children?.length) {
      node.children.forEach((child) => visit(child, nextPath));
      return;
    }

    if ((node.productCount ?? 0) > 0) {
      leaves.push({ node, path: nextPath });
    }
  };

  nodes.forEach((node) => visit(node, []));
  return leaves.length === 1 ? leaves[0] : null;
};

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

export const catalogTree: CatalogNode[] = [];
