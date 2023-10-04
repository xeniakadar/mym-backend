const jwt = require("jsonwebtoken");
const axios = require("axios");
require("dotenv").config();
const mockAxios = require("jest-mock-axios").default;
jest.mock("axios", () => require("jest-mock-axios").default);
const { get_daily_image } = require("../controllers/nasaController");

// Mock user and token
const mockUser = { id: "testUserId", username: "testUsername" };
const mockToken = jwt.sign({ user: mockUser }, process.env.SECRET, {
  expiresIn: "1h",
});

// Mock response from nasa api
const mockResponse = {
  data: {
    explanation: "It's a mock NASA image",
    url: "https://mock-url.com",
  },
};

describe("Nasa Controller Tests", () => {
  afterEach(() => {
    mockAxios.reset();
  });

  it("should verify the token and proceed to next middleware", async () => {
    const req = {
      headers: {
        authorization: `Bearer ${mockToken}`,
      },
    };
    const res = {};
    const next = jest.fn();

    await get_daily_image[0](req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("should get daily image", async () => {
    // Mock axios request
    mockAxios.get.mockImplementationOnce(() => Promise.resolve(mockResponse));

    const req = {
      authData: mockUser,
    };

    const res = {
      json: jest.fn(),
      status: jest.fn(() => res),
    };

    await get_daily_image[1](req, res);

    expect(res.json).toHaveBeenCalledWith(mockResponse.data);
  });

  it("should handle errors", async () => {
    // Mock axios request
    mockAxios.get.mockImplementationOnce(() =>
      Promise.reject(new Error("Server Error")),
    );

    const req = {
      authData: mockUser,
    };

    const res = {
      json: jest.fn(),
      status: jest.fn(() => res),
      send: jest.fn(),
    };

    await get_daily_image[1](req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith("Server Error");
  });
});
