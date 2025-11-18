// ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("idToken");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);

    // Check if expired
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("idToken");
      return <Navigate to="/login" replace />;
    }


    return children; // Allowed
  } catch (err) {
    // If token is invalid or fake → block
    localStorage.removeItem("idToken");
    return <Navigate to="/login" replace />;
  }
}
