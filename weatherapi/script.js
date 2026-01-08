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
const forecastEl = document.getElementById("forecast");

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
fetchForecast(city);

}
async function fetchForecast(city) {
try {
const url = new URL("https://api.openweathermap.org/data/2.5/forecast");
url.searchParams.set("q", city);
url.searchParams.set("units", "metric");
url.searchParams.set("appid", API_KEY);

const res = await fetch(url);
const data = await res.json();

if (!res.ok) {
throw new Error("Forecast not available");
}

renderForecast(data.list);
} catch (err) {
console.error(err.message);
}
}

function renderForecast(list) {
forecastEl.innerHTML = "";

const dailyMap = {};

list.forEach(item => {
const date = item.dt_txt.split(" ")[0];
if (!dailyMap[date]) {
dailyMap[date] = item;
}
});

const days = Object.values(dailyMap).slice(0, 4);

days.forEach((day, index) => {
const date = new Date(day.dt * 1000);
const label =
index === 0 ? "Yesterday*" :
index === 1 ? "Today" :
date.toLocaleDateString(undefined, { weekday: "short" });

const card = document.createElement("div");
card.className = "forecast-card";

card.innerHTML = `
<h4>${label}</h4>
<img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" />
<p>${Math.round(day.main.temp)} °C</p>
`;


});
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
forecastEl.appendChild(card);
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
function setWeatherBackground(weather) {
  const body = document.getElementById("app");

  if (weather.includes("rain")) body.className = "rain";
  else if (weather.includes("cloud")) body.className = "cloudy";
  else if (weather.includes("snow")) body.className = "snow";
  else body.className = "sunny";
}

// example usage
const weatherCondition = "rain"; // from API → weather[0].main
setWeatherBackground(weatherCondition.toLowerCase());
