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


// Prepares the request url from the city button
function getSavedCityWX(event) {
    event.preventDefault();

    state = $(this).attr("id").split(",")[1];
    requestUrl = requestUrl + $(this).attr("id");
    getWeatherData();
}

// Prepares the request url from the input text
function getWXInfo(event) {
    event.preventDefault();
    state = $("#cityInput").val().split(",")[1].trim().toUpperCase();
    let city = $("#cityInput").val().trim() + ",us";
    if (city !== "") {
        requestUrl = requestUrl + city;
        getWeatherData();
    }
}

// Stores the city on the user's machine
function saveCity(newCity) {
    (cities !== null) ? cities.push(newCity) : cities = [newCity];
    localStorage.setItem("myCity", JSON.stringify(cities));
    getSavedCities();
}

// Sets up buttons for saved cities
function getSavedCities() {
    $("#cities").html("");
    cities = JSON.parse(localStorage.getItem("myCity"));
    if (cities !== null) {
        for (let i = 0; i < cities.length; i++) {
            let ctyButton = $("<button>");
            ctyButton.attr("id", cities[i]).text(cities[i]).addClass("city-button");
            $("#cities").append(ctyButton);
        }
        $(".city-button").on("click", getSavedCityWX);
    }
}

// Checks to see if the city is stored already
function ifCityExists(searchedCity) {
    cities = JSON.parse(localStorage.getItem("myCity"));
    if (cities !== null) {
        for (let i = 0; i < cities.length; i++) {
            // Checks only city names
            if (cities[i].split(",")[0] === searchedCity.split(",")[0]) {
                return true;
            }
        }
    }
    return false;
}

// Gathers the current forecast 
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

        $("#current-city").text(weatherData.name);
        $("#cityInput").val("");

        (ifCityExists(weatherData.name +","+state)) ? null : saveCity(weatherData.name +","+state);

        getFiveDayForcast(latitude, longitude);   ////5 day forcast
        $("#currentIcon").attr("src", iconUrl + icon + iconLarge);
        $("#currentWeather").html(`<h3>${dayjs().format("MMMM D, YYYY")}</h3>\n
    <br /><br /><b>Temperature:</b> ${temperature}°F\n
    <br /><br /><b>Humidity:</b> ${humidity}%\n
    <br /><br /><b>Wind Speed:</b> ${windSpeed}mph`);
    }
    catch (error) {
        console.log(error);
    }
}

// Gathers and displays the 5 day forecast
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
                $(prefix + dayX + suffix).html(`<h4>${today.add(dayX - 1, "day").format("MMMM D, YYYY")}</h4>\n
                <br /><b>Temperature:</b> ${wxList[i].main.temp}°F\n
                <br /><b>Humidity:</b> ${wxList[i].main.humidity}%\n
                <br /><b>Wind Speed:</b> ${wxList[i].wind.speed}mph`);

                dayX++;
            }
        }
    $(".icon").css("display", "flex"); // Display images
    }
    catch (error) {
        console.log(error);
    }
}