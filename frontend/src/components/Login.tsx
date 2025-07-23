"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const Login = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showLogin, setShowLogin] = useState<boolean>(true);
  const [showSignup, setShowSignup] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [showDialogSuccess, setShowDialogSuccess] = useState<boolean>(false);

  const router = useRouter();

  type body = {
    username: string;
    password: string;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body: body = {
        username: username,
        password: password,
      };
      const response = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (response.status === 401) {
        // throw new Error(`HTTP error! status: ${response.status}`);
        setShowDialog(true);
        setShowDialogSuccess(false);
      } else if (response.status === 200) {
        const data = await response.json();
        const jwtToken = data.accessToken;
        const username = data.username;
        const userID = data.userId;

        if (jwtToken) {
          // Set item

          // --- IMPORTANT: Store the token ---
          // For simplicity (but with XSS risk), you can use localStorage:
          localStorage.setItem("jwtToken", jwtToken);
          localStorage.setItem("username", username);
          localStorage.setItem("userID", userID);
          console.log("JWT Token stored in localStorage. user ID = ", userID);

          router.push("/chat");
        } else {
          console.error(
            "JWT Token not found in the expected properties of the response body."
          );
          alert(
            "Login successful, but no token received. Please check server response."
          );
        }
      }
    } catch (err: any) {
      console.error(err.message);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body: body = {
        username: username,
        password: password,
      };
      const response = await fetch("http://localhost:3001/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      // console.log("ini response", response);
      if (response.status === 422) {
        // throw new Error(`HTTP error! status: ${response.status}`);
        setShowDialog(true);
      } else if (response.status === 201) {
        setShowLogin(true);
        setShowDialog(true);
        setShowDialogSuccess(true);
        setShowSignup(false);
      }
      console.log(response.status);
    } catch (err: any) {
      console.error(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="relative">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-100 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-100 animate-blob animation-delay-2000"></div>
        <div className="absolute top-0 -bottom-8 left-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-100 animate-blob animation-delay-4000"></div>
        {showLogin && (
          <div className="relative px-4 w-96 h-[22rem] bg-white rounded-xl shadow-2xl flex-col items-center justify-center align-middle">
            <h1 className="pt-4 pb-2 text-[1.5rem] text-center">Login</h1>
            <hr className="border-[1.5px] border-gray-100 mx-8" />
            {showDialog ? (
              <div>
                {showDialogSuccess ? (
                  <>
                    <div className="text-center text-green-600 mt-2">
                      Signup Successful! Try to Login
                    </div>
                    <div className="ml-4 mt-2">
                      <label htmlFor="username">Username</label>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center text-red-600 mt-2">
                      Wrong Username or Password
                    </div>
                    <div className="ml-4 mt-2">
                      <label htmlFor="username">Username</label>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="ml-4 mt-4">
                <label htmlFor="username">Username</label>
              </div>
            )}
            <form onSubmit={handleLogin}>
              <input
                type="text"
                id="username"
                onChange={(e) => setUsername(e.target.value)}
                className="ml-3 px-1 py-1 bg-transparent border-b-2 hover:border-gray-500 focus:border-gray-500 valid:border-gray-500 text-gray-500 focus:outline-none focus:shadow-outline z-0"
                placeholder="Insert Username"
                size={32}
                minLength={3}
                maxLength={20}
                required
              ></input>
              <div className="ml-4 mt-4">
                <label htmlFor="password">Password</label>
              </div>
              <input
                type="password"
                id="password"
                onChange={(e) => setPassword(e.target.value)}
                className="ml-3 px-1 py-1 bg-transparent border-b-2 hover:border-gray-500 focus:border-gray-500 valid:border-gray-500 text-gray-500 focus:outline-none focus:shadow-outline z-0"
                placeholder="Insert Password"
                size={32}
                minLength={8}
                maxLength={20}
                required
              ></input>
              <button
                type="submit"
                className="text-white bg-sky-500 mt-6 px-4 py-2 mx-auto flex items-center rounded-md hover:scale-110 opacity-70 hover:opacity-100 duration-300 z-0"
              >
                Login
              </button>
            </form>
            <p className="mt-6 text-center">
              Don't have an account?{" "}
              <span
                className="text-sky-500 hover:text-sky-600 hover:cursor-pointer"
                onClick={() => {
                  setShowLogin(false);
                  setShowSignup(true);
                  setShowDialog(false);
                }}
              >
                Signup
              </span>
            </p>
          </div>
        )}
        {showSignup && (
          <div className="relative px-4 w-96 h-[22rem] bg-white rounded-xl shadow-2xl flex-col items-center justify-center align-middle">
            <h1 className="pt-4 pb-2 text-[1.5rem] text-center">Signup</h1>
            <hr className="border-[1.5px] border-gray-100 mx-8" />
            {showDialog ? (
              <div>
                <div className="text-center text-red-600 mt-2">
                  Username Already Exists
                </div>
                <div className="ml-4 mt-2">
                  <label htmlFor="username">Username</label>
                </div>
              </div>
            ) : (
              <div className="ml-4 mt-4">
                <label htmlFor="username">Username</label>
              </div>
            )}
            <form onSubmit={handleSignup}>
              <input
                type="text"
                id="username"
                onChange={(e) => setUsername(e.target.value)}
                className="ml-3 px-1 py-1 bg-transparent border-b-2 hover:border-gray-500 focus:border-gray-500 valid:border-gray-500 text-gray-500 focus:outline-none focus:shadow-outline z-0"
                placeholder="Insert Username"
                size={32}
                maxLength={20}
                required
              ></input>
              <div className="ml-4 mt-4">
                <label htmlFor="password">Password</label>
              </div>
              <input
                type="password"
                id="password"
                onChange={(e) => setPassword(e.target.value)}
                className="ml-3 px-1 py-1 bg-transparent border-b-2 hover:border-gray-500 focus:border-gray-500 valid:border-gray-500 text-gray-500 focus:outline-none focus:shadow-outline z-0"
                placeholder="Insert Password"
                size={32}
                maxLength={20}
                required
              ></input>
              <button
                type="submit"
                className="text-white bg-sky-500 mt-6 px-4 py-2 mx-auto flex items-center rounded-md hover:scale-110 opacity-70 hover:opacity-100 duration-300 z-0"
              >
                Signup
              </button>
            </form>
            <p className="mt-6 text-center">
              Back to{" "}
              <span
                className="text-sky-500 hover:text-sky-600 hover:cursor-pointer"
                onClick={() => {
                  setShowLogin(true);
                  setShowSignup(false);
                  setShowDialog(false);
                }}
              >
                Login
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
