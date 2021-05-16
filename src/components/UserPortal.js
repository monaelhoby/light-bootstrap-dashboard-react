import React,{useState} from 'react'
import { useAuth } from "./contexts/AuthContext";
import { Link, useHistory } from "react-router-dom";


export default function UserPortal() {
    const { currentUser, logout } = useAuth();
    const history = useHistory();

    const [error, setError] = useState("");

    async function handleLogout() {
        setError("");
    
        try {
          await logout();
          history.push("/login");
        } catch {
          setError("Failed to log out");
        }
      }
      // handleLogout();


    return (
        <div>
            <button onClick={handleLogout}>logout</button>
            this is the user portal
        </div>
    )
}
