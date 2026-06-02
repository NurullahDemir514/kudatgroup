#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const sharp = require("sharp");

const sourceDir =
  process.argv[2] || "/Users/onurdemir/projects/qanta/KÜPELER";
const outputRoot =
  process.argv[3] || path.join(process.cwd(), ".catalog-import", "bijuteri-kupe");

const categoryId = "bijuteri-urunlerimiz-kupe";
const productPrefix = "BJ-KP";
const imagePrefix = "bijuteri-kupe";
const priceOffset = 15;
const defaultStock = 1000;
const maxImageEdge = 1400;
const webpQuality = 82;
const manualBasePrices = new Map([
  ["IMG_20240715_202114.jpg", 30],
  ["PHOTO-2025-01-28-13-07-48 2.jpg", 30],
]);

const titleCase = (value) =>
  value
    .toLocaleLowerCase("tr-TR")
    .split(" ")
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toLocaleUpperCase("tr-TR")}${word.slice(1)}`)
    .join(" ");

const normalizeSpaces = (value) => value.replace(/\s+/g, " ").trim();

const cleanFileBase = (fileName) =>
  fileName
    .normalize("NFC")
    .replace(/\.(heic|heif|jpe?g|png|webp|jps)$/i, "")
    .replace(/[_.,]+$/g, "")
    .trim();

const extractBasePrice = (fileName) => {
  const manualPrice = manualBasePrices.get(fileName.normalize("NFC"));
  if (manualPrice !== undefined) return manualPrice;

  const normalized = fileName.normalize("NFC").replace(",", ".");
  const match =
    normalized.match(/(\d+(?:\.\d+)?)\s*(?:tl|₺)/i) ||
    normalized.match(/^(\d+(?:\.\d+)?)(?:\.[a-z0-9]+)?$/i);
  return match ? Number(match[1]) : null;
};

const extractNameHint = (fileName) => {
  let hint = cleanFileBase(fileName)
    .replace(/\b\d+(?:[,.]\d+)?\s*(?:tl|₺)\b/gi, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/\b(?:jpeg|jpg|heic|png|webp)\b/gi, "")
    .replace(/^img[_\s-]?\d+(?:[_\s-]\d+)?$/i, "")
    .replace(/^photo-\d{4}-\d{2}-\d{2}.*$/i, "")
    .replace(/[_.]+/g, " ")
    .replace(/\s*-\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  hint = normalizeSpaces(hint);
  if (!/[a-zA-ZçğıöşüÇĞİÖŞÜ]/.test(hint)) return "";
  if (hint.length < 3) return "";
  if (/^\d+$/.test(hint)) return "";

  if (!/küpe/i.test(hint)) hint = `${hint} küpe`;
  return titleCase(hint);
};

const safeCsv = (value) => {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const writeWebp = async (inputPath, outputPath) => {
  try {
    await sharp(inputPath, { failOn: "none" })
      .rotate()
      .resize({
        width: maxImageEdge,
        height: maxImageEdge,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: webpQuality, effort: 5 })
      .toFile(outputPath);
    return { fallback: false };
  } catch (error) {
    const tempPath = path.join(
      os.tmpdir(),
      `kudat-import-${Date.now()}-${Math.random().toString(16).slice(2)}.jpg`
    );

    try {
      execFileSync(
        "sips",
        ["-s", "format", "jpeg", inputPath, "--out", tempPath],
        { stdio: "ignore" }
      );
      await sharp(tempPath, { failOn: "none" })
        .rotate()
        .resize({
          width: maxImageEdge,
          height: maxImageEdge,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: webpQuality, effort: 5 })
        .toFile(outputPath);
      return { fallback: true };
    } catch {
      throw error;
    } finally {
      fs.rmSync(tempPath, { force: true });
    }
  }
};

async function main() {
  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Kaynak klasör bulunamadı: ${sourceDir}`);
  }

  const imagesDir = path.join(outputRoot, "images");
  fs.rmSync(outputRoot, { recursive: true, force: true });
  fs.mkdirSync(imagesDir, { recursive: true });

  const entries = fs
    .readdirSync(sourceDir)
    .map((name) => ({ name, fullPath: path.join(sourceDir, name) }))
    .filter((entry) => fs.statSync(entry.fullPath).isFile())
    .sort((first, second) =>
      first.name.localeCompare(second.name, "tr-TR", { numeric: true })
    );

  const products = [];
  const failures = [];
  let fallbackConversions = 0;
  let sequence = 1;

  for (const entry of entries) {
    const basePrice = extractBasePrice(entry.name);
    const code = `${productPrefix}-${String(sequence).padStart(3, "0")}`;
    const imageFileName = `${imagePrefix}-${String(sequence).padStart(3, "0")}.webp`;
    const outputPath = path.join(imagesDir, imageFileName);
    const nameHint = extractNameHint(entry.name);

    try {
      const result = await writeWebp(entry.fullPath, outputPath);
      if (result.fallback) fallbackConversions += 1;

      products.push({
        sourceFile: entry.name,
        name: nameHint || `Bijuteri Küpe ${String(sequence).padStart(3, "0")}`,
        code,
        categoryId,
        purchasePrice: basePrice,
        price: basePrice === null ? null : basePrice + priceOffset,
        priceOffset,
        stock: defaultStock,
        hideStock: true,
        imageFileName,
        storagePath: `catalog/products/bijuteri-kupe/${imageFileName}`,
        order: sequence,
        isActive: true,
      });
      sequence += 1;
    } catch (error) {
      failures.push({
        sourceFile: entry.name,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    sourceDir,
    outputRoot,
    categoryId,
    image: {
      format: "webp",
      maxEdge: maxImageEdge,
      quality: webpQuality,
    },
    pricing: {
      rule: "Dosya adından okunan fiyat + 15 TL",
      purchasePriceSource: "Dosya adındaki fiyat alış fiyatıdır",
      salePriceSource: "Satış fiyatı alış fiyatı + 15 TL olarak hesaplanır",
      priceOffset,
    },
    products,
    failures,
    summary: {
      sourceFiles: entries.length,
      processed: products.length,
      failed: failures.length,
      fallbackConversions,
      missingPurchasePrice: products.filter((product) => product.purchasePrice === null).length,
      namedFromFile: products.filter(
        (product) => !/^Bijuteri Küpe \d{3}$/.test(product.name)
      ).length,
      autoNamed: products.filter((product) =>
        /^Bijuteri Küpe \d{3}$/.test(product.name)
      ).length,
    },
  };

  fs.writeFileSync(
    path.join(outputRoot, "manifest.json"),
    JSON.stringify(manifest, null, 2)
  );

  const csvHeaders = [
    "code",
    "name",
    "categoryId",
    "purchasePrice",
    "price",
    "stock",
    "hideStock",
    "imageFileName",
    "storagePath",
    "sourceFile",
  ];
  const csvRows = products.map((product) =>
    csvHeaders.map((header) => safeCsv(product[header])).join(",")
  );
  fs.writeFileSync(
    path.join(outputRoot, "products.csv"),
    [csvHeaders.join(","), ...csvRows].join("\n")
  );

  console.log(JSON.stringify(manifest.summary, null, 2));
  if (failures.length) {
    console.log(`Sorunlu dosyalar: ${path.join(outputRoot, "manifest.json")}`);
  }
  console.log(`Çıktı: ${outputRoot}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
