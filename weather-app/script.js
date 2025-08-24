const apiKey = "c7ea85f61ba6e86ca399cdabb469167a"; 

async function getWeather() {
  let city = document.getElementById("cityInput").value.trim();
  if (!city) {
    alert("Please enter a city name");
    return;
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    // Check if API returned an error
    if (data.cod != 200) {
      throw new Error(data.message);
    }

    // Update UI
    document.getElementById("cityName").innerText = `${data.name}, ${data.sys.country}`;
    document.getElementById("temperature").innerText = `🌡️ ${data.main.temp}°C`;
    document.getElementById("condition").innerText = data.weather[0].description;
    document.getElementById("icon").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

  } catch (error) {
    alert("Error: " + error.message);
    document.getElementById("cityName").innerText = "";
    document.getElementById("temperature").innerText = "";
    document.getElementById("condition").innerText = "";
    document.getElementById("icon").src = "";
  }
}
