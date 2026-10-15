import { NAV_SECTIONS } from '../../navigation.js';

/**
 * The Roles page shows one card per area of the app. The tick on the card turns on every switch inside it;
 * inside the card, every page and every action has its own tick, so a role can be given the Inventory page
 * without Stock History, or Sales History without Customers and Loans.
 * `pageKeys` lists the switches that OPEN A PAGE (shown under "Pages"); the rest are actions
 * (shown under "Actions").
 *
 * Only the grouping lives here - the switches themselves, and what they allow, are defined by the server.
 * A switch that is not listed (added later on the server) lands in "Other" so it can never be lost.
 */
export const MODULES = [
  { id: 'dashboard', label: 'Dashboard', description: 'The Dashboard page and every panel on it.',
    pageKeys: ['DASHBOARD_VIEW'],
    keys: ['DASHBOARD_VIEW', 'DASHBOARD_REVENUE', 'DASHBOARD_EXPENSES', 'DASHBOARD_LOW_STOCK',
      'DASHBOARD_RECENT_SALES', 'DASHBOARD_RECENT_TRANSFERS', 'DASHBOARD_BRANCH_PERFORMANCE'] },
  { id: 'sales', label: 'Sales & POS', description: 'Sell at the POS and open the sales pages: history, customers, loans and returns.',
    pageKeys: ['POS_ACCESS', 'SALES_VIEW', 'CUSTOMER_VIEW', 'LOAN_VIEW', 'RETURN_VIEW'],
    keys: ['POS_ACCESS', 'SALES_VIEW', 'CUSTOMER_VIEW', 'LOAN_VIEW', 'RETURN_VIEW', 'POS_CHOOSE_BATCH', 'SALES_CREATE', 'SALES_RETURN'] },
  { id: 'sales-sensitive', label: 'Discounts & voiding sales', description: 'Give discounts and cancel sales. Kept apart because they affect money.',
    keys: ['POS_DISCOUNT', 'SALES_VOID'] },
  { id: 'inventory', label: 'Inventory & stock changes', description: 'Open Inventory, Batches and Stock History, and change products and stock.',
    pageKeys: ['INVENTORY_VIEW', 'BATCH_VIEW', 'STOCK_HISTORY_VIEW'],
    keys: ['INVENTORY_VIEW', 'BATCH_VIEW', 'STOCK_HISTORY_VIEW', 'INVENTORY_EDIT', 'PRODUCT_CREATE', 'PRODUCT_EDIT', 'PRODUCT_DELETE', 'STOCK_ADJUST', 'BATCH_CREATE'] },
  { id: 'transfers', label: 'Transfers', description: 'Start transfers and receive stock sent to a branch.',
    pageKeys: ['TRANSFER_CREATE'],
    keys: ['TRANSFER_CREATE', 'TRANSFER_RECEIVE'] },
  { id: 'purchasing', label: 'Purchasing & suppliers', description: 'Purchase orders, receiving purchases and suppliers.',
    pageKeys: ['PURCHASE_CREATE', 'SUPPLIER_MANAGE'],
    keys: ['PURCHASE_CREATE', 'PURCHASE_RECEIVE', 'SUPPLIER_MANAGE'] },
  { id: 'finance', label: 'Finance, expenses & payments', description: 'Open Finance, the Expenses list and Payments, and record expenses.',
    pageKeys: ['FINANCE_VIEW', 'EXPENSE_VIEW', 'PAYMENT_VIEW'],
    keys: ['FINANCE_VIEW', 'EXPENSE_VIEW', 'PAYMENT_VIEW', 'EXPENSE_CREATE'] },
  { id: 'banks', label: 'Bank accounts', description: 'See, register and edit bank accounts.',
    pageKeys: ['BANK_VIEW'],
    keys: ['BANK_VIEW', 'BANK_MANAGE'] },
  { id: 'reports', label: 'Reports', description: 'The Reports page.', pageKeys: ['REPORT_VIEW'], keys: ['REPORT_VIEW'] },
  { id: 'notifications', label: 'Notifications', description: 'The Notifications page and the bell.', pageKeys: ['ACTIVITY_VIEW'], keys: ['ACTIVITY_VIEW'] },
  { id: 'approvals', label: 'Approvals', description: 'Approve stock changes and transfers, and review activity.',
    keys: ['STOCK_APPROVE', 'TRANSFER_APPROVE', 'ACTIVITY_REVIEW'] },
  { id: 'sensitive', label: 'Costs, profit & stock value', description: 'See what stock cost, profit figures and the value of stock on hand, wherever they appear.',
    keys: ['VIEW_COSTS', 'VIEW_PROFIT', 'VIEW_INVENTORY_VALUE'] },
  { id: 'admin', label: 'Administration', description: 'Users, roles, branches and settings.',
    pageKeys: ['USER_MANAGE', 'BRANCH_MANAGE', 'SETTINGS_MANAGE'],
    keys: ['USER_MANAGE', 'BRANCH_MANAGE', 'SETTINGS_MANAGE'] },
];

/** The modules to show for a permission catalog ([{ key, ... }]), each with its catalog items; empty ones dropped. */
export function buildModules(catalog) {
  const byKey = new Map(catalog.map((p) => [p.key, p]));
  const used = new Set();
  const out = MODULES.map((m) => {
    const items = m.keys.filter((k) => byKey.has(k)).map((k) => { used.add(k); return byKey.get(k); });
    const pageSet = new Set(m.pageKeys || []);
    return { ...m, items, pageItems: items.filter((p) => pageSet.has(p.key)), actionItems: items.filter((p) => !pageSet.has(p.key)) };
  }).filter((m) => m.items.length > 0);
  const rest = catalog.filter((p) => !used.has(p.key));
  if (rest.length > 0) {
    out.push({ id: 'other', label: 'Other', description: 'Other switches.', keys: rest.map((p) => p.key), items: rest, pageItems: [], actionItems: rest });
  }
  return out.map((m) => ({ ...m, pages: pagesFor(m.keys) }));
}

/** Page names (from the sidebar list) that one of these switches opens. */
function pagesFor(keys) {
  const set = new Set(keys);
  const pages = [];
  NAV_SECTIONS.forEach((s) => s.items.forEach((i) => {
    if (i.permissions.some((p) => set.has(p))) pages.push(i.label);
  }));
  return pages;
}
