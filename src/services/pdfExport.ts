import { jsPDF } from 'jspdf';
import { Trip, ItineraryDay, DestinationWeather } from '../types';

export interface PdfExportOptions {
  includeBudget?: boolean;
  includeWeather?: boolean;
  includeNotes?: boolean;
  weatherData?: DestinationWeather | null;
}

/**
 * Generates a clean, professional, publication-quality PDF itinerary for a trip.
 */
export async function generateTripItineraryPdf(
  trip: Trip,
  days: ItineraryDay[],
  options: PdfExportOptions = {}
): Promise<void> {
  const {
    includeBudget = true,
    includeWeather = true,
    includeNotes = true,
    weatherData = null,
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // ~210 mm
  const pageHeight = doc.internal.pageSize.getHeight(); // ~297 mm
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2; // ~182 mm
  let cursorY = 16;

  const checkPageBreak = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - 20) {
      doc.addPage();
      cursorY = 20;
      // Draw minimal header on subsequent pages
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(140, 150, 165);
      doc.text(`TRIPNEST TRAVEL ITINERARY • ${trip.tripName.toUpperCase()} (${trip.destination})`, marginX, 12);
      doc.setDrawColor(230, 235, 245);
      doc.setLineWidth(0.3);
      doc.line(marginX, 14, pageWidth - marginX, 14);
    }
  };

  // ==========================================
  // 1. BRAND HEADER & HERO SECTION (PAGE 1)
  // ==========================================
  // Header background pill
  doc.setFillColor(30, 41, 59); // Slate 800
  doc.roundedRect(marginX, cursorY, contentWidth, 38, 3, 3, 'F');

  // Accent gradient line on top
  doc.setFillColor(79, 70, 229); // Indigo 600
  doc.roundedRect(marginX, cursorY, contentWidth, 2.5, 1, 1, 'F');

  // Brand Name & Tagline
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(165, 180, 252); // Indigo 200
  doc.text('TRIPNEST OFFICIAL TRAVEL ITINERARY', marginX + 6, cursorY + 9);

  // Trip Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  const titleText = doc.splitTextToSize(trip.tripName, contentWidth - 50);
  doc.text(titleText[0], marginX + 6, cursorY + 17);

  // Destination & Details
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(226, 232, 240); // Slate 200
  doc.text(
    `Destination: ${trip.destination}, ${trip.country}   |   Dates: ${trip.startDate} - ${trip.endDate}`,
    marginX + 6,
    cursorY + 24
  );

  // Sub-metrics
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text(
    `Travelers: ${trip.travelers}   •   Style: ${trip.travelStyle || 'Standard'}   •   Status: ${trip.status}   •   Planner: ${trip.ownerName || 'Trip Host'}`,
    marginX + 6,
    cursorY + 31
  );

  // Top right badge
  doc.setFillColor(79, 70, 229);
  doc.roundedRect(pageWidth - marginX - 38, cursorY + 7, 32, 7, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('CONFIRMED TRIP', pageWidth - marginX - 36, cursorY + 11.8);

  cursorY += 43;

  // ==========================================
  // 2. BUDGET & FINANCIAL SUMMARY (Optional)
  // ==========================================
  if (includeBudget && trip.budget) {
    checkPageBreak(26);
    doc.setFillColor(248, 250, 252); // Slate 50
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(marginX, cursorY, contentWidth, 22, 2, 2, 'FD');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text('FINANCIAL & BUDGET OVERVIEW', marginX + 5, cursorY + 6);

    const totalBudget = trip.budget || 0;
    const spent = trip.spent || 0;
    const remaining = Math.max(0, totalBudget - spent);
    const curr = trip.currency || 'USD';

    // 3 Metric columns
    const colW = (contentWidth - 10) / 3;
    const labels = [
      { label: 'Total Allocated Budget', val: `${curr} ${totalBudget.toLocaleString()}` },
      { label: 'Recorded Spending', val: `${curr} ${spent.toLocaleString()}` },
      { label: 'Estimated Remaining', val: `${curr} ${remaining.toLocaleString()}` },
    ];

    labels.forEach((item, idx) => {
      const colX = marginX + 5 + idx * colW;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(item.label, colX, cursorY + 12);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text(item.val, colX, cursorY + 18);
    });

    cursorY += 27;
  }

  // ==========================================
  // 3. WEATHER & DESTINATION CONDITIONS (Optional)
  // ==========================================
  if (includeWeather && weatherData) {
    checkPageBreak(28);
    doc.setFillColor(238, 242, 255); // Indigo 50
    doc.setDrawColor(199, 210, 254);
    doc.setLineWidth(0.3);
    doc.roundedRect(marginX, cursorY, contentWidth, 24, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(67, 56, 202); // Indigo 700
    doc.text(`DESTINATION CLIMATE & WEATHER (${trip.destination.toUpperCase()})`, marginX + 5, cursorY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(
      `Current: ${weatherData.currentTemp}°C, ${weatherData.condition}  |  Humidity: ${weatherData.humidity}%  |  Wind: ${weatherData.windSpeed}  |  UV Index: ${weatherData.uvIndex ?? 5.5}`,
      marginX + 5,
      cursorY + 12
    );

    // Weather advice / packing tip from first forecast day
    const packingTip = weatherData.forecast?.[0]?.packingTip || 'Light, breathable apparel with comfortable walking sneakers recommended.';
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Packing Advisory: "${packingTip}"`, marginX + 5, cursorY + 18);

    cursorY += 29;
  }

  // ==========================================
  // 4. DAY-BY-DAY ITINERARY SCHEDULE
  // ==========================================
  checkPageBreak(15);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text('DAILY ITINERARY & PLANNED ACTIVITIES', marginX, cursorY);
  cursorY += 4;

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(marginX, cursorY, pageWidth - marginX, cursorY);
  cursorY += 6;

  if (!days || days.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('No scheduled activities recorded yet for this itinerary.', marginX, cursorY);
    cursorY += 10;
  } else {
    days.forEach((day) => {
      // Day Header box
      checkPageBreak(25);
      doc.setFillColor(241, 245, 249); // Slate 100
      doc.roundedRect(marginX, cursorY, contentWidth, 8.5, 1.5, 1.5, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59);
      doc.text(`DAY ${day.dayNumber} • ${day.date} — ${day.title}`, marginX + 4, cursorY + 5.8);

      cursorY += 12;

      // Day Summary (if available)
      if (day.summary) {
        checkPageBreak(10);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        const splitSummary = doc.splitTextToSize(`"${day.summary}"`, contentWidth - 8);
        doc.text(splitSummary, marginX + 4, cursorY);
        cursorY += splitSummary.length * 4 + 2;
      }

      // Activities list for this day
      if (!day.activities || day.activities.length === 0) {
        checkPageBreak(8);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text('• Leisure / Open exploration time (No set activities scheduled).', marginX + 6, cursorY);
        cursorY += 7;
      } else {
        day.activities.forEach((act, actIndex) => {
          // Estimate height needed for this activity
          const notesText = includeNotes && act.notes ? doc.splitTextToSize(`Notes: ${act.notes}`, contentWidth - 45) : [];
          const actHeight = 12 + (notesText.length > 0 ? notesText.length * 3.5 + 2 : 0);

          checkPageBreak(actHeight);

          // Subtle left border marker
          doc.setDrawColor(79, 70, 229);
          doc.setLineWidth(1.2);
          doc.line(marginX + 2, cursorY, marginX + 2, cursorY + actHeight - 3);

          // Time slot badge
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(79, 70, 229);
          const timeStr = `${act.startTime || 'Flexible'} - ${act.endTime || ''}`.trim().replace(/-$/, '');
          doc.text(timeStr, marginX + 6, cursorY + 3.5);

          // Activity Name & Category
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(15, 23, 42);
          doc.text(act.name, marginX + 38, cursorY + 3.5);

          // Category Pill Text
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(100, 116, 139);
          doc.text(`[${act.category || 'General'}]`, marginX + 38 + doc.getTextWidth(act.name) + 3, cursorY + 3.5);

          // Cost (aligned right)
          if (act.cost) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.setTextColor(51, 65, 85);
            const costText = `${act.currency || trip.currency || 'USD'} ${act.cost.toFixed(2)}`;
            doc.text(costText, pageWidth - marginX - 3, cursorY + 3.5, { align: 'right' });
          }

          // Location
          if (act.location) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7.5);
            doc.setTextColor(100, 116, 139);
            const locText = doc.splitTextToSize(`Location: ${act.location}`, contentWidth - 45);
            doc.text(locText[0], marginX + 38, cursorY + 7.5);
          }

          // Notes / Confirmation Codes
          if (notesText.length > 0) {
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(7);
            doc.setTextColor(71, 85, 105);
            doc.text(notesText, marginX + 38, cursorY + 11.5);
          }

          cursorY += actHeight;
        });
      }

      cursorY += 4;
    });
  }

  // ==========================================
  // 5. EMERGENCY CONTACTS & TRAVEL NOTES
  // ==========================================
  checkPageBreak(25);
  doc.setFillColor(254, 242, 242); // Rose 50
  doc.setDrawColor(254, 202, 202);
  doc.setLineWidth(0.3);
  doc.roundedRect(marginX, cursorY, contentWidth, 20, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(185, 28, 28); // Rose 700
  doc.text('TRAVEL ADVISORY & EMERGENCY CONTACTS', marginX + 5, cursorY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text(
    `Local Emergency in ${trip.country}: 112 (EU/Global)   •   Keep digital copies of passport & travel insurance in TripNest Document Vault.`,
    marginX + 5,
    cursorY + 10.5
  );
  doc.text(
    'Have hotel booking references and international roaming active prior to transit.',
    marginX + 5,
    cursorY + 15
  );

  // ==========================================
  // 6. PAGE NUMBERING & FOOTER (ALL PAGES)
  // ==========================================
  const totalPages = doc.getNumberOfPages();
  const generationTime = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);

    // Top divider for footer
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(marginX, pageHeight - 11, pageWidth - marginX, pageHeight - 11);

    // Left footer: generated timestamp
    doc.text(`Generated on ${generationTime} • TripNest Travel Companion`, marginX, pageHeight - 7);

    // Right footer: page number
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - marginX, pageHeight - 7, { align: 'right' });
  }

  // Trigger browser download
  const cleanDestName = (trip.destination || 'Trip').replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `TripNest_${cleanDestName}_Itinerary.pdf`;
  doc.save(filename);
}
