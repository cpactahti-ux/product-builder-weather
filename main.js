
document.addEventListener('DOMContentLoaded', () => {
    async function getLocationAndWeather() {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                await fetchWeatherAndLocation(lat, lon);
            }, async (error) => {
                console.warn("Geolocation denied or failed, using default (Seoul).", error);
                await fetchWeatherAndLocation(37.5665, 126.9780);
            });
        } else {
            await fetchWeatherAndLocation(37.5665, 126.9780);
        }
    }

    async function fetchWeatherAndLocation(lat, lon) {
        try {
            // Reverse Geocoding using Nominatim
            const geoApi = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`;
            const geoResponse = await fetch(geoApi);
            const geoData = await geoResponse.json();
            
            const address = geoData.address || {};
            const country = address.country || '';
            const state = address.state || address.province || address.region || '';
            const city = address.city || address.town || address.village || address.county || '';
            
            const locationParts = [country, state, city].filter(part => part !== '');
            const locationString = locationParts.join(', ');
            
            const locationElement = document.getElementById('location-name');
            if (locationElement) {
                locationElement.innerText = locationString || "Unknown Location";
            }

            // Fetch Weather
            const weatherAPI = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weathercode&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`;
            const response = await fetch(weatherAPI);
            const data = await response.json();
            renderCurrentWeather(data);
            renderHourlyForecast(data);
            renderWeeklyForecast(data);
        } catch (error) {
            console.error('Error fetching data:', error);
            const locationElement = document.getElementById('location-name');
            if (locationElement) locationElement.innerText = "Error loading location";
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

    // --- Stock Ticker Simulation ---
    const initialStocks = {
        kr: [
            { id: 'kospi', name: 'KOSPI', price: 2750.45, change: 12.30, isUp: true },
            { id: 'kosdaq', name: 'KOSDAQ', price: 910.22, change: -4.50, isUp: false },
        ],
        us: [
            { id: 'sp500', name: 'S&P 500', price: 5120.15, change: 25.40, isUp: true },
            { id: 'nasdaq', name: 'NASDAQ', price: 16250.80, change: -120.50, isUp: false },
            { id: 'dow', name: 'Dow Jones', price: 39500.10, change: 150.20, isUp: true }
        ]
    };

    function renderStocks(market, stocks) {
        const container = document.getElementById(`${market}-stocks`);
        if (!container) return;
        
        container.innerHTML = '';
        stocks.forEach(stock => {
            // Apply correct styling classes based on market convention
            let trendClass = '';
            let sign = stock.isUp ? '+' : ''; // change already has negative sign if down
            
            if (market === 'kr') {
                trendClass = stock.isUp ? 'up' : 'down';
            } else {
                trendClass = stock.isUp ? 'us-up' : 'us-down';
            }

            const changePercent = ((stock.change / (stock.price - stock.change)) * 100).toFixed(2);

            const item = document.createElement('div');
            item.className = `stock-item ${trendClass}`;
            item.innerHTML = `
                <div class="stock-info">
                    <span class="stock-name">${stock.name}</span>
                </div>
                <div class="stock-info" style="text-align: right;">
                    <span class="stock-price">${stock.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    <span class="stock-change">${sign}${stock.change.toFixed(2)} (${sign}${changePercent}%)</span>
                </div>
            `;
            container.appendChild(item);
        });
    }

    function simulateMarketUpdates() {
        // Randomly update a stock price slightly every 2 seconds
        setInterval(() => {
            const market = Math.random() > 0.5 ? 'kr' : 'us';
            const stocks = initialStocks[market];
            const stockToUpdate = stocks[Math.floor(Math.random() * stocks.length)];
            
            // Random fluctuation between -0.2% and +0.2%
            const fluctuationPercent = (Math.random() * 0.4 - 0.2) / 100;
            const diff = stockToUpdate.price * fluctuationPercent;
            
            stockToUpdate.price += diff;
            stockToUpdate.change += diff;
            stockToUpdate.isUp = stockToUpdate.change >= 0;

            renderStocks(market, initialStocks[market]);
        }, 2000);
    }

    // Initial render
    renderStocks('kr', initialStocks.kr);
    renderStocks('us', initialStocks.us);
    simulateMarketUpdates();

    getLocationAndWeather();
});
