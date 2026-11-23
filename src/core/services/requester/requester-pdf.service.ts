/* eslint-disable @typescript-eslint/no-var-requires */
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import type { Content, TDocumentDefinitions, TableCell } from 'pdfmake/interfaces';
import { Requester } from 'src/core/entities/requester/requester.entity';

const PdfPrinter = require('pdfmake');
const vfsModule = require('pdfmake/build/vfs_fonts');
const vfs: Record<string, string> = vfsModule?.pdfMake?.vfs ?? vfsModule?.vfs ?? vfsModule;

// Charte Dekel / BOBRAIN
const GREEN = '#174E26';
const LEAF = '#8DBE48';
const ORANGE = '#F0A020';
const GREY = '#6B7280';
const LINE = '#E5E7EB';

type Lang = 'fr' | 'en';

const I18N: Record<Lang, Record<string, string>> = {
  fr: {
    title: "Demande d'intervention",
    reference: 'Référence',
    status: 'Statut',
    priority: 'Priorité',
    tickets: 'Ticket(s)',
    station: 'Station',
    type: 'Type de requête',
    labAgent: "Agent labo ayant commis l'erreur",
    operator: 'Opératrice concernée',
    branch: 'Société',
    createdBy: 'Demandeur',
    createdAt: 'Date de création',
    problem: 'Description du problème',
    correction: 'Correction à réaliser',
    legacyTitle: 'Ancien titre',
    history: 'Historique',
    step: 'Étape',
    by: 'Par',
    date: 'Date',
    signatures: 'Visas',
    sigRequester: 'Demandeur',
    sigApprover: 'Approbateur',
    sigTreater: 'Traité par',
    printedOn: 'Imprimé le {date} par {user}',
    page: 'Page {p} / {n}',
    created: 'Création',
    approved: 'Approbation',
    rejected: 'Rejet',
    treated: 'Traitement',
    cancelled: 'Annulation',
    closed: 'Clôture',
    Open: 'Ouverte',
    Approved: 'Approuvée',
    Treated: 'Traitée',
    Closed: 'Clôturée',
    Cancelled: 'Annulée',
    Rejected: 'Rejetée',
    Normal: 'Normale',
    Important: 'Importante',
    Urgent: 'Urgente',
  },
  en: {
    title: 'Intervention request',
    reference: 'Reference',
    status: 'Status',
    priority: 'Priority',
    tickets: 'Ticket(s)',
    station: 'Station',
    type: 'Request type',
    labAgent: 'Lab agent who made the error',
    operator: 'Operator concerned',
    branch: 'Company',
    createdBy: 'Requester',
    createdAt: 'Created on',
    problem: 'Problem description',
    correction: 'Correction to perform',
    legacyTitle: 'Former title',
    history: 'History',
    step: 'Step',
    by: 'By',
    date: 'Date',
    signatures: 'Sign-off',
    sigRequester: 'Requester',
    sigApprover: 'Approver',
    sigTreater: 'Processed by',
    printedOn: 'Printed on {date} by {user}',
    page: 'Page {p} / {n}',
    created: 'Created',
    approved: 'Approved',
    rejected: 'Rejected',
    treated: 'Processed',
    cancelled: 'Cancelled',
    closed: 'Closed',
    Open: 'Open',
    Approved: 'Approved',
    Treated: 'Processed',
    Closed: 'Closed',
    Cancelled: 'Cancelled',
    Rejected: 'Rejected',
    Normal: 'Normal',
    Important: 'High',
    Urgent: 'Urgent',
  },
};

/** Caractères absents de la police Roboto embarquée -> équivalents lisibles */
const clean = (t?: string) =>
  (t ?? '')
    .replace(/[→⟶➔➜]/g, '->')
    .replace(/[←⟵]/g, '<-')
    .replace(/[⇒]/g, '=>')
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, '');

const PRIORITY_COLOR: Record<string, string> = { Normal: GREY, Important: ORANGE, Urgent: '#DC2626' };

/**
 * Génération côté serveur du PDF d'une demande (pdfmake, sans navigateur).
 * Logo : assets/bobrain-logo.png (facultatif).
 */
