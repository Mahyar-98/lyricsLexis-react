import "../styles/signin.css";
import { useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";

interface SignInData {
  email: string;
  password: string;
}

const SignIn = () => {
  const [signInData, setSignInData] = useState<SignInData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<SignInData>>({});
  const navigate = useNavigate();
  const { setSession } = useOutletContext(); //TODO: add the type

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignInData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const validateSignUp = () => {
    let isValid = true;
    const newErrors: Partial<SignInData> = {};

    if (!signInData.email.trim()) {
      newErrors.email = "Your email address is required";
      isValid = false;
    } else if (
      !signInData.email
        .trim()
        .match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        )
    ) {
      newErrors.email = "Email address is invalid";
      isValid = false;
    }

    if (!signInData.password.trim()) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (signInData.password.length < 6) {
      newErrors.password = "Password should be minimum 6 characters long";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignIn = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateSignUp()) {
      try {
        const response = await fetch(
          import.meta.env.VITE_BACKEND_URL + "/signin",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(signInData),
          },
        );
        if (response.ok) {
          const session = await response.json();
          // Store token in local storage
          localStorage.setItem("token", session.token);
          setSession(session);
          // Redirect to homepage
          navigate("/");
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message);
        }
      } catch (error: unknown) {
        // TODO: update the error type
        console.error("Error: ", error.message);
        // Handle error (e.g., display error message to the user)
      }
    }
  };

  return (
    <div className="container">
      <p>Please sign in:</p>
      <form action="" onSubmit={handleSignIn}>
        <label htmlFor="email">Email Address: </label>
        <input type="text" name="email" onChange={handleInputChange} />
        {errors.email && <small className="error">{errors.email}</small>}
        <label htmlFor="password">Password: </label>
        <input type="password" name="password" onChange={handleInputChange} />
        {errors.password && <small className="error">{errors.password}</small>}
        <button>Sign In</button>
      </form>
      <p>
        Don't have an account? Click <Link to="/signup">here</Link> to sign up
      </p>
    </div>
  );
};

export default SignIn;
