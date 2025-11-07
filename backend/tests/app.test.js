/**
 * tests/app.full.test.js
 *
 * Full test suite for Note App backend.
 * - Mocks nodemailer and Cloudinary
 * - Uses mongodb-memory-server via tests/setup.js (you already have)
 *
 * Run with: npm test
 */

// --- MOCKS (must be before importing app) ---
jest.mock("nodemailer", () => ({
  createTransport: () => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: "mocked-id" }),
  }),
}));

// Mock the Cloudinary config module used by your routes.
// We mock `upload.single(...)` middleware to inject req.file and a cloudinary uploader.destroy
jest.mock("../config/cloudinary", () => {
  return {
    upload: {
      single: () => (req, res, next) => {
        // simulate multer/Cloudinary providing file info
        req.file = {
          path: "http://cloudinary.test/mock.jpg",
          filename: "mock-public-id",
        };
        next();
      },
    },
    cloudinary: {
      uploader: {
        destroy: jest.fn().mockResolvedValue(true),
      },
    },
  };
});

// --- imports AFTER mocks ---
const request = require("supertest");
const app = require("../app"); // as you said
const mongoose = require("mongoose");
require("./setup"); // your in-memory Mongo setup (beforeAll/afterAll)

// We will use User model directly to create/modify tokens for reset password test:
const User = require("../models/user");

let token;
let cookieHeader; // will hold set-cookie from login response
let noteId;

describe("🧠 Note App Backend - Full routes test", () => {
  // increase default timeout for safety (if CI is slow)
  jest.setTimeout(20000);

  // ========== USER: signup, login, profile ==========
  it("POST /api/users/signup -> should register a new user", async () => {
    const res = await request(app).post("/api/users/signup").send({
      name: "Test User",
      email: "test@example.com",
      password: "123456",
    });
    expect(res.statusCode).toBe(201);
    // controller responds with email at res.body.email per your registerUser
    expect(res.body.email).toBe("test@example.com");
  });

  it("POST /api/users/login -> should login user and return tokens/cookie", async () => {
    const res = await request(app).post("/api/users/login").send({
      email: "test@example.com",
      password: "123456",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    token = res.body.accessToken;

    // capture cookie set by login for refresh token test
    cookieHeader = res.headers["set-cookie"];
    expect(cookieHeader).toBeDefined();
  });

  it("GET /api/users/profile -> should return current user profile", async () => {
    const res = await request(app)
      .get("/api/users/profile")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe("test@example.com");
  });

  it("PUT /api/users/profile -> should update user profile", async () => {
    const res = await request(app)
      .put("/api/users/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Updated Test User" });

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe("Updated Test User");
  });

  it("POST /api/users/logout -> should clear refresh token cookie", async () => {
    const res = await request(app).post("/api/users/logout");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Logged out successfully/i);
  });

  it("POST /api/users/refresh -> should return new access token when cookie present", async () => {
    // ensure we have cookieHeader from login above
    expect(cookieHeader).toBeDefined();

    const res = await request(app)
      .post("/api/users/refresh")
      .set("Cookie", cookieHeader); // pass cookie from login

    expect(res.statusCode).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });

  // ========== UPLOAD PROFILE PICTURE (mocked upload middleware) ==========
  it("POST /api/users/upload-profile-picture -> should accept mocked file and respond success", async () => {
    const res = await request(app)
      .post("/api/users/upload-profile-picture")
      .set("Authorization", `Bearer ${token}`);
    // Because upload.single mocked injects req.file and controller saves profilePicture,
    // response should be successful
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Profile picture uploaded successfully/i);
    expect(res.body.profilePicture).toBeDefined();
  });

  // ========== NOTES CRUD ==========
  it("POST /api/notes -> should create a note", async () => {
    const res = await request(app)
      .post("/api/notes")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Test Note", content: "This is a test note" });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/Note created successfully/i);
    expect(res.body.note).toBeDefined();
    noteId = res.body.note._id;
    expect(noteId).toBeDefined();
  });

  it("GET /api/notes -> should fetch notes list", async () => {
    const res = await request(app)
      .get("/api/notes")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("GET /api/notes/:id -> should fetch single note", async () => {
    const res = await request(app)
      .get(`/api/notes/${noteId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(noteId);
  });

  it("PUT /api/notes/:id -> should update note", async () => {
    const res = await request(app)
      .put(`/api/notes/${noteId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Updated Title" });

    expect(res.statusCode).toBe(200);
    // your controller responds with message + note
    expect(res.body.message).toBe("Note updated successfully");
    expect(res.body.note.title).toBe("Updated Title");
  });

  it("DELETE /api/notes/:id -> should delete note", async () => {
    const res = await request(app)
      .delete(`/api/notes/${noteId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Note removed successfully|Note deleted|Note removed/i);
  });

  // ========== PASSWORD RESET (forgot + reset) ==========
  it("POST /api/users/forgotpassword -> should trigger mocked email and save token", async () => {
    // This endpoint uses nodemailer (mocked). It also calls user.getResetPasswordToken() and saves user.
    const res = await request(app)
      .post("/api/users/forgotpassword")
      .send({ email: "test@example.com" });

    expect(res.statusCode).toBe(200);
    // controller returns either generic message or success: true — match flexibly
    expect(res.body.message || res.body.success).toBeDefined();
  });

  it("PUT /api/users/resetpassword/:token -> should reset password using token", async () => {
    // We need to generate a valid reset token exactly like the controller does.
    const user = await User.findOne({ email: "test@example.com" });
    expect(user).toBeDefined();

    // assume user model has getResetPasswordToken method (your controller uses it)
    const resetToken = user.getResetPasswordToken();
    // save hashed token + expiry to DB (as controller also does)
    await user.save({ validateBeforeSave: false });

    // Now call reset endpoint with plain resetToken
    const res = await request(app)
      .put(`/api/users/resetpassword/${resetToken}`)
      .send({ password: "newpassword123", confirmPassword: "newpassword123" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Password reset successful|Password reset/i);
  });
});
