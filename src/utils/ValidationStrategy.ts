import { emailRegex } from "./emailRegex";

type SignupData = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
};

type SigninData = {
  email: string;
  password: string;
};

type ValidationData = SigninData | SignupData;

// Strategy interface
interface ValidationStrategy {
  validate(data: ValidationData): Partial<ValidationData> | boolean;
}

// Strategy concrete implementation: Sign In
class SigninValidation implements ValidationStrategy {
  validate(data: SigninData): Partial<SigninData> | boolean {
    const errors: Partial<SigninData> = {};

    if (!data.email.trim()) {
      errors.email = "Your email address is required";
    } else if (!data.email.trim().match(emailRegex)) {
      errors.email = "Email address is invalid";
    }

    if (!data.password.trim()) {
      errors.password = "Password is required";
    } else if (data.password.length < 6) {
      errors.password = "Password should be minimum 6 characters long";
    }

    const result = Object.keys(errors).length > 0 ? errors : true;
    return result;
  }
}

// Strategy concrete implementation: Sign Up
class SignupValidation implements ValidationStrategy {
  validate(data: SignupData): Partial<SignupData> | boolean {
    const errors: Partial<SignupData> = {};

    if (!data.first_name.trim()) {
      errors.first_name = "Your first name is required";
    }

    if (!data.last_name.trim()) {
      errors.last_name = "Your last name is required";
    }

    if (!data.email.trim()) {
      errors.email = "Your email address is required";
    } else if (!data.email.trim().match(emailRegex)) {
      errors.email = "Email address is invalid";
    }

    if (!data.password.trim()) {
      errors.password = "Password is required";
    } else if (data.password.length < 6) {
      errors.password = "Should have min 6 characters";
    }

    if (!data.confirm_password.trim()) {
      errors.confirm_password = "Please re-type the password";
    } else if (data.confirm_password !== data.password) {
      errors.confirm_password = "Passwords do not match";
    }

    const result = Object.keys(errors).length > 0 ? errors : true;
    return result;
  }
}

// Strategy context
class ValidationContext {
  private strategy: ValidationStrategy;

  constructor(strategy: ValidationStrategy) {
    this.strategy = strategy;
  }

  set_strategy(strategy: ValidationStrategy) {
    this.strategy = strategy;
  }

  validate(data: ValidationData) {
    return this.strategy.validate(data);
  }
}

export const signinValidator = new ValidationContext(new SigninValidation());
export const signupValidator = new ValidationContext(new SignupValidation());
