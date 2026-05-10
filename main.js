
document.addEventListener('DOMContentLoaded', () => {
    const weatherAPI = 'https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&hourly=temperature_2m,weathercode&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Asia%2FSingapore';

    async function fetchWeather() {
        try {
            const response = await fetch(weatherAPI);
            const data = await response.json();
            renderCurrentWeather(data);
            renderHourlyForecast(data);
            renderWeeklyForecast(data);
        } catch (error) {
            console.error('Error fetching weather data:', error);
        }
    }

    function renderCurrentWeather(data) {
        const currentWeatherContainer = document.querySelector('#current-weather .weather-card');
        const current = data.hourly;
        const now = new Date();
        const currentHour = now.getHours();
        const currentIndex = current.time.findIndex(t => new Date(t).getHours() === currentHour);

        if (currentIndex !== -1) {
            currentWeatherContainer.innerHTML = `
                <div class="forecast-item">
                    <p class="time">Now</p>
                    <img src="${getWeatherIcon(current.weathercode[currentIndex])}" alt="Weather Icon" class="weather-icon">
                    <p class="temp">${current.temperature_2m[currentIndex]}°C</p>
                </div>
            `;
        }
    }

    function renderHourlyForecast(data) {
        const hourlyForecastContainer = document.querySelector('#hourly-forecast .forecast-container');
        const hourly = data.hourly;
        const now = new Date();
        const currentHour = now.getHours();

        hourlyForecastContainer.innerHTML = '';

        for (let i = currentHour; i < currentHour + 24 && i < hourly.time.length; i++) {
            const time = new Date(hourly.time[i]);
            const hour = time.getHours();

            const hourlyItem = document.createElement('div');
            hourlyItem.className = 'forecast-item';
            hourlyItem.innerHTML = `
                <p class="time">${hour}:00</p>
                <img src="${getWeatherIcon(hourly.weathercode[i])}" alt="Weather Icon" class="weather-icon">
                <p class="temp">${hourly.temperature_2m[i]}°C</p>
            `;
            hourlyForecastContainer.appendChild(hourlyItem);
        }
    }

    function renderWeeklyForecast(data) {
        const weeklyForecastContainer = document.querySelector('#weekly-forecast .forecast-container');
        const daily = data.daily;

        weeklyForecastContainer.innerHTML = '';

        for (let i = 0; i < daily.time.length; i++) {
            const date = new Date(daily.time[i]);
            const day = date.toLocaleDateString('en-US', { weekday: 'short' });

            const weeklyItem = document.createElement('div');
            weeklyItem.className = 'forecast-item';
            weeklyItem.innerHTML = `
                <p class="date">${day}</p>
                <img src="${getWeatherIcon(daily.weathercode[i])}" alt="Weather Icon" class="weather-icon">
                <p>${daily.temperature_2m_max[i]}° / ${daily.temperature_2m_min[i]}°</p>
            `;
            weeklyForecastContainer.appendChild(weeklyItem);
        }
    }

    function getWeatherIcon(weatherCode) {
        // Simple mapping of weather codes to icons. 
        // You can expand this with more detailed icons.
        if (weatherCode >= 0 && weatherCode <= 1) return 'https://img.icons8.com/office/80/000000/sun.png'; // Clear sky, Mainly clear
        if (weatherCode >= 2 && weatherCode <= 3) return 'https://img.icons8.com/office/80/000000/partly-cloudy-day.png'; // Partly cloudy, Overcast
        if (weatherCode >= 45 && weatherCode <= 48) return 'https://img.icons8.com/office/80/000000/fog-day.png'; // Fog
        if (weatherCode >= 51 && weatherCode <= 67) return 'https://img.icons8.com/office/80/000000/rain.png'; // Drizzle, Rain
        if (weatherCode >= 71 && weatherCode <= 77) return 'https://img.icons8.com/office/80/000000/snow.png'; // Snow
        if (weatherCode >= 80 && weatherCode <= 82) return 'https://img.icons8.com/office/80/000000/rain.png'; // Rain showers
        if (weatherCode >= 95 && weatherCode <= 99) return 'https://img.icons8.com/office/80/000000/storm.png'; // Thunderstorm
        return 'https://img.icons8.com/office/80/000000/sun.png'; // Default
    }

    fetchWeather();
});
