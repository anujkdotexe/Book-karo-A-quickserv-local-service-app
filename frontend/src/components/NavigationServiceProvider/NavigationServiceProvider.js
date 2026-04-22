import { useNavigationService } from '../../hooks/useNavigationService';

/**
 * Component that initializes the navigation service
 * Should be placed inside Router but outside of Routes
 */
const NavigationServiceProvider = ({ children }) => {
  useNavigationService();
  
  return children;
};

export default NavigationServiceProvider;