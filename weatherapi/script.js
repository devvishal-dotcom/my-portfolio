const API_KEY = "60dcc472314d360166b37f1fa47725a3";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const weatherDiv = document.getElementById("weather");
const errorEl = document.getElementById("error");
const loader = document.getElementById("loader");

const cityEl = document.getElementById("city");
const tempEl = document.getElementById("temp");
const conditionEl = document.getElementById("condition");
const humidityEl = document.getElementById("humidity");
const iconEl = document.getElementById("icon");

searchBtn.addEventListener("click", handleSearch);
cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleSearch();
});

function handleSearch() {
  const city = cityInput.value.trim();
  if (!city) {
    showError("Please enter a city name");
    return;
  }
  fetchWeather(city);
}

async function fetchWeather(city) {
  showLoader();

  try {
    const url = new URL("https://api.openweathermap.org/data/2.5/weather");
    url.searchParams.set("q", city);
    url.searchParams.set("units", "metric");
    url.searchParams.set("appid", API_KEY);

    const response = await fetch(url);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch weather");
    }

    renderWeather(data);
  } catch (error) {
    showError(error.message);
  } finally {
    hideLoader();
  }
}

function renderWeather(data) {
  errorEl.textContent = "";
  weatherDiv.classList.remove("hidden");

  cityEl.textContent = `${data.name}, ${data.sys.country}`;
  tempEl.textContent = `🌡 ${Math.round(data.main.temp)} °C`;
  conditionEl.textContent = data.weather[0].description;
  humidityEl.textContent = `💧 ${data.main.humidity}%`;

  const iconCode = data.weather[0].icon;
  iconEl.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  iconEl.alt = data.weather[0].description;
}

function showError(message) {
  weatherDiv.classList.add("hidden");
  errorEl.textContent = message;
}

function showLoader() {
  loader.classList.remove("hidden");
  errorEl.textContent = "";
  weatherDiv.classList.add("hidden");
}

function hideLoader() {
  loader.classList.add("hidden");
}
