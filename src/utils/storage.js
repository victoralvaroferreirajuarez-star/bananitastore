// ========================================
// Storage Layer — localStorage wrapper
// ========================================

const STORAGE_PREFIX = 'bs_';

export const Storage = {
  get(key) {
    try {
      const data = localStorage.getItem(STORAGE_PREFIX + key);
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  },

  set(key, value) {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  },

  remove(key) {
    localStorage.removeItem(STORAGE_PREFIX + key);
  },

  // Initialize default data if not exists
  init() {
    if (!this.get('users')) {
      this.set('users', [
        {
          id: 'admin_001',
          username: 'Admin',
          email: 'admin@bananitashop.com',
          password: 'admin123',
          role: 'admin',
          avatar: 'A',
          createdAt: new Date().toISOString(),
          banned: false
        }
      ]);
    }
    if (!this.get('listings')) this.set('listings', []);
    if (!this.get('orders')) this.set('orders', []);
    if (!this.get('seller_requests')) this.set('seller_requests', []);
    if (!this.get('support_tickets')) this.set('support_tickets', []);
    if (!this.get('site_config')) {
      this.set('site_config', {
        siteName: 'BananitaShop',
        commission: 0,
        maintenanceMode: false,
        announcement: ''
      });
    }
  }
};

// Users
export function getUsers() { return Storage.get('users') || []; }
export function saveUsers(users) { Storage.set('users', users); }
export function getUserById(id) { return getUsers().find(u => u.id === id); }
export function updateUser(id, data) {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === id);
  if (idx !== -1) { users[idx] = { ...users[idx], ...data }; saveUsers(users); }
  return users[idx];
}

// Listings
export function getListings() { return Storage.get('listings') || []; }
export function saveListings(listings) { Storage.set('listings', listings); }
export function addListing(listing) {
  const listings = getListings();
  listings.push(listing);
  saveListings(listings);
}
export function removeListing(id) {
  saveListings(getListings().filter(l => l.id !== id));
}
export function getListingById(id) { return getListings().find(l => l.id === id); }
export function updateListing(id, data) {
  const listings = getListings();
  const idx = listings.findIndex(l => l.id === id);
  if (idx !== -1) { listings[idx] = { ...listings[idx], ...data }; saveListings(listings); }
}

// Orders
export function getOrders() { return Storage.get('orders') || []; }
export function saveOrders(orders) { Storage.set('orders', orders); }
export function addOrder(order) {
  const orders = getOrders();
  orders.push(order);
  saveOrders(orders);
}
export function getOrderById(id) { return getOrders().find(o => o.id === id); }
export function updateOrder(id, data) {
  const orders = getOrders();
  const idx = orders.findIndex(o => o.id === id);
  if (idx !== -1) { orders[idx] = { ...orders[idx], ...data }; saveOrders(orders); }
}

// Seller Requests
export function getSellerRequests() { return Storage.get('seller_requests') || []; }
export function saveSellerRequests(requests) { Storage.set('seller_requests', requests); }
export function addSellerRequest(req) {
  const requests = getSellerRequests();
  requests.push(req);
  saveSellerRequests(requests);
}

// Support Tickets
export function getSupportTickets() { return Storage.get('support_tickets') || []; }
export function saveSupportTickets(tickets) { Storage.set('support_tickets', tickets); }
export function addSupportTicket(ticket) {
  const tickets = getSupportTickets();
  tickets.push(ticket);
  saveSupportTickets(tickets);
}

// Site Config
export function getSiteConfig() { return Storage.get('site_config') || {}; }
export function saveSiteConfig(config) { Storage.set('site_config', config); }

// Favorites
export function getFavorites(userId) { return Storage.get(`favorites_${userId}`) || []; }
export function toggleFavorite(userId, listingId) {
  let favs = getFavorites(userId);
  if (favs.includes(listingId)) {
    favs = favs.filter(f => f !== listingId);
  } else {
    favs.push(listingId);
  }
  Storage.set(`favorites_${userId}`, favs);
  return favs;
}
