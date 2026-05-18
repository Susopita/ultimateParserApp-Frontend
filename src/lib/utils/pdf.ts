/**
 * PDF export utilities for parsing tables.
 * Uses jsPDF + jspdf-autotable loaded dynamically to avoid SSR issues.
 */

export type LL1TableSpec = {
  kind: 'll1';
  label: string;
  table: Record<string, Record<string, string>>;
};

export type LRTableSpec = {
  kind: 'lr';
  label: string;
  action_table: Record<string, Record<string, string>>;
  goto_table: Record<string, Record<string, string>>;
  terminals: string[];
  non_terminals: string[];
  stateCount: number;
};

export type TableSpec = LL1TableSpec | LRTableSpec;

type RGB = [number, number, number];

const c = (r: number, g: number, b: number): RGB => [r, g, b];

// ─── Shared helpers ─────────────────────────────────────────────────

function ll1Rows(table: Record<string, Record<string, string>>) {
  const nts = Object.keys(table).sort();
  const cols = [
    ...new Set(Object.values(table).flatMap((r) => Object.keys(r))),
  ].sort((a, b) => (a === '$' ? 1 : b === '$' ? -1 : a.localeCompare(b)));

  const head = [['Non-Terminal', ...cols]];
  const body = nts.map((nt) => [nt, ...cols.map((t) => table[nt]?.[t] || '—')]);
  return { head, body };
}

function lrRows(spec: LRTableSpec) {
  const { action_table, goto_table, terminals, non_terminals, stateCount } = spec;
  const states = Array.from({ length: stateCount }, (_, i) => i.toString());

  const CYAN  = c(6, 182, 212);
  const AMBER = c(245, 158, 11);

  const head = [
    [
      { content: 'State', rowSpan: 2, styles: { valign: 'middle' as const, halign: 'center' as const } },
      ...(terminals.length > 0
        ? [{ content: 'ACTION', colSpan: terminals.length, styles: { halign: 'center' as const, textColor: CYAN } }]
        : []),
      ...(non_terminals.length > 0
        ? [{ content: 'GOTO', colSpan: non_terminals.length, styles: { halign: 'center' as const, textColor: AMBER } }]
        : []),
    ],
    [
      ...terminals.map((t) => ({ content: t, styles: { textColor: CYAN } })),
      ...non_terminals.map((nt) => ({ content: nt, styles: { textColor: AMBER } })),
    ],
  ];

  const body = states.map((sid) => [
    sid,
    ...terminals.map((t) => action_table[sid]?.[t] || '—'),
    ...non_terminals.map((nt) => goto_table[sid]?.[nt] || '—'),
  ]);

  return { head, body };
}

// ─── Core export ────────────────────────────────────────────────────

export async function exportTablesPDF(specs: TableSpec[], filename: string) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const PAGE_W = 297;
  const MARGIN = 14;
  const timestamp = new Date().toLocaleString();

  const DARK    = c(15, 23, 42);
  const DARK2   = c(30, 41, 59);
  const LIGHT   = c(226, 232, 240);
  const ALT_ROW = c(248, 250, 252);
  const LINE    = c(51, 65, 85);
  const MUTED   = c(148, 163, 184);
  const WHITE   = c(255, 255, 255);
  const AMBER   = c(245, 158, 11);
  const GREEN   = c(22, 163, 74);
  const CYAN    = c(6, 182, 212);
  const ORANGE  = c(217, 119, 6);

  specs.forEach((spec, idx) => {
    if (idx > 0) doc.addPage();

    // Dark header bar
    doc.setFillColor(...DARK);
    doc.roundedRect(MARGIN, 8, PAGE_W - MARGIN * 2, 12, 2, 2, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...WHITE);
    doc.text(spec.label, MARGIN + 4, 16.5);

    if (specs.length > 1) {
      doc.setFontSize(8);
      doc.setTextColor(...MUTED);
      doc.text(`Table ${idx + 1} of ${specs.length}`, PAGE_W - MARGIN - 4, 16.5, { align: 'right' });
    }

    if (spec.kind === 'll1') {
      const { head, body } = ll1Rows(spec.table);
      autoTable(doc, {
        head,
        body,
        startY: 24,
        styles: { font: 'courier', fontSize: 9, cellPadding: 3, lineColor: LINE, lineWidth: 0.2 },
        headStyles: { fillColor: DARK2, textColor: AMBER, fontStyle: 'bold', halign: 'center' as const },
        alternateRowStyles: { fillColor: ALT_ROW },
        columnStyles: {
          0: { fontStyle: 'bold', fillColor: DARK2, textColor: LIGHT, halign: 'center' as const },
        },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index > 0 && data.cell.raw === '—') {
            data.cell.styles.textColor = MUTED;
          }
        },
      });
    } else {
      const { head, body } = lrRows(spec);
      autoTable(doc, {
        head,
        body,
        startY: 24,
        styles: { font: 'courier', fontSize: 8, cellPadding: 2.5, lineColor: LINE, lineWidth: 0.2, halign: 'center' as const },
        headStyles: { fillColor: DARK, textColor: WHITE, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: ALT_ROW },
        columnStyles: {
          0: { fontStyle: 'bold', fillColor: DARK2, textColor: LIGHT },
        },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index > 0) {
            const val = String(data.cell.raw);
            if (val === 'acc')           data.cell.styles.textColor = GREEN;
            else if (val.startsWith('s')) data.cell.styles.textColor = CYAN;
            else if (val.startsWith('r')) data.cell.styles.textColor = ORANGE;
            else if (val === '—')         data.cell.styles.textColor = MUTED;
          }
        },
      });
    }
  });

  // Footer on every page
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text(`Ultimate Parser  ·  ${timestamp}`, MARGIN, 207);
    doc.text(`${p} / ${total}`, PAGE_W - MARGIN, 207, { align: 'right' });
  }

  doc.save(filename);
}

// ─── Convenience wrappers ────────────────────────────────────────────

export function downloadLL1PDF(table: Record<string, Record<string, string>>) {
  return exportTablesPDF(
    [{ kind: 'll1', label: 'LL(1) — Parsing Table M', table }],
    'll1-table.pdf',
  );
}

export function downloadLRPDF(
  parserName: string,
  action_table: Record<string, Record<string, string>>,
  goto_table: Record<string, Record<string, string>>,
  terminals: string[],
  non_terminals: string[],
  stateCount: number,
) {
  const safe = parserName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  return exportTablesPDF(
    [{ kind: 'lr', label: `${parserName} — ACTION / GOTO Table`, action_table, goto_table, terminals, non_terminals, stateCount }],
    `${safe}-table.pdf`,
  );
}
