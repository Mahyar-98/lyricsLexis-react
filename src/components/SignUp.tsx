import "../styles/signup.css";
import { useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";

interface SignUpData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
}

const SignUp = () => {
  const [signUpData, setSignUpData] = useState<SignUpData>({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState<Partial<SignUpData>>({});
  const { setLoading } = useOutletContext();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignUpData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const validateSignUp = () => {
    let isValid = true;
    const newErrors: Partial<SignUpData> = {};

    if (!signUpData.first_name.trim()) {
      newErrors.first_name = "Your first name is required";
      isValid = false;
    }

    if (!signUpData.last_name.trim()) {
      newErrors.last_name = "Your last name is required";
      isValid = false;
    }

    if (!signUpData.email.trim()) {
      newErrors.email = "Your email address is required";
      isValid = false;
    } else if (
      !signUpData.email
        .trim()
        .match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        )
    ) {
      newErrors.email = "Email address is invalid";
      isValid = false;
    }

    if (!signUpData.password.trim()) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (signUpData.password.length < 6) {
      newErrors.password = "Should have min 6 characters";
      isValid = false;
    }

    if (!signUpData.confirm_password.trim()) {
      newErrors.confirm_password = "Please re-type the password";
      isValid = false;
    } else if (signUpData.confirm_password !== signUpData.password) {
      newErrors.confirm_password = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
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
