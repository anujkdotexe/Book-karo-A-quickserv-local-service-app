/**
 * Navigation service for client-side routing
 * Provides smooth navigation without full page reloads
 */

let navigate = null;

/**
 * Initialize navigation with React Router's navigate function
 * This should be called from a component within Router context
 */
export const setNavigate = (navigateFunction) => {
  navigate = navigateFunction;
};

/**
 * Navigate to a route using React Router navigation
 * Falls back to window.location.href if navigate is not available
 */
export const navigateTo = (path, options = {}) => {
  if (navigate) {
    navigate(path, options);
  } else {
    // Fallback to window.location.href
    console.warn('React Router navigate not available, falling back to window.location.href');
    window.location.href = path;
  }
};

/**
 * Navigate and replace current entry in history
 */
export const navigateReplace = (path) => {
  navigateTo(path, { replace: true });
};

/**
 * Go back in browser history
 */
export const goBack = () => {
  if (navigate) {
    navigate(-1);
  } else {
    window.history.back();
  }
};

/**
 * Logout and redirect to login page
 * Includes cleanup of authentication state
 */
export const logoutAndRedirect = () => {
  // Clear authentication data
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('cart');
  
  // Dispatch logout event
  try {
    window.dispatchEvent(new CustomEvent('user-logout'));
  } catch (e) {
    console.warn('Failed to dispatch logout event:', e);
  }
  
  // Navigate to login
  navigateReplace('/login');
};

/**
 * Handle session expiration with user notification
 */
export const handleSessionExpired = () => {
  // Clear authentication data
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('cart');
  
  // Dispatch logout event
  try {
    window.dispatchEvent(new CustomEvent('user-logout'));
  } catch (e) {
    console.warn('Failed to dispatch logout event:', e);
  }
  
  // Show session expired notification
  try {
    const event = new CustomEvent('session-expired', {
      detail: { message: 'Your session has expired. Please log in again.' }
    });
    window.dispatchEvent(event);
  } catch (e) {
    console.warn('Failed to dispatch session expired event:', e);
  }
  
  // Redirect to login after a brief delay
  setTimeout(() => {
    navigateReplace('/login');
  }, 2000);
};

const navigationService = {
  setNavigate,
  navigateTo,
  navigateReplace,
  goBack,
  logoutAndRedirect,
  handleSessionExpired
};

export default navigationService;