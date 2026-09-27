import { useRef } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import './BillInvoice.css'

function BillInvoice({ bill, onClose }) {
  const invoiceRef = useRef(null)

  const formatCurrency = (val) => {
    const n = Number(val) || 0
    return n.toFixed(2)
  }

  const formatInvoiceDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    return `${dd}/${mm}/${yyyy}`
  }

  const handleDownload = async () => {
    const element = invoiceRef.current
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = pageWidth - 20 // 10mm margin each side
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    const xOffset = 10
    const yOffset = 10

    // If image fits one page
    if (imgHeight + yOffset * 2 <= pageHeight) {
      pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight)
    } else {
      // Multi-page
      let y = yOffset
      pdf.addImage(imgData, 'PNG', xOffset, y, imgWidth, imgHeight)
    }

    pdf.save(`Invoice_${bill.id}_${bill.shopName}.pdf`)
  }

  const handlePrint = () => {
    const printContents = invoiceRef.current.innerHTML
    const win = window.open('', '_blank', 'width=900,height=700')
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice #${bill.id} - ${bill.shopName}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Courier New', monospace; font-size: 11px; padding: 16px; color: #000; }
          .invoice-doc { width: 100%; }
          .invoice-title { text-align: center; font-size: 16px; font-weight: bold; letter-spacing: 2px; margin-bottom: 4px; }
          .invoice-meta { display: flex; justify-content: space-between; margin-bottom: 6px; }
          .invoice-meta-left, .invoice-meta-right { font-size: 11px; line-height: 1.6; }
          .invoice-divider { border: none; border-top: 1px dashed #000; margin: 6px 0; }
          .customer-section { margin-bottom: 6px; line-height: 1.6; }
          .invoice-table { width: 100%; border-collapse: collapse; margin-top: 4px; font-size: 10px; }
          .invoice-table th, .invoice-table td { border: 1px solid #000; padding: 3px 5px; text-align: center; }
          .invoice-table th { background: #f0f0f0; font-weight: bold; font-size: 9px; text-transform: uppercase; }
          .invoice-table .text-left { text-align: left; }
          .invoice-table .text-right { text-align: right; }
          .invoice-totals { margin-top: 8px; text-align: right; line-height: 1.8; font-size: 12px; }
          .invoice-totals .grand-total { font-size: 14px; font-weight: bold; border-top: 2px solid #000; padding-top: 4px; margin-top: 4px; }
          .invoice-footer { margin-top: 16px; display: flex; justify-content: space-between; font-size: 10px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>${printContents}</body>
      </html>
    `)
    win.document.close()
    setTimeout(() => { win.print() }, 400)
  }

  if (!bill) return null

  const grossTotal = (bill.products || []).reduce((s, p) => s + (Number(p.grossAmount) || 0), 0)
  const totalCgstAmount = Number(bill.totalCgstAmount || 0)
  const totalSgstAmount = Number(bill.totalSgstAmount || 0)
  const gstTotal = totalCgstAmount + totalSgstAmount

  return (
    <div className="invoice-overlay" onClick={onClose}>
      <div className="invoice-modal" onClick={(e) => e.stopPropagation()}>
        {/* Toolbar */}
        <div className="invoice-toolbar">
          <span className="invoice-toolbar-title">Invoice Preview</span>
          <div className="invoice-toolbar-actions">
            <button className="btn btn-primary btn-sm" onClick={handleDownload}>
              ↓ Download PDF
            </button>
            <button className="btn btn-sm" onClick={handlePrint}>
              🖨 Print
            </button>
            <button className="btn btn-sm" onClick={onClose}>✕ Close</button>
          </div>
        </div>

        {/* Invoice content */}
        <div className="invoice-paper" ref={invoiceRef}>
          <div className="invoice-doc">
            {/* Header */}
            <div className="invoice-title">GST INVOICE</div>
            <div className="invoice-subtitle">Tax Invoice</div>

            <hr className="invoice-divider" />

            {/* Company + Invoice meta */}
            <div className="invoice-meta">
              <div className="invoice-meta-left">
                <strong>{bill.companyName || 'Khurana Enterprise'}</strong><br />
                {bill.ownerAddress || 'Naveen Nagar'}<br />
                GST No. : {bill.ownerGstNumber || '—'}
              </div>
              <div className="invoice-meta-right">
                Inv. No. : <strong>{bill.id}</strong><br />
                Date : <strong>{formatInvoiceDate(bill.billDate)}</strong>
              </div>
            </div>

            <hr className="invoice-divider" />

            {/* Customer */}
            <div className="customer-section">
              M/S : <strong>{bill.shopName}</strong><br />
              {bill.customerGstNumber && (
                <>GST No. : {bill.customerGstNumber}<br /></>
              )}
            </div>

            <hr className="invoice-divider" />

            {/* Products table */}
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>HSN</th>
                  <th>Particulars</th>
                  <th>Qty</th>
                  <th>M.R.P.</th>
                  <th>Rate</th>
                  <th>cgst</th>
                  <th>sgst</th>
                  <th>cgstAmount</th>
                  <th>sgstAmount</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {(bill.products || []).map((p, i) => (
                  <tr key={i}>
                    <td>{p.serialNo || i + 1}</td>
                    <td>{p.hsnCode || '—'}</td>
                    <td className="text-left">{p.productName}</td>
                    <td>{p.quantity} PCS</td>
                    <td className="text-right">{formatCurrency(p.mrp)}</td>
                    <td className="text-right">{formatCurrency(p.price)}</td>
                    <td>{p.cgstRate || p.gstRate ? `${Number(p.cgstRate ?? p.gstRate ?? 0)}%` : '—'}</td>
                    <td>{p.sgstRate || p.gstRate ? `${Number(p.sgstRate ?? p.gstRate ?? 0)}%` : '—'}</td>
                    <td className="text-right">{formatCurrency(p.cgstAmount ?? 0)}</td>
                    <td className="text-right">{formatCurrency(p.sgstAmount ?? 0)}</td>
                    <td className="text-right">{formatCurrency(p.amount ?? (p.grossAmount || 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="invoice-totals">
              {bill.gstApplied && (
                <>
                  <div>Gross Total : ₹{formatCurrency(grossTotal)}</div>
                  <div>CGST Amount : ₹{formatCurrency(totalCgstAmount)}</div>
                  <div>SGST Amount : ₹{formatCurrency(totalSgstAmount)}</div>
                  <div>GST Amount : ₹{formatCurrency(gstTotal)}</div>
                </>
              )}
              <div className="grand-total">
                Total : ₹{formatCurrency(bill.totalAmount)}
              </div>
            </div>

            <div className="invoice-signoff">
              <span>Amount in words: INR {formatCurrency(bill.totalAmount)} Only</span>
            </div>

            <hr className="invoice-divider" />

            {/* Footer */}
            <div className="invoice-footer">
              <div>
                <em>Thank you for your business!</em>
              </div>
              <div>
                <strong>For {bill.companyName || 'Khurana Enterprise'}</strong><br />
                Authorised Signatory
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BillInvoice
