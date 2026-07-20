var app = angular.module("weatherApp", []);

app.controller("WeatherController", function ($scope, $http, $timeout) {

    var apiKey = "2f2fa6d5d0491211a65e070dd1b17185";
    var weatherChartInstance = null;

    $scope.isCelsius = true;
    $scope.recentCities = [];
    try {
        var stored = localStorage.getItem('aerosky_recent_nodes');
        if (stored) {
            $scope.recentCities = JSON.parse(stored) || [];
        }
    } catch (e) {
        $scope.recentCities = [];
    }

    $scope.showJson = false;
    $scope.themeGradient = "radial-gradient(circle at 50% 0%, #030712 0%, #020617 100%)";
    $scope.glowColor1 = "rgba(14, 165, 233, 0.1)";
    $scope.glowColor2 = "rgba(99, 102, 241, 0.1)";

    var cities = [
        "Agra", "Ahmedabad", "Ajmer", "Akola", "Alappuzha", "Aligarh", "Allahabad",
        "Amravati", "Amritsar", "Aurangabad", "Bangalore", "Barasat", "Bareilly",
        "Belgaum", "Bhagalpur", "Bharatpur", "Bharuch", "Bhopal", "Bhubaneswar",
        "Bidar", "Bikaner", "Bilaspur", "Chandigarh", "Chennai", "Coimbatore",
        "Cuttack", "Darbhanga", "Dehradun", "Delhi", "Dhanbad", "Dharwad", "Durgapur",
        "Faridabad", "Firozabad", "Fatehpur", "Gandhinagar", "Gaya", "Ghaziabad",
        "Gorakhpur", "Gurgaon", "Guwahati", "Gwalior", "Haridwar", "Hassan", "Howrah",
        "Hubli", "Hyderabad", "Hisar", "Imphal", "Indore", "Itanagar", "Jabalpur",
        "Jaipur", "Jalandhar", "Jammu", "Jamnagar", "Jamshedpur", "Jhansi", "Jodhpur",
        "Kanpur", "Kochi", "Kolkata", "Kota", "Kozhikode", "Kurnool", "Lucknow",
        "Ludhiana", "Madurai", "Mangalore", "Meerut", "Moradabad", "Mumbai", "Mysore",
        "Nagpur", "Nashik", "New Delhi", "Noida", "Patiala", "Patna", "Pondicherry",
        "Pune", "Raipur", "Rajkot", "Ranchi", "Rourkela", "Salem", "Sangli", "Satara",
        "Shimla", "Shillong", "Shivamogga", "Solapur", "Srinagar", "Surat", "Thane",
        "Thiruvananthapuram", "Thrissur", "Tirupati", "Tirunelveli", "Udaipur", "Ujjain",
        "Vadodara", "Varanasi", "Vasai", "Vijayawada", "Visakhapatnam", "Vellore", "Warangal"
    ];

    $scope.aqiConfig = {
        1: { label: "Excellent", color: "#10b981" },
        2: { label: "Fair", color: "#34d399" },
        3: { label: "Moderate", color: "#fbbf24" },
        4: { label: "Poor", color: "#f97316" },
        5: { label: "Severe", color: "#ef4444" }
    };

    $scope.activityMeta = {
        running: { label: "Outdoor Running & Cardio", icon: "🏃" },
        drone: { label: "UAV Commercial Drone Flight", icon: "🛸" },
        photo: { label: "Photography Golden Hour", icon: "📷" },
        commute: { label: "Urban Bike Commuting", icon: "🚲" }
    };

    $scope.showSuggestions = function () {
        if (!$scope.city) {
            $scope.suggestions = [];
            return;
        }
        $scope.suggestions = cities.filter(function (city) {
            return city.toLowerCase().startsWith($scope.city.toLowerCase());
        });
    };

    $scope.selectCity = function (city) {
        $scope.city = city;
        $scope.suggestions = [];
        $scope.searchWeather();
    };

    $scope.toggleUnits = function () {
        $scope.isCelsius = !$scope.isCelsius;
        if ($scope.weather) {
            updateWeatherChart($scope.weather.main.temp, $scope.weather.main.feels_like);
        }
    };

    $scope.convertTemp = function (celsius) {
        if (celsius === undefined || celsius === null) return 0;
        return $scope.isCelsius ? celsius : (celsius * 9 / 5) + 32;
    };

    $scope.convertSpeed = function (ms) {
        if (!ms) return 0;
        return $scope.isCelsius ? ms : ms * 2.23694;
    };

    $scope.convertDist = function (meters) {
        if (!meters) return 10;
        var km = meters / 1000;
        return $scope.isCelsius ? km : km * 0.621371;
    };

    $scope.getWindDirection = function (deg) {
        if (deg === undefined || deg === null) return 'N';
        var angles = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        var idx = Math.round(deg / 45) % 8;
        return angles[idx];
    };

    $scope.getUvConfig = function (uv) {
        if (uv <= 2.9) return { label: "Low", color: "#10b981", advice: "Safe matrix profile. Standard solar protection rules.", skinTime: 60 };
        if (uv <= 5.9) return { label: "Moderate", color: "#fbbf24", advice: "SPF 15+ advised. Seek shade over midday intervals.", skinTime: 30 };
        if (uv <= 7.9) return { label: "High", color: "#f97316", advice: "SPF 30+ shield recommended. Reduce raw exposure bounds.", skinTime: 20 };
        return { label: "Extreme", color: "#ef4444", advice: "Hazardous radiation index. Deploy maximum skin blockades.", skinTime: 10 };
    };

    $scope.getLifestyleAdvice = function (temp, humidity) {
        if (temp > 30) {
            return "Extreme thermal output. Light, breathable fabrics are highly recommended. Ensure continuous hydration and minimize outdoor intervals.";
        } else if (temp < 15) {
            return "Chilled atmospheric conditions detected. Layering with premium insulation composites or wool blends is advised.";
        } else {
            return "Optimal climate balance. Excellent conditions for regular outdoor activities, light sportswear, and standard ventilation.";
        }
    };

    $scope.removeRecentCity = function (cityName) {
        $scope.recentCities = $scope.recentCities.filter(function (c) { return c !== cityName; });
        localStorage.setItem('aerosky_recent_nodes', JSON.stringify($scope.recentCities));
    };

    $scope.copyJson = function () {
        var str = JSON.stringify($scope.rawTelemetryOut, null, 2);
        navigator.clipboard.writeText(str);
    };

    $scope.getDeviceLocation = function () {
        if (navigator.geolocation) {
            $scope.error = "Syncing satellite coordinates...";
            navigator.geolocation.getCurrentPosition(function (position) {
                var lat = position.coords.latitude;
                var lon = position.coords.longitude;
                var url = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&units=metric&appid=" + apiKey;

                $http.get(url).then(function (response) {
                    $scope.city = response.data.name;
                    $scope.error = "";
                    $scope.searchWeather();
                }).catch(function () {
                    $scope.error = "Location telemetry offline.";
                });
            }, function () {
                $scope.error = "Location access denied.";
            });
        } else {
            $scope.error = "Hardware engine lacks Geolocation capacity.";
        }
    };

    function updateWeatherChart(temp, feelsLike) {
        $timeout(function () {
            var ctx = document.getElementById('weatherChart');
            if (!ctx) return;

            if (weatherChartInstance) {
                weatherChartInstance.destroy();
            }

            var chartLabels = ['06:00 AM', '10:00 AM', '02:00 PM', '06:00 PM', '10:00 PM'];
            var baseCurve = [
                $scope.convertTemp(temp - 3),
                $scope.convertTemp(temp),
                $scope.convertTemp(temp + 4),
                $scope.convertTemp(temp + 1),
                $scope.convertTemp(temp - 2)
            ];
            var feelsCurve = [
                $scope.convertTemp(feelsLike - 2),
                $scope.convertTemp(feelsLike),
                $scope.convertTemp(feelsLike + 3),
                $scope.convertTemp(feelsLike),
                $scope.convertTemp(feelsLike - 1)
            ];

            var unitLabel = "°" + ($scope.isCelsius ? 'C' : 'F');

            weatherChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: chartLabels,
                    datasets: [
                        {
                            label: 'Base Temp (' + unitLabel + ')',
                            data: baseCurve,
                            borderColor: '#0ea5e9',
                            backgroundColor: 'rgba(14, 165, 233, 0.05)',
                            borderWidth: 3,
                            tension: 0.4,
                            fill: true
                        },
                        {
                            label: 'Thermal Sensation (' + unitLabel + ')',
                            data: feelsCurve,
                            borderColor: '#6366f1',
                            backgroundColor: 'transparent',
                            borderWidth: 2,
                            borderDash: [5, 5],
                            tension: 0.4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: { color: '#94a3b8', font: { family: 'Arial', size: 11 } }
                        }
                    },
                    scales: {
                        y: {
                            grid: { color: 'rgba(30, 41, 59, 0.5)' },
                            ticks: { color: '#64748b' }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { color: '#64748b' }
                        }
                    }
                }
            });
        }, 100);
    }

    function runCalculations(data) {
        var t = data.main.temp;
        var rh = data.main.humidity;

        var gamma = ((17.27 * t) / (237.7 + t)) + Math.log(rh / 100);
        $scope.dewPoint = (237.7 * gamma) / (17.27 - gamma);

        if ($scope.dewPoint < 10) $scope.comfortIndex = "Crisp / Refreshing";
        else if ($scope.dewPoint <= 15) $scope.comfortIndex = "Comfortable Horizon";
        else if ($scope.dewPoint <= 20) $scope.comfortIndex = "Sticky / Humid";
        else $scope.comfortIndex = "Oppressive Atmospheric Mass";

        var now = Math.floor(Date.now() / 1000);
        var sunrise = data.sys.sunrise;
        var sunset = data.sys.sunset;

        $scope.isDaytime = now > sunrise && now < sunset;

        if (now <= sunrise) $scope.sunProgress = 0;
        else if (now >= sunset) $scope.sunProgress = 100;
        else $scope.sunProgress = ((now - sunrise) / (sunset - sunrise)) * 100;

        var localTimeOffset = new Date().getTimezoneOffset() * 60;
        var targetTime = new Date((Date.now() + (data.timezone * 1000) + (localTimeOffset * 1000)));
        $scope.localTimeStr = targetTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        var w = data.weather[0].main.toLowerCase();
        if (w.includes('clear')) {
            $scope.themeGradient = "radial-gradient(circle at 50% 0%, #072e54 0%, #020617 100%)";
            $scope.glowColor1 = "rgba(251, 191, 36, 0.15)";
            $scope.glowColor2 = "rgba(14, 165, 233, 0.1)";
        } else if (w.includes('cloud')) {
            $scope.themeGradient = "radial-gradient(circle at 50% 0%, #1e293b 0%, #020617 100%)";
            $scope.glowColor1 = "rgba(148, 163, 184, 0.12)";
            $scope.glowColor2 = "rgba(71, 85, 105, 0.1)";
        } else if (w.includes('rain') || w.includes('drizzle')) {
            $scope.themeGradient = "radial-gradient(circle at 50% 0%, #0f172a 0%, #020617 100%)";
            $scope.glowColor1 = "rgba(99, 102, 241, 0.12)";
            $scope.glowColor2 = "rgba(56, 189, 248, 0.1)";
        } else {
            $scope.themeGradient = "radial-gradient(circle at 50% 0%, #111827 0%, #020617 100%)";
            $scope.glowColor1 = "rgba(168, 85, 247, 0.1)";
            $scope.glowColor2 = "rgba(99, 102, 241, 0.1)";
        }

        var rScore = 100;
        if (t > 35 || t < 5) rScore -= 40;
        if (rh > 80) rScore -= 25;
        if (data.wind.speed > 8) rScore -= 20;
        if (!w.includes('clear')) rScore -= 20;

        var dScore = 100;
        if (data.wind.speed > 10) dScore -= 60;
        else if (data.wind.speed > 5) dScore -= 25;
        if (data.visibility < 5000) dScore -= 50;
        if (w.includes('rain')) dScore -= 40;

        var pScore = 50;
        if (w.includes('clear') && ($scope.localTimeStr.includes('PM') || $scope.localTimeStr.includes('AM'))) {
            var hours = targetTime.getHours();
            if ((hours >= 5 && hours <= 7) || (hours >= 17 && hours <= 19)) pScore = 95;
        }

        var cScore = 100;
        if (data.visibility < 2000) cScore -= 50;
        if (data.wind.speed > 12) cScore -= 30;

        $scope.activityScores = {
            running: Math.max(0, rScore),
            drone: Math.max(0, dScore),
            photo: Math.max(0, pScore),
            commute: Math.max(0, cScore)
        };

        var delayRisk = "Low";
        if (data.wind.speed > 15 || data.visibility < 1000) delayRisk = "Critical / Grounding";
        else if (data.wind.speed > 8 || data.visibility < 4000 || w.includes('rain')) delayRisk = "Moderate";

        var luggage = "Standard protective hardcase profile.";
        if (w.includes('rain')) luggage = "High waterproofing wraps required. Canopy deploy ready.";
        else if (t < 5) luggage = "Thermal layers insulation packaging advisory initialized.";

        $scope.travelLog = {
            flightDelayRisk: delayRisk,
            luggageAdvice: luggage
        };

        if (data.wind.speed > 15) $scope.weatherAlert = "High Velocity Squall Zone: Local logs record gusts scaling above 15 m/s. Secure outdoor structural rigs.";
        else if (t > 40) $scope.weatherAlert = "Extreme Thermal Variance Warning: Station indicates ambient levels breaching 40°C limiters. Minimize lifecycle parameters outdoor exposure.";
        else $scope.weatherAlert = "";
    }

    $scope.searchWeather = function () {
        if (!$scope.city) {
            $scope.error = "Please enter city name";
            return;
        }

        var url = "https://api.openweathermap.org/data/2.5/weather?q=" + encodeURIComponent($scope.city) + "&units=metric&appid=" + apiKey;

        $http.get(url).then(function (response) {
            $scope.weather = response.data;
            $scope.error = "";

            if (!$scope.recentCities.includes($scope.weather.name)) {
                $scope.recentCities.unshift($scope.weather.name);
                if ($scope.recentCities.length > 5) $scope.recentCities.pop();
                localStorage.setItem('aerosky_recent_nodes', JSON.stringify($scope.recentCities));
            }

            var pStr = localStorage.getItem('aerosky_baro_' + $scope.weather.id);
            var prevBaro = pStr ? parseFloat(pStr) : null;
            var currBaro = $scope.weather.main.pressure;
            localStorage.setItem('aerosky_baro_' + $scope.weather.id, currBaro);

            if (prevBaro === null) {
                $scope.baroChange = { text: "✓ Normal Baseline", color: "text-emerald-400" };
            } else if (currBaro < prevBaro - 2) {
                $scope.baroChange = { text: "⚠️ Dropping Rapidly", color: "text-rose-400" };
            } else if (currBaro > prevBaro + 2) {
                $scope.baroChange = { text: "📈 Increasing Stabilizing", color: "text-sky-400" };
            } else {
                $scope.baroChange = { text: "→ Constant Steady", color: "text-slate-400" };
            }

            runCalculations($scope.weather);
            updateWeatherChart($scope.weather.main.temp, $scope.weather.main.feels_like);

            var lat = $scope.weather.coord.lat;
            var lon = $scope.weather.coord.lon;

            var aqiUrl = "https://api.openweathermap.org/data/2.5/air_pollution?lat=" + lat + "&lon=" + lon + "&appid=" + apiKey;
            $http.get(aqiUrl).then(function (aqiRes) {
                $scope.aqi = aqiRes.data.list[0];
                fetchAggregateTelemetry();
            });

            var forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?q=" + encodeURIComponent($scope.city) + "&units=metric&appid=" + apiKey;
            $http.get(forecastUrl).then(function (fcRes) {
                var list = fcRes.data.list;
                $scope.dailyForecast = [];
                for (var i = 0; i < list.length; i += 8) {
                    $scope.dailyForecast.push(list[i]);
                }
                fetchAggregateTelemetry();
            });

            var uvUrl = "https://api.openweathermap.org/data/2.5/uvi?lat=" + lat + "&lon=" + lon + "&appid=" + apiKey;
            $http.get(uvUrl).then(function (uvRes) {
                $scope.uvIndex = uvRes.data.value;
                fetchAggregateTelemetry();
            }).catch(function () {
                $scope.uvIndex = 3.4;
                fetchAggregateTelemetry();
            });

        }).catch(function () {
            $scope.weather = null;
            $scope.error = "City metrics non-retrievable. Please check spelling.";
        });
    };

    function fetchAggregateTelemetry() {
        $scope.rawTelemetryOut = {
            weatherMetrics: $scope.weather,
            pollutionIndexes: $scope.aqi || "No Sync Node Found",
            uvRadiationMetric: $scope.uvIndex !== null ? $scope.uvIndex : "No Sync Node Found",
            calculatedDewpoint: $scope.dewPoint
        };
    }
});