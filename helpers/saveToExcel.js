// helpers/saveToExcel.js
import fs from "fs";
import path from "path";
import XLSX from "xlsx";
import { formatDescription } from "./descriptionHelper.js";

export async function saveToExcel(products) {
  const rows = [];

  for (const p of products) {
    // Main product row
    rows.push({
      Handle: p.handle,
      Title: p.title,
      "Body (HTML)": `${p.description.firstParagraph}\n\n${formatDescription(
        p.description
      )}`,
      Vendor: "messika",
      Type: "Jewellery",
      Tags: p.breadcrumbs.join(", "),
      "Variant SKU": p.sku,
      "Variant Price": p.variantPrice,
      "Cost per item": p.cost,
      "Image Src": p.mainImage,
      "Variant Image": p.mainImage,
      "Variant Fulfillment Service": "manual",
      "Variant Inventory Policy": "deny",
      "Variant Inventory Tracker": "shopify",
      Status: "Active",
      Published: "TRUE",
      "Variant Compare At Price": p.compareAtPrice,
      "product.metafields.custom.original_prodect_url": p.url,
    });

    // Extra rows for additional images
    const extraImages = p.images.slice(1);
    for (const img of extraImages) {
      rows.push({
        Handle: p.handle,
        "Image Src": img,
        // All other fields remain empty
      });
    }
  }

  const outputDir = path.join("messika_products_ditals");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const now = new Date();
  const timestamp = now
    .toISOString()
    .slice(0, 16)
    .replace("T", "_")
    .replace(":", "-");
  const filenameBase = path.join(outputDir, `${timestamp}`);

  // Excel
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Products");
  XLSX.writeFile(wb, `${filenameBase}.xlsx`);

  // CSV
  const csv = XLSX.utils.sheet_to_csv(ws);
  fs.writeFileSync(`${filenameBase}.csv`, csv, "utf-8");

  console.log(`✅ Saved to: ${filenameBase}.xlsx & .csv`);
}
