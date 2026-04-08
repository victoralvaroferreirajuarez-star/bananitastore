// ========================================
// SPA Router
// ========================================

const routes = {};
let currentPath = '';

export function registerRoute(path, handler) {
  routes[path] = handler;
}

export function navigate(path) {
  const targetHash = '#' + path;
  if (window.location.hash === targetHash) {
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else {
    window.location.hash = path;
  }
}

export function getCurrentPath() {
  return window.location.hash.slice(1) || '/';
}

export function initRouter(renderCallback) {
  function handleRoute() {
    const path = getCurrentPath();
    const [basePath, ...params] = path.split('/').filter(Boolean);
    const routePath = '/' + (basePath || '');
    
    currentPath = routePath;
    
    if (routes[routePath]) {
      renderCallback(routes[routePath], params);
    } else {
      // Try to find dynamic route
      const dynamicRoute = Object.keys(routes).find(r => {
        if (!r.includes(':')) return false;
        const routeParts = r.split('/').filter(Boolean);
        const pathParts = path.split('/').filter(Boolean);
        if (routeParts.length !== pathParts.length) return false;
        return routeParts.every((part, i) => part.startsWith(':') || part === pathParts[i]);
      });
      
      if (dynamicRoute) {
        const routeParts = dynamicRoute.split('/').filter(Boolean);
        const pathParts = path.split('/').filter(Boolean);
        const extractedParams = [];
        routeParts.forEach((part, i) => {
          if (part.startsWith(':')) extractedParams.push(pathParts[i]);
        });
        renderCallback(routes[dynamicRoute], extractedParams);
      } else {
        renderCallback(routes['/'] || (() => '<h1>404</h1>'), []);
      }
    }
  }

  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

export function isActive(path) {
  return currentPath === path;
}
