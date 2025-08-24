const apiKey = "cb6c1c063acfbf996468d009cd906068"; // replace with your OpenWeather key

async function getWeather() {
  const city = document.getElementById("cityInput").value;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("City not found");
    const data = await response.json();

    document.getElementById("cityName").innerText = `${data.name}, ${data.sys.country}`;
    document.getElementById("temperature").innerText = `🌡️ ${data.main.temp}°C`;
    document.getElementById("condition").innerText = `☁️ ${data.weather[0].description}`;
    document.getElementById("icon").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

  } catch (error) {
    alert(error.message);
  }
}
