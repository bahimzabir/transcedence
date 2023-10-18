import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

function RouteProtector() {
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

  return <Outlet />;
}

export default RouteProtector;
