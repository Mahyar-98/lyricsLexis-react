import "../styles/signup.css";
import { useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";

// Import types
import UserInfo from "@/types/UserInfo";

// Import utils
import { signupValidator } from "@/utils/ValidationStrategy";

const SignUp = () => {
  const [signUpData, setSignUpData] = useState<UserInfo>({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState<Partial<UserInfo>>({});
  const { setLoading }: { setLoading: (loading: boolean) => void } =
    useOutletContext();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignUpData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const validateSignUp = () => {
    // Use the validationStrategy utility
    const result = signupValidator.validate(signUpData);

    if (typeof result == "object") {
      setErrors(result);
      return false;
    }
    return true;
  };

  const handleSignUp = (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateSignUp()) {
      setLoading(true);
      fetch(import.meta.env.VITE_BACKEND_URL + "/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signUpData),
      })
        .then((res) => {
          setLoading(false);
          if (res.ok) {
            // Redirect to homepage
            navigate("/");
          } else {
            console.error("Error: ", res.status);
          }
        })
        .catch((err) => {
          console.error("Error: ", err);
          setLoading(false);
        });
    }
  };

  return (
    <div className="signup">
      <div className="container">
        <form action="" onSubmit={handleSignUp}>
          <div className="form-input">
            <label htmlFor="first_name">First Name: </label>
            <input type="text" name="first_name" onChange={handleInputChange} />
            {errors.first_name && (
              <small className="error">{errors.first_name}</small>
            )}
          </div>
          <div className="form-input">
            <label htmlFor="last_name">Last Name: </label>
            <input type="text" name="last_name" onChange={handleInputChange} />
            {errors.last_name && (
              <small className="error">{errors.last_name}</small>
            )}
          </div>
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
          <div className="form-input">
            <label htmlFor="confirm_password">Confirm Password: </label>
            <input
              type="password"
              name="confirm_password"
              onChange={handleInputChange}
            />
            {errors.confirm_password && (
              <small className="error">{errors.confirm_password}</small>
            )}
          </div>
          <button className="btn">Create Account</button>
        </form>
        <p>
          Already have an account? Click <Link to="/signin">here</Link> to sign
          in
        </p>
      </div>
    </div>
  );
};

export default SignUp;
