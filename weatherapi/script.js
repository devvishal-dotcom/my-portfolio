// script.js

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

const weatherBox = document.getElementById("weather");
const cityEl = document.getElementById("city");
const iconEl = document.getElementById("icon");
const tempEl = document.getElementById("temp");
const conditionEl = document.getElementById("condition");
const humidityEl = document.getElementById("humidity");

const forecastBox = document.getElementById("forecast");
const loader = document.getElementById("loader");
const errorEl = document.getElementById("error");

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) return;
  getWeather(city);
});

async function getWeather(city) {
  errorEl.textContent = "";
  weatherBox.classList.add("hidden");
  forecastBox.innerHTML = "";
  loader.classList.remove("hidden");

  try {
    const currentRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
    );

    if (!currentRes.ok) throw new Error("City not found");

    const current = await currentRes.json();

    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
    );

    const forecast = await forecastRes.json();

    renderCurrent(current);
    renderForecast(forecast.list);
  } catch (err) {
    errorEl.textContent = err.message;
  } finally {
    loader.classList.add("hidden");
  }
}

function renderCurrent(data) {
  weatherBox.classList.remove("hidden");

  cityEl.textContent = data.name;
  tempEl.textContent = `${Math.round(data.main.temp)} °C`;
  conditionEl.textContent = data.weather[0].description;
  humidityEl.textContent = `Humidity: ${data.main.humidity}%`;
  iconEl.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
}

function renderForecast(list) {
  const days = {};

  list.forEach(item => {
    const d = item.dt_txt.split(" ")[0];
    if (!days[d]) days[d] = item;
  });

  Object.values(days)
    .slice(0, 4)
    .forEach((day, i) => {
      const date = new Date(day.dt * 1000);
      const label =
        i === 0
          ? "Today"
          : date.toLocaleDateString(undefined, { weekday: "short" });

      const card = document.createElement("div");
      card.className = "forecast-card";

      card.innerHTML = `
        <h4>${label}</h4>
        <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png">
        <p>${Math.round(day.main.temp)} °C</p>
      `;

      forecastBox.appendChild(card);
    });
}
