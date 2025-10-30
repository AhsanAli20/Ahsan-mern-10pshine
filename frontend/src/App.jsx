import { Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Dashboard from './components/dashboard';
import HomePage from './components/HomePage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
     <div className="App">
      <Routes>
        <Route path="/" element={<HomePage />} /> 
        {/* <Route path="/" element={<LoginForm />} /> */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/LoginForm" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/forgot-password" element={<ForgotPassword />} /> 
        <Route path="/reset-password/:token" element={<ResetPassword />} /> 
        <Route element={<ProtectedRoute />}>
           <Route path="/dashboard" element={<Dashboard />} /> 
         </Route>

      </Routes>
    </div>
  );
}

export default App;