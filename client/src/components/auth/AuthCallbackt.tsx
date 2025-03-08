import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthServices from './AuthServices';

function AuthCallback() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === '/auth/callback') {
      AuthServices.handleProviderCallback(new URLSearchParams(location.search), navigate);
    }
  }, [location, navigate]);

  return <div>Processing login...</div>;
}

export default AuthCallback;