const apiKey = "";
let requestUrl = "https://api.openweathermap.org/data/2.5/weather?units=imperial&lang=en&appid=";
requestUrl = requestUrl + apiKey + "&q=";
const iconUrl = "https://openweathermap.org/img/wn/";
const iconMedium = "@2x.png";
const iconLarge = "@4x.png";
let cities = [];

$("#cityForm").on("submit", buildRequestUrl);

function buildRequestUrl(event) {
    event.preventDefault();
    const city = $("#cityInput").val() + ",US";
    console.log(`City input: ${city}`);
    if (city !== "") {
        requestUrl = requestUrl + city;
        getWeatherData();
    }
}

function ifCityExists(newCity) {
    cities = JSON.parse(localStorage.getItem("myCity"));
    if (cities !== null) {
        cities.forEach(city => {
            if (city === newCity) {
                return true;
            }
        });
    }
    return false;
}

async function getWeatherData() {
    const response = await fetch(requestUrl);
    const weatherData = await response.json();

    let timeStamp = weatherData.dt//dayjs(weatherData.dt).format("MMMM D, YYYY");
    let icon = weatherData.weather[0].icon.toString();
    let temperature = weatherData.main.temp.toString();
    let humidity = weatherData.main.humidity.toString();
    let windSpeed = weatherData.wind.speed.toString();
    let latitude = weatherData.coord.lat;
    let longitude = weatherData.coord.lon;
    /// save city name from api to storage and run ifCityExists function then save in storage
    /// and create a new button that loads for the stored cities

    getFiveDayForcast(latitude, longitude);   ////5 day forcast

    console.log(weatherData);
    $("#currentIcon").attr("src", iconUrl + icon + iconMedium);
    const wxHeading = $("<h3>").text(timeStamp);
    $("#currentWeather").append(wxHeading);
    $("#currentWeather").text(`\nTemperature: ${temperature}°F
    \nHumidity: ${humidity}%
    \nWind Speed: ${windSpeed}mph`);

}

async function getFiveDayForcast(lat, lon) {
    const fiveDayUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}` +
        "&units=imperial&lang=en&cnt=5";
    const fiveDayResponse = await fetch(fiveDayUrl);
    const weather = await fiveDayResponse.json();
    console.log(weather);
    const prefix = "#day-";
    const iconSuffix = "-icon";
    const suffix = "-weather"

    let wxList = weather.list;

    for (let i = 0; i > weather.list.length; i++) {
        console.log(`DAY ${i}
        iconDIV: ${prefix + (i + 1) + iconSuffix}
        wxDIV: ${prefix + (i + 1) + suffix}`)
        $(prefix + (i + 1) + iconSuffix).attr("src", iconUrl + wxList[i].weather[0].icon.toString() + iconMedium);
        $(prefix + (i + 1) + suffix).text(`<h3>${dayjs(wxList[i].dt).format("MMMM D, YYYY")}</h3>
        Temperature: ${wxList[i].temp.toString()}°F
        Humidity: ${wxList[i].humidity.toString()}%
        Wind Speed: ${wxList[i].wind.speed.toString()}mph`);
        
        console.log(`DAT ${i}
        timeStamp: ${wxList[i].dt}
        temerature: ${wxList[i].temp}
        humidity: ${wxList[i].humidity}
        windspeed: ${wxList[i].wind.speed}`)
    }
}