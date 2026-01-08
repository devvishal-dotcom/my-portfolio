// script.js

const apiKey = "YOUR_OPENWEATHER_API_KEY";
const form = document.getElementById("search-form");
const input = document.getElementById("city-input");
const currentBox = document.getElementById("current-weather");
const forecastBox = document.getElementById("forecast");
const loader = document.getElementById("loader");

form.addEventListener("submit", e => {
  e.preventDefault();
  const city = input.value.trim();
  if (!city) return;
  loadWeather(city);
});

async function loadWeather(city) {
  loader.style.display = "block";
  currentBox.innerHTML = "";
  forecastBox.innerHTML = "";

  try {
    const currentRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
    );
    if (!currentRes.ok) throw new Error("City not found");
    const currentData = await currentRes.json();

    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
    );
    const forecastData = await forecastRes.json();

    showCurrent(currentData);
    showForecast(forecastData.list);
  } catch (err) {
    currentBox.innerHTML = `<p class="error">${err.message}</p>`;
  } finally {
    loader.style.display = "none";
  }
}

function showCurrent(data) {
  currentBox.innerHTML = `
    <h2>${data.name}</h2>
    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png">
    <p class="temp">${Math.round(data.main.temp)} °C</p>
    <p>${data.weather[0].description}</p>
  `;
}

function showForecast(list) {
  const days = {};

  // grab first forecast entry for each day
  list.forEach(item => {
    const day = item.dt_txt.split(" ")[0];
    if (!days[day]) {
      days[day] = item;
    }
  });

  Object.values(days)
    .slice(0, 4)
    .forEach((day, i) => {
      const date = new Date(day.dt * 1000);
      const title =
        i === 0
          ? "Today"
          : date.toLocaleDateString(undefined, { weekday: "short" });

      const card = document.createElement("div");
      card.className = "forecast-card";

      card.innerHTML = `
        <h4>${title}</h4>
        <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png">
        <p>${Math.round(day.main.temp)} °C</p>
      `;

      forecastBox.appendChild(card);
    });
}
