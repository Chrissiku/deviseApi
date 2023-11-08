import { useState, useEffect } from "react";
import "./App.css";

const API_URL = "http://localhost:3000/users/tokens";

function App() {
  const [access_token, setAccessToken] = useState(null);
  const [refresh_token, setRefreshToken] = useState(
    localStorage.getItem("refresh_token")
  );
  const [resource_owner, setResourceOwner] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password_confirm, setPasswordConfirm] = useState("");

  const [loggedIn, setLoggedIn] = useState(false);

  const handleAuthResponse = async (response) => {
    const data = await response.json();
    localStorage.setItem("resource_owner", JSON.stringify(data.resource_owner));
    localStorage.setItem("refresh_token", data.refresh_token);
    setAccessToken(data.token);
    setRefreshToken(data.refresh_token);
    setResourceOwner(data.resource_owner);
  };

  const refreshTokens = async () => {
    const storedRefreshToken = localStorage.getItem("refresh_token");
    if (!storedRefreshToken) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${storedRefreshToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Handle the error, such as redirecting to the login page
          resetTokens();
        } else {
          throw new Error(response.statusText);
        }
      }

      const data = await response.json();
      localStorage.setItem(
        "resource_owner",
        JSON.stringify(data.resource_owner)
      );
      localStorage.setItem("refresh_token", data.refresh_token);
      setAccessToken(data.token);
      setRefreshToken(data.refresh_token);
      setResourceOwner(data.resource_owner);
    } catch (err) {
      console.log("Error refreshing token: ", err);
      resetTokens();
      userSession();
    }
  };

  const userSession = async () => {
    await refreshTokens();

    if (access_token) {
      setLoggedIn(true);
    } else {
      setLoggedIn(false);
    }
  };

  const resetTokens = () => {
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("resource_owner");
    setAccessToken(null);
    setRefreshToken(null);
    setResourceOwner(null);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (password !== password_confirm) {
      alert("Passwords do not match");
      return;
    }

    const response = await fetch(`${API_URL}/sign_up`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" },
    });

    await handleAuthResponse(response);
    userSession();
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    const response = await fetch(`${API_URL}/sign_in`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" },
    });

    await handleAuthResponse(response);
    userSession();
  };

  useEffect(() => {
    userSession();
  }, []); // This effect will run once when the component mounts

  console.log(loggedIn);
  return (
    <>
      <div>
        <h1>Hello React js</h1>
      </div>
      <div>
        {loggedIn ? (
          <div>
            {/* User is logged in */}
            <p>Welcome, {resource_owner.email}</p>
            <button onClick={resetTokens}>Logout</button>
          </div>
        ) : (
          <div>
            <form onSubmit={handleSignUp}>
              {/* Sign-up form */}
              <input
                type="text"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={password_confirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
              />
              <button type="submit">Sign Up</button>
            </form>

            <form onSubmit={handleSignIn}>
              {/* Sign-in form */}
              <input
                type="text"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="submit">Sign In</button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
