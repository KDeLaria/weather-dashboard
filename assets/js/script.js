const apiKey = "";
let requestUrl = "https://api.openweathermap.org/data/2.5/weather?units=imperial&lang=en&appid=";
requestUrl = requestUrl + apiKey + "&q=";
const iconUrl = "https://openweathermap.org/img/wn/";
const iconMedium = "@2x.png";
const iconLarge = "@4x.png";
const cityButton = $(".city-button");
let cities = [];


$("#cityForm").on("submit", getWXInfo);
cityButton.on("click", buildRequestUrl);


getSavedCities();

function buildRequestUrl() {/////////////////////////////////////
    console.log("click event")
    $(".icon").css("display", "block"); // Display images
    const clickedButton = $(this);
    console.log(`${clickedButton.attr("id")} was clicked`)
    requestUrl = requestUrl + clickedButton.attr("id");
    getWeatherData();
}///////////////////////////////////////////////////////////////////////

function getWXInfo(event) {
    event.preventDefault();

    let city = $("#cityInput").val() + ",us";
    if (city !== "") {
        $(".icon").css("display", "block"); // Display images
        requestUrl = requestUrl + city;
        getWeatherData();
    }
}

function saveCity(newCity) {
    (cities !== null) ? cities.push(newCity) : cities = [newCity];
    localStorage.setItem("myCity", JSON.stringify(cities));
    getSavedCities();
}

function getSavedCities() {
    $("cities").html = "";
    cities = JSON.parse(localStorage.getItem("myCity"));
    for (let i = 0; i < cities.length; i++) {
        const ctyButton = $("<button>").attr("id", cities[i]).text(cities[i]).addClass("city-button");
        $("#cities").append(ctyButton);
    }
}

function ifCityExists(searchedCity) {
    cities = JSON.parse(localStorage.getItem("myCity"));
    if (cities !== null) {
        for (let i = 0; i < cities.length; i++) {
            console.log(`cityX: ${cities[i]}
            searchedCity: ${searchedCity}`);
            if (cities[i] === searchedCity) {
                return true;
            }
        }
    }
    return false;
}

async function getWeatherData() {
    const response = await fetch(requestUrl);
    const weatherData = await response.json();

    let timeStamp = dayjs(weatherData.dt).format("MMMM D, YYYY");
    const icon = weatherData.weather[0].icon;
    const temperature = weatherData.main.temp;
    const humidity = weatherData.main.humidity;
    const windSpeed = weatherData.wind.speed;
    const latitude = weatherData.coord.lat;
    const longitude = weatherData.coord.lon;

    (ifCityExists(weatherData.name)) ? null : saveCity(weatherData.name);

    getFiveDayForcast(latitude, longitude);   ////5 day forcast
    $("#currentIcon").attr("src", iconUrl + icon + iconLarge);
    $("#currentWeather").html(`<h2>${dayjs().format("MMMM D, YYYY")}</h2>\n
    <br /><br /><b>Temperature:</b> ${temperature}°F\n
    <br /><br /><b>Humidity:</b> ${humidity}%\n
    <br /><br /><b>Wind Speed:</b> ${windSpeed}mph`);

}

async function getFiveDayForcast(lat, lon) {
    const fiveDayUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}` +
        "&units=imperial&lang=en";
    const fiveDayResponse = await fetch(fiveDayUrl);
    const weather = await fiveDayResponse.json();
    const prefix = "#day-";
    const iconSuffix = "-icon";
    const suffix = "-weather";
    const today = dayjs();

    const wxList = weather.list;

    let dayX = 1;

    for (let i = 0; i < wxList.length; i++) {
        if (i % 8 === 0) { // grabs only 5 results of the 40
            $(prefix + dayX + iconSuffix).attr("src", iconUrl + wxList[i].weather[0].icon.toString() + iconMedium);
            $(prefix + dayX + suffix).html(`<h3>${today.add(dayX - 1, "day").format
                ("MMMM D, YYYY")}</h3>\n
                <br /><b>Temperature:</b> ${wxList[i].main.temp}°F\n
                <br /><b>Humidity:</b> ${wxList[i].main.humidity}%\n
                <br /><b>Wind Speed:</b> ${wxList[i].wind.speed}mph`);

            console.log(`DAY ${dayX}
            timeStamp: ${wxList[i].dt}
            temerature: ${wxList[i].main.temp}
            humidity: ${wxList[i].main.humidity}
            windspeed: ${wxList[i].wind.speed}`);
            dayX++;
        }
    }
}