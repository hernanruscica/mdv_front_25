import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Header, Footer } from './components';
import { PrivateRoute } from './components/PrivateRoute/PrivateRoute';
import { routes } from './routes/routes';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const App = () => {
  return (    
    <Router>
      <Header />
      <main className="main-content">
        <Routes>
          {routes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                route.private ? (
                  <PrivateRoute>
                    {route.element}
                  </PrivateRoute>
                ) : (
                  route.element
                )
              }
            />
          ))}
        </Routes>
      </main>
      <Footer />
    </Router>     
  );
};

export default App;
