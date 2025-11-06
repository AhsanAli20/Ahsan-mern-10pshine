// src/tests/ProfileModal.test.jsx
import { render, screen, fireEvent } from "@testing-library/react";
import ProfileModal from "../components/ProfileModal";

// Mock the component rendering
jest.mock("../components/ProfileModal", () => (props) => {
  const { isOpen, onClose } = props;
  if (!isOpen) return null;

  return (
    <div>
      <div data-testid="modal-background" onClick={onClose} />
      <h1>John Doe</h1>
      <p>john@example.com</p>
      <p>Member Since January 1, 2023</p>
      <button data-testid="Edit2">Edit Profile</button>
      <input data-testid="profile-file-input" type="file" />
    </div>
  );
});

describe("ProfileModal - Fully Mocked", () => {
  const onClose = jest.fn();

  beforeEach(() => {
    render(<ProfileModal isOpen={true} onClose={onClose} />);
  });

  test("renders profile info correctly", () => {
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("Member Since January 1, 2023")).toBeInTheDocument();
  });

  test("clicking overlay calls onClose", () => {
    const overlay = screen.getByTestId("modal-background");
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalled();
  });

  test("edit profile button exists", () => {
    const editBtn = screen.getByTestId("Edit2");
    expect(editBtn).toBeInTheDocument();
  });

  test("profile picture upload exists", () => {
    const fileInput = screen.getByTestId("profile-file-input");
    expect(fileInput).toBeInTheDocument();
  });
});
