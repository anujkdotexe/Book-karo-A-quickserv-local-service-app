import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setNavigate } from '../services/navigationService';

/**
 * Custom hook to initialize navigation service with React Router
 * Should be used at the top level of the app within Router context
 */
export const useNavigationService = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Initialize navigation service with navigate function
    setNavigate(navigate);
    
    // Cleanup on unmount
    return () => {
      setNavigate(null);
    };
  }, [navigate]);
};

export default useNavigationService;