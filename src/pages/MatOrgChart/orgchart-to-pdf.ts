import { Enabled, FamDiagramPdfkit } from "basicprimitives";
import { getMatTemplate } from "./orgchart-config";
import type PDFDocumentType from "pdfkit"; // Use as a type so it doesn't crash on load.
import blobStream from "blob-stream";
import { MatOrgChartNode } from "./pensum-to-orgdata";
import orgChartConfig from "./orgchart-config";

const template = getMatTemplate()

type RenderType = Record<string, (
  contentSize: { width: number, height: number },
  item: MatOrgChartNode,
  pos: { x: number, y: number, width: number, height: number },
  doc: typeof PDFDocumentType) => any> 

const render: RenderType = {

  container(contentSize, item, pos, doc) {
    const STATUS_COLORS = {
      passed: '#e6ffe8',
      course: '#fff9de',
      error:  '#ff4444',
      default: '#f2f9ff',
    }

    const statusColor = (STATUS_COLORS as any)[item.selectionClass] || STATUS_COLORS.default

    doc.roundedRect(pos.x, pos.y, pos.width, pos.height, 5)
      .fill(statusColor);

    doc.roundedRect(pos.x + 0.5, pos.y + 0.5, pos.width - 1, pos.height - 1, 5)
      .lineWidth(1)
      .stroke('#dddddd');
  },

  credits(contentSize, item, pos, doc) {
    let CR_COLORS = {
      0: '#eb9cff',
      1: '#c5f25c',
      2: '#ffc773',
      3: '#f57936',
      default: '#cf1f1f'
    };

    doc.polygon(
      [pos.x + pos.width - 30, pos.y],
      [pos.x + pos.width, pos.y],
      [pos.x + pos.width, pos.y + 30],
    ).fill(((CR_COLORS as any)[item.cr]) || CR_COLORS.default);

    doc.fontSize(12)
      .fillColor('white')
      .font('Helvetica')
      .text(item.cr,
        pos.x + pos.width - 12,
        pos.y + 7,
        {
          ellipsis: false,
          width: 10,
          height: 1,
          align: 'right'
        });
  },

  code(contentSize, item, pos, doc) {
    doc.fontSize(12)
      .fillColor('black')
      .font('Helvetica')
      .text(`[${item.code}]`,
        pos.x + 7,
        pos.y + 7,
        {
          ellipsis: false,
          width: (contentSize.width - 7 - 7),
          height: 16,
          align: 'center'
        });
  },
  
  name(contentSize, item, pos, doc) {
    doc.fontSize(14)
      .fillColor('black')
      .font('Helvetica')
      .text(item.name,
        pos.x + 7,
        pos.y + 7 + 16 + 5, {
        ellipsis: false,
        width: (contentSize.width - 7 - 7),
        height: 60,
        align: 'center'
      });
  },

  period(contentSize, item, pos, doc) {
    doc.fontSize(12)
      .fillColor('darkgray')
      .font('Helvetica')
      .text(item.period,
        pos.x + 7,
        pos.y + 100 - 12 - 7, {
        ellipsis: false,
        width: (contentSize.width - 7 - 7),
        height: 60,
        align: 'center'
      });
  }
  
}



export async function createOrgChartPdf(title: string, items: MatOrgChartNode[]) {
  const config = { ...orgChartConfig, templates: [template], onItemRender: onPdfTemplateRender }
  
  var chart = FamDiagramPdfkit({
    ...config,
    items,
    cursorItem: null,
    hasSelectorCheckbox: Enabled.False
  }, [template]);

  var chartSize = chart.getSize();

  try {
    var PDFDocument = (await import('pdfkit')).default
  }
  catch (e) {
    alert('No se puede crear PDF!')
    throw e
  }

  var doc = new PDFDocument({
    size: [chartSize.width + 100, chartSize.height + 150]
  });
  var stream = doc.pipe(blobStream())

  doc.save();
  doc.fontSize(25).text(title);


  chart.draw(doc, 30, 100);
  doc.restore();
  doc.end();
  return stream
}

/** Gets the data for each item. */
function onPdfTemplateRender(doc: any, pos: any, data: any) {
  const item = data.context as MatOrgChartNode;//i_mat;

  if (data.templateName !== "matTemplate") return;

  const contentSize = { width: 200, height: 100 };

  // Container box color
  render.container(contentSize, item, pos, doc)
  render.credits(contentSize, item, pos, doc)
  render.code(contentSize, item, pos, doc)
  render.name(contentSize, item, pos, doc)
  render.period(contentSize, item, pos, doc)
}