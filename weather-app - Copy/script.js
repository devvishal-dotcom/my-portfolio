const apiKey = "c7ea85f61ba6e86ca399cdabb469167a";

async function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) {
    alert("Please enter a city name");
    return;
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.cod !== 200) {
      document.getElementById("weatherResult").innerHTML = "<p>City not found. Try again.</p>";
      document.body.style.background = "linear-gradient(to top, #74ebd5, #ACB6E5)"; // default sky
      return;
    }

    // Display weather info
    document.getElementById("cityName").innerText = data.name;
    document.getElementById("temperature").innerText = `🌡 ${data.main.temp}°C`;
    document.getElementById("condition").innerText = data.weather[0].description;
    document.getElementById("icon").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    // Change background dynamically
    const condition = data.weather[0].main.toLowerCase();
    if (condition.includes("cloud")) {
      document.body.style.background = "linear-gradient(to top, #bdc3c7, #2c3e50)"; // cloudy gray
    } else if (condition.includes("rain") || condition.includes("drizzle")) {
      document.body.style.background = "linear-gradient(to top, #4e54c8, #8f94fb)"; // rainy purple-blue
    } else if (condition.includes("clear") || condition.includes("sun")) {
      document.body.style.background = "linear-gradient(to top, #fceabb, #f8b500)"; // sunny yellow
    } else if (condition.includes("snow")) {
      document.body.style.background = "linear-gradient(to top, #e0eafc, #cfdef3)"; // snowy white-blue
    } else if (condition.includes("thunderstorm")) {
      document.body.style.background = "linear-gradient(to top, #141e30, #243b55)"; // stormy dark
    } else {
      document.body.style.background = "linear-gradient(to top, #74ebd5, #ACB6E5)"; // default
    }

  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
