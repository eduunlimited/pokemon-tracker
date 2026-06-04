import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { calculateMileageDeduction, summarizeMileageTrips } from "@/lib/calculations";
import { APP_NAME } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/formatters";
import type { MileageTrip } from "@/lib/types";

export function getTripRouteLabel(trip: MileageTrip): string {
  if (trip.routeSummary?.trim()) {
    return trip.routeSummary;
  }

  if (trip.purpose?.trim()) {
    return trip.purpose;
  }

  return trip.mode === "manual" ? "Manual entry" : "—";
}

/** jsPDF Helvetica cannot render Unicode arrows/dashes reliably. */
export function formatTextForPdf(text: string): string {
  return text
    .replace(/\u2192/g, " -> ")
    .replace(/\u2014/g, "-")
    .replace(/\u2013/g, "-")
    .replace(/\u2026/g, "...");
}

export function getTripRouteLabelForPdf(trip: MileageTrip): string {
  return formatTextForPdf(getTripRouteLabel(trip));
}

export interface MileageReportPdfOptions {
  trips: MileageTrip[];
  year: number;
}

export function downloadMileageReportPdf({
  trips,
  year,
}: MileageReportPdfOptions): void {
  const sortedTrips = [...trips].sort((a, b) => a.date.localeCompare(b.date));
  const summary = summarizeMileageTrips(sortedTrips);
  const generatedAt = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "letter" });
  const margin = 40;
  const tableWidth = doc.internal.pageSize.getWidth() - margin * 2;
  const dateWidth = 84;
  const milesWidth = 56;
  const deductionWidth = 72;
  const routeWidth = tableWidth - dateWidth - milesWidth - deductionWidth;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(`${APP_NAME} — Mileage Report`, 40, 48);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  doc.text(`Calendar year: ${year}`, 40, 68);
  doc.text(`Generated: ${generatedAt}`, 40, 84);
  doc.setTextColor(0, 0, 0);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`Total miles driven: ${summary.miles.toFixed(1)} mi`, 40, 112);
  doc.text(`Total deduction: ${formatCurrency(summary.deduction)}`, 40, 130);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(
    `${summary.tripCount} trip${summary.tripCount === 1 ? "" : "s"} in ${year}`,
    40,
    146,
  );
  doc.setTextColor(0, 0, 0);

  autoTable(doc, {
    startY: 164,
    head: [["Date", "Miles", "Route", "Deduction"]],
    body: sortedTrips.map((trip) => [
      formatDate(trip.date),
      `${trip.miles.toFixed(1)} mi`,
      getTripRouteLabelForPdf(trip),
      formatCurrency(calculateMileageDeduction(trip)),
    ]),
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 5,
      overflow: "linebreak",
      valign: "top",
    },
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 10,
    },
    columnStyles: {
      0: { cellWidth: dateWidth },
      1: { cellWidth: milesWidth, halign: "right" },
      2: { cellWidth: routeWidth, overflow: "linebreak" },
      3: { cellWidth: deductionWidth, halign: "right" },
    },
    margin: { left: margin, right: margin },
    tableWidth,
  });

  doc.save(`mileage-report-${year}.pdf`);
}
