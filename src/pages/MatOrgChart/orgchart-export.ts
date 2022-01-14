import { createOrgChartPdf } from "./orgchart-to-pdf";
import { MatOrgChartNode } from "./pensum-to-orgdata";
import FileSaver from "file-saver";
import type pdfjsLib from "pdfjs-dist";
import { getDateIdentifier } from "lib/format-utils";

function getPdfBlob(title: string, items: MatOrgChartNode[]) {
  return new Promise<Blob>((resolve, reject) => {
    createOrgChartPdf(title, items).then(stream => {
      if (stream == null) {
        reject('Error: Failed to create pdf stream!')
        return
      }
  
      stream.on('finish', function () {
        const blob = stream.toBlob('application/pdf');
        resolve(blob)
      });
    })
  })
}

export function previewPdf(title: string, items: MatOrgChartNode[]) {
  getPdfBlob(title, items)
    .then(blob => {
      const url = URL.createObjectURL(blob)
      window.open(url)
    })
    .catch(e => alert(e))
}

export function downloadPdf(title: string, items: MatOrgChartNode[], filename: string) {
  getPdfBlob(title, items)
    .then(blob => {
      FileSaver.saveAs(blob, filename + '.pdf');
    })
    .catch(e => alert(e))
}

export function downloadPng(title: string, items: MatOrgChartNode[], filename: string, resize = 1.5) {
  getPngUrl(title, items)
    .then(url => {
      FileSaver.saveAs(url, filename + '.png');
    })
    // .catch(e => alert(e))
}

async function getPngUrl(title: string, items: MatOrgChartNode[], scale = 1.5) {  
  const blob = await getPdfBlob(title, items)
  const buffer = await blob.arrayBuffer()

  /**
   * Yep.... this is the most sane way to use pdfjs on a browser. 
   * 1. Webpack config override -> config.externals
   * 2. Load pdf.js directly into HTML (with its configuration for workerSrc...)
   * 3. Use this abomination
   */
  const pdfjs = (window as any)['pdfjsLib'] as typeof pdfjsLib
  
  // Load pdf page
  var pdf = await pdfjs.getDocument(buffer as any).promise
  
  var page = await pdf.getPage(1)
  var viewport = page.getViewport({ scale })

  // Render to canvas
  var canvas = document.createElement('canvas')
  document.body.appendChild(canvas)
  var ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Unable to get canvas context!')
  }

  canvas.width = viewport.width
  canvas.height = viewport.height

  var task = page.render({ canvasContext: ctx, viewport })
  await task.promise

  // Save as png string
  var png = canvas.toDataURL('image/png')

  // Remove canvas
  document.body.removeChild(canvas)

  return png
}

export function getPensumFilename(pensum: Pensum.Pensum | null) {
  return (pensum ? pensum.code + ' ' + pensum.career : 'EXPORT') + ' ' + getDateIdentifier()
}