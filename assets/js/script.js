const apiKey = "0d719d0af3d2ab63a7bcf67465e11d42";
let requestUrl = "https://api.openweathermap.org/data/2.5/weather?units=imperial&lang=en&appid=";
requestUrl = requestUrl + apiKey + "&q=";
const iconUrl = "https://openweathermap.org/img/wn/";
const iconMedium = "@2x.png";
const iconLarge = "@4x.png";
let cities = [];
let state;

getSavedCities();
$("#cityForm").on("submit", getWXInfo);
$(".city-button").on("click", getSavedCityWX);


function getSavedCityWX(event) {
    event.preventDefault();

    state = $(this).attr("id").split(",")[1];
    requestUrl = requestUrl + $(this).attr("id");
    getWeatherData();
}

function getWXInfo(event) {
    event.preventDefault();
    state = $("#cityInput").val().split(",")[1];
    let city = $("#cityInput").val() + ",us";
    if (city !== "") {
        console.log("city entered:" + city);
        requestUrl = requestUrl + city;
        getWeatherData();
        $("#cityInput").val("");
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
    if (cities !== null) {
        for (let i = 0; i < cities.length; i++) {
            const ctyButton = $("<button>").attr("id", cities[i] +","+state).text(cities[i]).addClass("city-button");
            $("#cities").append(ctyButton);
        }
        $(".city-button").on("click", getSavedCityWX);
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
    try {
        let response = await fetch(requestUrl);
        let weatherData = await response.json();

        let timeStamp = dayjs(weatherData.dt).format("MMMM D, YYYY");
        let icon = weatherData.weather[0].icon;
        let temperature = weatherData.main.temp;
        let humidity = weatherData.main.humidity;
        let windSpeed = weatherData.wind.speed;
        let latitude = weatherData.coord.lat;
        let longitude = weatherData.coord.lon;

        (ifCityExists(weatherData.name)) ? null : saveCity(weatherData.name);

        getFiveDayForcast(latitude, longitude);   ////5 day forcast
        $("#currentIcon").attr("src", iconUrl + icon + iconLarge);
        $("#currentWeather").html(`<h2>${dayjs().format("MMMM D, YYYY")}</h2>\n
    <br /><br /><b>Temperature:</b> ${temperature}°F\n
    <br /><br /><b>Humidity:</b> ${humidity}%\n
    <br /><br /><b>Wind Speed:</b> ${windSpeed}mph`);
    }
    catch (error) {
        console.log(error);
    }
}

async function getFiveDayForcast(lat, lon) {
    try {
        let fiveDayUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}` +
            "&units=imperial&lang=en";
        let fiveDayResponse = await fetch(fiveDayUrl);
        let weather = await fiveDayResponse.json();
        const prefix = "#day-";
        const iconSuffix = "-icon";
        const suffix = "-weather";
        let today = dayjs();

        let wxList = weather.list;

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
    $(".icon").css("display", "flex"); // Display images
    }
    catch (error) {
        console.log(error);
    }
}