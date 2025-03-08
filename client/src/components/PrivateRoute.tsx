import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthServices from './auth/AuthServices';

function PrivateRoute({ children }: React.PropsWithChildren) {
    const navigate = useNavigate();
    const location = useLocation();
    const [showMessage, setShowMessage] = useState(false);

    useEffect(() => {
        if (!AuthServices.isAuthenticated()) {
            setShowMessage(true);
            const timer = setTimeout(() => {
                navigate('/login', { state: { from: location.pathname } });
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [navigate, location]);

    // If authenticated, render children; if not, show message or nothing during redirect
    return AuthServices.isAuthenticated() ? (
        children
    ) : showMessage ? (
        <div className='h-[70vh] w-full flex items-center justify-center' style={{ padding: '20px', textAlign: 'center' }}>
            <h2>You must be logged in to access this page.</h2>
            <p>Redirecting to login in a moment...</p>
        </div>
    ) : null;
}

export default PrivateRoute;