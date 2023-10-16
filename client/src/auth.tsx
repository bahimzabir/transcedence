import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function RouteProtector({ children }:any) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    fetch('/api/auth/verify')
      .then((response) => {
        if (response.status === 401) {
          navigate('/'); // Redirect to login page if not authenticated
        } else if (response.status === 200) {
          setIsAuthenticated(true);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }, [navigate]);

  if (!isAuthenticated) {
    return null; // Don't render children if not authenticated
  }

  return <React.Fragment>{children}</React.Fragment>;
}

export default RouteProtector;