@Injectable()
export class RequesterPdfService {
  private printer = new PdfPrinter({
    Roboto: {
      normal: Buffer.from(vfs['Roboto-Regular.ttf'], 'base64'),
      bold: Buffer.from(vfs['Roboto-Medium.ttf'], 'base64'),
      italics: Buffer.from(vfs['Roboto-Italic.ttf'], 'base64'),
      bolditalics: Buffer.from(vfs['Roboto-MediumItalic.ttf'], 'base64'),
    },
  });

  private logo?: string = (() => {
    const candidates = [
      process.env.APP_PDF_LOGO_PATH,
      path.join(process.cwd(), 'assets', 'bobrain-logo.png'),
    ].filter(Boolean) as string[];
    for (const file of candidates) {
      try {
        if (fs.existsSync(file)) return `data:image/png;base64,${fs.readFileSync(file).toString('base64')}`;
      } catch {
        /* logo facultatif */
      }
    }
    return undefined;
  })();

  async render(requester: Requester, opts: { lang?: string; printedBy?: string } = {}): Promise<Buffer> {
    const lang: Lang = opts.lang === 'en' ? 'en' : 'fr';
    const tr = (k: string) => I18N[lang][k] ?? k;
    const locale = lang === 'en' ? 'en-GB' : 'fr-FR';
    const fmt = (d?: Date | string | null) =>
      d ? new Date(d).toLocaleString(locale, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
    const person = (u: any) =>
      u ? [u.userData?.lastName ?? u.lastName, u.userData?.firstName ?? u.firstName].filter(Boolean).join(' ') || u.username || '—' : '—';

    const r: any = requester;
    const agent = r.labAgent
      ? `${[r.labAgent.lastName, r.labAgent.firstName].filter(Boolean).join(' ')} (${r.labAgent.matricule})`
      : '—';

    const label = (t: string): TableCell => ({ text: t.toUpperCase(), fontSize: 7, color: GREY, bold: true, margin: [0, 0, 0, 2] });
    const value = (t: string): TableCell => ({ text: t || '—', fontSize: 10, bold: true, color: '#111827' });
    const infoCell = (l: string, v: string): TableCell => ({ stack: [label(l), value(v)], margin: [6, 6, 6, 6] });

    const textBlock = (title: string, text: string | undefined, accent: string): Content => ({
      table: {
        widths: [3, '*'],
        body: [
          [
            { text: '', fillColor: accent },
            {
              stack: [
                { text: title.toUpperCase(), fontSize: 8, bold: true, color: GREEN, margin: [0, 0, 0, 4] },
                { text: clean(text).trim() || '—', fontSize: 10, lineHeight: 1.25 },
              ],
              margin: [8, 6, 8, 8],
            },
          ],
        ],
      },
      layout: { hLineWidth: () => 0.5, vLineWidth: () => 0.5, hLineColor: () => LINE, vLineColor: () => LINE },
      margin: [0, 0, 0, 10],
    });

    const history = [
      ['created', r.createdBy, r.createdAt],
      ['approved', r.approvedBy, r.approvedBy ? r.approvedAt : null],
      ['rejected', r.rejectedBy, r.rejectedBy ? r.rejectedAt : null],
      ['treated', r.treatedBy, r.treatedBy ? r.treatedAt : null],
      ['cancelled', r.cancelledBy, r.cancelledBy ? r.cancelledAt : null],
      ['closed', r.closedBy, r.closedBy ? r.closedAt : null],
    ]
      .filter(([, who]) => who)
      .sort((a: any, b: any) => new Date(a[2]).getTime() - new Date(b[2]).getTime());

    const header: Content = {
      columns: [
        this.logo ? { image: this.logo, width: 120 } : { text: 'BOBRAIN', bold: true, fontSize: 18, color: GREEN },
        {
          stack: [
            { text: tr('title').toUpperCase(), fontSize: 9, bold: true, color: ORANGE, alignment: 'right' },
            { text: r.reference ?? '', fontSize: 18, bold: true, color: GREEN, alignment: 'right' },
            {
              text: [
                { text: `${tr('status')} : `, color: GREY },
                { text: tr(r.status), bold: true },
                { text: '   •   ', color: LINE },
                { text: `${tr('priority')} : `, color: GREY },
                { text: tr(r.priority ?? 'Normal'), bold: true, color: PRIORITY_COLOR[r.priority] ?? GREY },
              ],
              fontSize: 9,
              alignment: 'right',
              margin: [0, 2, 0, 0],
            },
          ],
        },
      ],
      margin: [0, 0, 0, 12],
    };

    const docDefinition: TDocumentDefinitions = {
      pageSize: 'A4',
      pageMargins: [36, 36, 36, 54],
      info: { title: `${tr('title')} ${r.reference ?? ''}`, author: 'BOBRAIN Helpdesk' },
      defaultStyle: { font: 'Roboto', fontSize: 10, color: '#111827' },
      content: [
        header,
        { canvas: [{ type: 'rect', x: 0, y: 0, w: 523, h: 3, color: GREEN }], margin: [0, 0, 0, 12] },
        {
          table: {
            widths: ['*', '*', '*'],
            body: [
              [infoCell(tr('tickets'), r.ticket), infoCell(tr('station'), r.station?.displayName), infoCell(tr('type'), r.requesttype?.displayName)],
              [infoCell(tr('labAgent'), agent), infoCell(tr('operator'), person(r.operator)), infoCell(tr('branch'), r.branch?.displayName)],
              [infoCell(tr('createdBy'), person(r.createdBy)), infoCell(tr('createdAt'), fmt(r.createdAt)), infoCell(tr('reference'), r.reference)],
            ],
          },
          layout: { hLineWidth: () => 0.5, vLineWidth: () => 0.5, hLineColor: () => LINE, vLineColor: () => LINE, fillColor: (i: number) => (i % 2 ? '#F9FAFB' : null) },
          margin: [0, 0, 0, 14],
        },
        textBlock(tr('problem'), r.description, ORANGE),
        textBlock(tr('correction'), r.correction, LEAF),
        ...(r.title && !r.correction
          ? [{ text: `${tr('legacyTitle')} : ${r.title}`, fontSize: 8, color: GREY, margin: [0, 0, 0, 10] } as Content]
          : []),
        { text: tr('history').toUpperCase(), fontSize: 8, bold: true, color: GREEN, margin: [0, 6, 0, 4] },
        {
          table: {
            headerRows: 1,
            widths: ['*', '*', 'auto'],
            body: [
              [tr('step'), tr('by'), tr('date')].map((h) => ({ text: h, bold: true, color: 'white', fillColor: GREEN, fontSize: 8, margin: [4, 3, 4, 3] })),
              ...history.map(([k, who, at]: any) => [
                { text: tr(k), fontSize: 9, margin: [4, 3, 4, 3] },
                { text: person(who), fontSize: 9, margin: [4, 3, 4, 3] },
                { text: fmt(at), fontSize: 9, margin: [4, 3, 4, 3] },
              ]),
            ],
          },
          layout: { hLineWidth: () => 0.5, vLineWidth: () => 0, hLineColor: () => LINE },
          margin: [0, 0, 0, 18],
        },
        { text: tr('signatures').toUpperCase(), fontSize: 8, bold: true, color: GREEN, margin: [0, 0, 0, 4] },
        {
          table: {
            widths: ['*', '*', '*'],
            heights: [14, 50],
            body: [
              [tr('sigRequester'), tr('sigApprover'), tr('sigTreater')].map((h) => ({ text: h, fontSize: 8, color: GREY, bold: true })),
              ['', '', ''],
            ],
          },
          layout: { hLineWidth: () => 0.5, vLineWidth: () => 0.5, hLineColor: () => LINE, vLineColor: () => LINE },
        },
      ],
      footer: (currentPage: number, pageCount: number): Content => ({
        margin: [36, 14, 36, 0],
        table: {
          widths: ['*', 'auto'],
          body: [
            [
              {
                text: tr('printedOn').replace('{date}', fmt(new Date())).replace('{user}', opts.printedBy || '—'),
                color: 'white',
                fontSize: 8,
                fillColor: GREEN,
                margin: [8, 5, 8, 5],
              },
              {
                text: tr('page').replace('{p}', String(currentPage)).replace('{n}', String(pageCount)),
                color: 'white',
                bold: true,
                fontSize: 8,
                fillColor: ORANGE,
                margin: [8, 5, 8, 5],
              },
            ],
          ],
        },
        layout: 'noBorders',
      }),
    };

    const doc = this.printer.createPdfKitDocument(docDefinition);
    return await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      doc.on('data', (c: Buffer) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      doc.end();
    });
  }
}
