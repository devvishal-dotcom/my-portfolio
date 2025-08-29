const express = require("express");
const fetch = require("node-fetch");
const app = express();
const PORT = 5000;

app.get("/airquality", async (req, res) => {
  const city = req.query.city || "Seattle";
  const url = `https://air-quality-by-api-ninjas.p.rapidapi.com/v1/airquality?city=${city}`;
  
  const response = await fetch(url, {
    headers: {
      "X-RapidAPI-Key": "YOUR_API_KEY",
      "X-RapidAPI-Host": "air-quality-by-api-ninjas.p.rapidapi.com"
    }
  });
  
  const data = await response.json();
  res.json(data);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
