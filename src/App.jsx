import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Header, Footer } from './components';
import { PrivateRoute } from './components/PrivateRoute/PrivateRoute';
import { routes } from './routes/routes';
import FloatingButtons from './components/FloatingButtons/FloatingButtons';
import { Toaster } from 'react-hot-toast';

//Modal.setAppElement('#root');

const App = () => {
  return (    
    <Router>
      <Header />      
      <main className="main-content">
        <FloatingButtons />
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
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000, // Duration in milliseconds (5 seconds)
           style: {
             background: '#eee',
             border: 'solid #222 2px',
            //  color: '#fff',
             fontSize: '20px',
           },
        }}
      />
    </Router>     
  );
};

export default App;
