import apiClient from './client.js';

/**
 * SalesHistoryController.search takes `from`/`to` as full ISO instants
 * (DATE_TIME, not DATE) - date-only inputs from a <input type="date"> are
 * expanded here to start-of-day / end-of-day so callers can keep passing
 * plain 'YYYY-MM-DD' strings.
 */
export function searchSales({ scope = 'ALL', branchId, customerId, productId, paymentStatus, status, from, to, fromAt, toAt, search, page = 0, size = 20 } = {}) {
  return apiClient
    .get('/sales', {
      params: {
        scope,
        branchId,
        customerId,
        productId,
        paymentStatus,
        status,
        // fromAt / toAt are exact instants (the page's own local days); from / to are plain dates read as UTC.
        from: fromAt || (from ? `${from}T00:00:00Z` : undefined),
        to: toAt || (to ? `${to}T23:59:59.999Z` : undefined),
        search,
        page,
        size,
        sort: 'createdAt,desc',
      },
    })
    .then((res) => res.data);
}

export function getSale(id) {
  return apiClient.get(`/sales/${id}`).then((res) => res.data);
}

export function voidSale(id, reason) {
  return apiClient.post(`/sales/${id}/void`, { reason }).then((res) => res.data);
}
