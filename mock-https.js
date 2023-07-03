const https = require("https");
const nock = require("nock");

// Mocking the HTTPS call
const mockResponse = { message: "Mocked response" };
nock("https://api.example.com").get("/data").reply(200, mockResponse);

// Making the HTTPS call
https.get("https://api.example.com/data", (res) => {
  let data = "";

  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    console.log(data); // Output: {"message": "Mocked response"}
  });
});
