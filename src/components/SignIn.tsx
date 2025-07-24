import { useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";

// Import types
import UserCredentials from "@/types/UserCredentials";
import Session from "@/types/Session";

// Import utils
import { signinValidator } from "@/utils/validationStrategy";

interface OutletContextType {
  setSession: (session: Session) => void;
  setLoading: (loading: boolean) => void;
}

const SignIn = () => {
  const [signInData, setSignInData] = useState<UserCredentials>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<UserCredentials>>({});
  const navigate = useNavigate();
  const { setSession, setLoading } = useOutletContext() as OutletContextType; //TODO: add the type

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignInData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const validateSignIn = () => {
    // Use the validationStrategy util
    const result = signinValidator.validate(signInData);

    if (typeof result == "object") {
      setErrors(result);
      return false;
    }
    return true;
  };

  const handleSignIn = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateSignIn()) {
      setLoading(true);
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
        setLoading(false);
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
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error: ", error.message);
        } else {
          console.error("Unknown error occurred");
        }
      }
    }
  };

  return (
    <div className="signup">
      <div className="container">
        <form action="" onSubmit={handleSignIn}>
          <div className="form-input">
            <label htmlFor="email">Email Address: </label>
            <input type="text" name="email" onChange={handleInputChange} />
            {errors.email && <small className="error">{errors.email}</small>}
          </div>
          <div className="form-input">
            <label htmlFor="password">Password: </label>
            <input
              type="password"
              name="password"
              onChange={handleInputChange}
            />
            {errors.password && (
              <small className="error">{errors.password}</small>
            )}
          </div>
          <button className="btn">Sign In</button>
        </form>
        <p>
          Don't have an account? Click <Link to="/signup">here</Link> to sign up
        </p>
      </div>
    </div>
  );
};

export default SignIn;
