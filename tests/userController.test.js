const request = require("supertest");
const express = require("express");
const app = require("../app");
const mongoose = require("mongoose");
const User = require("../models/user");

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("User Registration and Login", () => {
  it("should register a new user", async () => {
    const uniqueUsername = "testuser_" + Math.random();
    const res = await request(app)
      .post("/api/signup")
      .send({
        username: uniqueUsername,
        email: `${uniqueUsername}@example.com`,
        password: "Test@1234",
      });
    console.log(res.body); // log the entire response body to the console
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("message", "User registered successfully");
  });

  it("should login a registered user", async () => {
    const res = await request(app).post("/api/login").send({
      username: "testuser_0.7514189127435549",
      password: "Test@1234",
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("token");
  });
});
