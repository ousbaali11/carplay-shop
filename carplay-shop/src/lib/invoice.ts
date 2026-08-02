import PDFDocument from "pdfkit";
import { prisma } from "@/lib/prisma";

function eur(cents: number) {
  return (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

// Génère la facture PDF entièrement à partir des données déjà en base (commande,
// véhicule, prix, formule, date) — jamais uploadée à la main par l'admin.
export async function generateInvoicePdf(order: {
  orderNumber: string;
  createdAt: Date;
  firstName: string;
  lastName: string;
  email: string;
  address: string | null;
  addressComp: string | null;
  postalCode: string | null;
  city: string | null;
  country: string;
  vehicleTitle: string;
  vehicleYear: string;
  formula: string;
  priceCents: number;
  paymentMethod: string | null;
}): Promise<Buffer> {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  const companyName = settings?.companyName || "CarPlayActiv";
  const companyAddress = settings?.companyAddress || "";
  const companyEmail = settings?.contactEmail || settings?.adminNotificationEmail || "";

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(20).text(companyName, { continued: false });
    if (companyAddress) doc.fontSize(9).fillColor("#555").text(companyAddress);
    if (companyEmail) doc.fontSize(9).fillColor("#555").text(companyEmail);

    doc.moveDown(1.5);
    doc.fillColor("#000").fontSize(16).text("Facture", { continued: false });
    doc.fontSize(10).fillColor("#555").text(`N° ${order.orderNumber}`);
    doc.text(`Date : ${order.createdAt.toLocaleDateString("fr-FR")}`);

    doc.moveDown(1);
    doc.fillColor("#000").fontSize(11).text("Facturé à :", { underline: true });
    doc.fontSize(10).fillColor("#333");
    doc.text(`${order.firstName} ${order.lastName}`);
    doc.text(order.email);
    if (order.address) {
      doc.text(`${order.address}${order.addressComp ? ", " + order.addressComp : ""}`);
      doc.text(`${order.postalCode || ""} ${order.city || ""}`);
      doc.text(order.country);
    }

    doc.moveDown(1.5);

    const formulaLabel = order.formula === "PHYSICAL_CARD" ? "Carte mémoire physique" : "Fichiers seuls";
    const description = `Activation CarPlay — ${order.vehicleTitle} (année ${order.vehicleYear}) — ${formulaLabel}`;

    const tableTop = doc.y;
    doc.fontSize(10).fillColor("#000");
    doc.text("Description", 50, tableTop, { width: 350 });
    doc.text("Montant", 420, tableTop, { width: 100, align: "right" });
    doc.moveTo(50, tableTop + 16).lineTo(520, tableTop + 16).strokeColor("#ccc").stroke();

    const rowY = tableTop + 26;
    doc.fillColor("#333").text(description, 50, rowY, { width: 350 });
    doc.text(eur(order.priceCents), 420, rowY, { width: 100, align: "right" });

    doc.moveTo(50, rowY + 30).lineTo(520, rowY + 30).strokeColor("#ccc").stroke();

    doc.fontSize(12).fillColor("#000").text("Total TTC", 300, rowY + 42, { width: 120, align: "right" });
    doc.fontSize(12).text(eur(order.priceCents), 420, rowY + 42, { width: 100, align: "right" });

    doc.fontSize(9).fillColor("#777").text(
      `Moyen de paiement : ${order.paymentMethod === "PAYPAL" ? "PayPal" : order.paymentMethod === "STRIPE" ? "Carte bancaire" : "—"}`,
      50,
      rowY + 70
    );

    doc.moveDown(4);
    doc.fontSize(8).fillColor("#999").text(
      "Facture générée automatiquement, sans signature manuscrite requise.",
      50,
      doc.page.height - 80,
      { width: 500, align: "center" }
    );

    doc.end();
  });
}
