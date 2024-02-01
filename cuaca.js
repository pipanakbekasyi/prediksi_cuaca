const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv= document.querySelector(".cuaca-sekarang");
const weatherCardsDiv= document.querySelector(".weather-cards");

const API_KEY = "c339fdcb84b40cd03b2a5c1a1342ef6d";
const createWeatherCard = (cityName, weatherItem, index) => {
    if(index === 0){//buat kartu utama/hari ini
    return `<div class="details">
                <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}C</h4>
                <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                <h4>Humidity: ${weatherItem.main.humidity}%</h4>
            </div>
            <div class="icon">
            <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
            <h4>${weatherItem.weather[0].description}</h4>
            </div>`;
    }else{//untuk prediksi cuaca
        return `<li class="card">
                <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
                <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}C</h4>
                <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                <h4>Humidity: ${weatherItem.main.humidity}%</h4>
            </li>`;
    }
    
}


const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(res => res.json()).then(data => {
        console.log(data);

        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if(!uniqueForecastDays.includes(forecastDate)){
               return uniqueForecastDays.push(forecastDate);
            }
        });

        //riset data cuaca sebelumnya
        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";

        //membuat kartu cuaca dan menambahkan ke DOM 
        fiveDaysForecast.forEach((weatherItem, index) => {
            if(index === 0){
                currentWeatherDiv.insertAdjacentHTML("beforeend",   createWeatherCard(cityName, weatherItem, index));
            }else{
                weatherCardsDiv.insertAdjacentHTML("beforeend",   createWeatherCard(cityName, weatherItem, index));
            }
           
        })
    }).catch(() => {
        alert("Error ketika memprediksi cuaca");
    });
}
const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if(!cityName) return;
    const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
    fetch(GEOCODING_API_URL).then(res => res.json()).then(data => {
       if(!data.length) return alert(`Tidak ada koordinat yag ditemukan untuk ${cityName}`);
       const { name, lat, lon } = data[0];
       getWeatherDetails(name, lat, lon);
    }).catch(() => {
        alert("Error dalam menangkap koordinat");
    });
}
const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const {latitude, longitude} = position.coords;
            const REVERSE_GEOCODING_URL =  `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            
            //mengambil nama kota dari koordinat
            fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data => {
                const { name } = data[0];
                getWeatherDetails(name, latitude, longitude);
             }).catch(() => {
                 alert("Error dalam menangkap kota");
             });
        },
        error => {
            if(error.code === error.PERMISSION_DENIED){
                alert("Geolocation request ditolak, please izinkan penggunaan lokasi")
            }
        }
    );
}

cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());
searchButton.addEventListener("click", getCityCoordinates);
locationButton.addEventListener("click", getUserCoordinates);

