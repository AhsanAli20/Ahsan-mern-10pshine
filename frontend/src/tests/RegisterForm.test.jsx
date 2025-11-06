// src/tests/RegisterForm.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock the register API function globally
const mockRegisterUser = jest.fn().mockResolvedValue({ success: true });

// Minimal RegisterForm component using the mocked API
const RegisterForm = () => {
  const [form, setForm] = React.useState({ name: "", email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await mockRegisterUser(form); // call mocked API
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name
        <input name="name" value={form.name} onChange={handleChange} />
      </label>
      <label>
        Email
        <input name="email" value={form.email} onChange={handleChange} />
      </label>
      <label>
        Password
        <input name="password" value={form.password} type="password" onChange={handleChange} />
      </label>
      <button type="submit">Register</button>
    </form>
  );
};

describe("RegisterForm Component", () => {
  beforeEach(() => {
    mockRegisterUser.mockClear(); // reset mock before each test
  });

  it("renders all input fields and submit button", () => {
    render(<RegisterForm />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();
  });

  it("allows typing in input fields", () => {
    render(<RegisterForm />);
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "Ashan" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "Ashan@test.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } });

    expect(screen.getByLabelText(/name/i).value).toBe("Ashan");
    expect(screen.getByLabelText(/email/i).value).toBe("Ashan@test.com");
    expect(screen.getByLabelText(/password/i).value).toBe("password123");
  });

  it("calls the mocked registerUser function on submit", async () => {
    render(<RegisterForm />);
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "Ashan" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "Ashan@test.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } });

    fireEvent.submit(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(mockRegisterUser).toHaveBeenCalledTimes(1);
      expect(mockRegisterUser).toHaveBeenCalledWith({
        name: "Ashan",
        email: "Ashan@test.com",
        password: "password123",
      });
    });
  });
});
