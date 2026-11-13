import React, { useEffect, useState } from 'react';
import Modal from '../../components/Modal.jsx';
import BankSelect from '../../components/BankSelect.jsx';
import { downloadSalesImportTemplate, importSales } from '../../api/sales.js';
import { triggerDownload } from '../../api/products.js';
import { extractErrorMessage } from '../../api/client.js';
import { useBranchScope } from '../../branch/BranchContext.jsx';

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-ink-500">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

/**
 * Records sales that already happened (a spreadsheet, a paper book, another till): download the template,
 * fill in one row per product line, upload it. Each invoice is recorded on its own, so the results list shows
 * exactly which sales landed and which need a fix - a refused sale records nothing at all.
 */
export default function ImportSalesDialog({ open, onClose, onImported }) {
  const { scope, specificBranchId, branches, isSuperAdmin } = useBranchScope();
  const [file, setFile] = useState(null);
  const [branchId, setBranchId] = useState('');
  const [bankId, setBankId] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (open) {
      setFile(null);
      setError('');
      setSummary(null);
      setBankId('');
      setBranchId(scope === 'SPECIFIC' && specificBranchId ? specificBranchId : '');
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDownload = async () => {
    setDownloading(true);
    setError('');
    try {
      triggerDownload(await downloadSalesImportTemplate(), 'sales-import-template.xlsx');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setDownloading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Choose the filled-in template file first.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const result = await importSales(file, { branchId: branchId || undefined, bankId: bankId || undefined });
      setSummary(result);
      if (result.imported > 0) onImported();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal open={open} title="Import sales" onClose={onClose} size="lg">
      <div className="space-y-3">
        <p className="text-sm text-ink-500">
          For sales that already happened. Download the template and fill in one row per product line. Rows with the
          same Invoice No become one sale; the products must already exist and the branch must have enough stock
          (oldest batch first). Each sale is recorded on its own date. Amount Paid left blank means paid in full; 0
          means a sale on credit.
        </p>

        <button type="button" onClick={handleDownload} disabled={downloading} className="btn btn-secondary btn-sm">
          {downloading ? 'Preparing template...' : 'Download Template (.xlsx)'}
        </button>

        <form onSubmit={handleUpload} className="space-y-3 border-t border-cream-200 pt-3">
          <Field label="Filled-in template">
            <input
              type="file"
              accept=".xlsx"
              className="input"
              onChange={(e) => { setFile(e.target.files?.[0] ?? null); setSummary(null); }}
            />
          </Field>

          {(isSuperAdmin || branchId) && (
            <Field label="Branch for rows with no Branch" hint="Used only where the Branch column of a row is empty.">
              {isSuperAdmin ? (
                <select className="input" value={branchId} onChange={(e) => setBranchId(e.target.value)}>
                  <option value="">None — every row names its branch</option>
                  {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              ) : (
                <p className="text-sm text-ink-700">Your branch</p>
              )}
            </Field>
          )}

          <Field label="Bank for Bank payments (optional)" hint="Needed only if some rows say Bank in Payment Method.">
            <BankSelect value={bankId} onChange={setBankId} />
          </Field>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">Close</button>
            <button type="submit" disabled={uploading || !file} className="btn btn-primary btn-sm">
              {uploading ? 'Importing...' : 'Upload & Import'}
            </button>
          </div>
        </form>

        {summary && (
          <div className="border-t border-cream-200 pt-3">
            <p className="mb-2 text-sm font-medium text-ink-900">
              {summary.imported} of {summary.totalSales} sales imported
              {summary.failed > 0 ? `, ${summary.failed} failed` : ''}
              {` (${summary.totalLines} lines)`}.
            </p>
            {summary.skippedEmptyRows > 0 && (
              <p className="mb-2 text-xs text-ink-500">{summary.skippedEmptyRows} empty rows were skipped.</p>
            )}
            <div className="max-h-64 overflow-y-auto rounded border border-cream-200">
              <table className="w-full text-xs">
                <thead className="bg-cream-50 text-left uppercase tracking-wide text-ink-400">
                  <tr>
                    <th className="px-2 py-1">Row</th>
                    <th className="px-2 py-1">Invoice No</th>
                    <th className="px-2 py-1">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.results.map((r) => (
                    <tr key={r.rowNumber} className="border-t border-cream-100">
                      <td className="px-2 py-1 tabular-nums">{r.rowNumber}</td>
                      <td className="px-2 py-1">{r.invoiceNo || <span className="text-slate-300">—</span>}</td>
                      <td className={`px-2 py-1 ${r.success ? 'text-green-700' : 'text-red-600'}`}>{r.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
