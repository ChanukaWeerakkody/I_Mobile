import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import '../index.css';
import { backend_url } from '../utill/utill';
import { useNavigate } from "react-router-dom";
import {groupImage} from "../assets/images/Group 160.png";



interface UserData {
  username: string;
  password: string;
}

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();


  /*const handleLogin = async () => {
    const userData: UserData = { username: username, password: password };
    try {
      const response = await axios.post(backend_url+'/auth/login', userData);
      if (response.data.token) {
        Swal.fire({
          title: "Success!",
          text: "Login successful.",
          icon: "success"
        });
        setUsername("");
        setPassword("")
        setError('');
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('username', response.data.authenticatedUser.name);
        
        navigate('/dashboard');
      } else {
        Swal.fire({
          title: "Error!",
          text: response.data.message || "Invalid username or password.",
          icon: "error"
        });
        setError('Invalid username or password');
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Invalid username or password.",
        icon: "error"
      });
  
      setError('Invalid username or password');
    }
  };*/
  const handleLogin = async () => {
    const userData: UserData = { username: username, password: password };
    try {
      const response = await axios.post(backend_url+'/auth/login', userData);
      if (response.data.token) {
        Swal.fire({
          title: "Success!",
          text: "Login successful.",
          icon: "success"
        });
        setUsername("");
        setPassword("")
        setError('');
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('username', response.data.authenticatedUser.name);
        localStorage.setItem('userRole', response.data.authenticatedUser.role);  // Save the user role

        navigate('/dashboard');
      } else {
        Swal.fire({
          title: "Error!",
          text: response.data.message || "Invalid username or password.",
          icon: "error"
        });
        setError('Invalid username or password');
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Invalid username or password.",
        icon: "error"
      });

      setError('Invalid username or password');
    }
  };


  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-custom">
      <div className="w-full md:w-1/2 flex justify-center items-center">
        <img
          src={groupImage}
          alt="main image"
          className="rounded-right w-full h-full object-cover"
        />
      </div>
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-4 md:p-0">
        <div className="mb-8">
          <img
            src="src/assets/images/logo.png"
            alt="logo"
            className="w-32 md:w-[15vw] h-auto object-contain"
          />
        </div>
        <div className="flex flex-col items-center space-y-4 w-full max-w-md">
          <input
            placeholder="user name"
            className="p-2 rounded-md border border-gray-400 w-full"
            value={username}
            onChange={(ev) => setUsername(ev.target.value)}
          />
          <input
            placeholder="password"
            type="password"
            className="p-2 rounded-md border border-gray-400 w-full"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
          />
          {error && <div className="text-red-500">{error}</div>}
          <button type="button" onClick={handleLogin} className="custom-border-colour w-full md:w-[10vw] h-[5vh]">
            <span className="custom-font-colour">Sign In</span>
          </button>
        </div>
      </div>
    </div>
  );
}