var app = angular.module('weatherApp', []);

app.controller('WeatherController', function($scope, $http) {
    var apiKey = "2f2fa6d5d0491211a65e070dd1b17185"; 

    $scope.isCelsius = true; 
    $scope.showJson = false;

    $scope.majorCities = [
        "Agra", "Ahmedabad", "Ajmer", "Akola", "Alappuzha", "Aligarh", "Allahabad",
        "Amravati", "Amritsar", "Aurangabad", "Bangalore", "Barasat", "Bareilly",
        "Belgaum", "Bhagalpur", "Bharatpur", "Bharuch", "Bhopal", "Bhubaneswar",
        "Bidar", "Bikaner", "Bilaspur", "Chandigarh", "Chennai", "Coimbatore",
        "Cuttack", "Darbhanga", "Dehradun", "Delhi", "Dhanbad", "Dharwad", "Durgapur",
        "Faridabad", "Firozabad", "Fatehpur", "Gandhinagar", "Gaya", "Ghaziabad",
        "Gorakhpur", "Gurgaon", "Guwahati", "Gwalior", "Haridwar", "Hassan", "Howrah",
        "Hubli", "Hyderabad", "Hisar", "Imphal", "Indore", "Itanagar", "Jabalpur",
        "Jaipur", "Jalandhar", "Jammu", "Jamnagar", "Jhansi", "Jodhpur",
        "Kanpur", "Kochi", "Kolkata", "Kota", "Kozhikode", "Kurnool", "Lucknow",
        "Ludhiana", "Madurai", "Mangalore", "Meerut", "Moradabad", "Mumbai", "Mysore",
        "Nagpur", "Nashik", "New Delhi", "Noida", "Patiala", "Patna", "Pondicherry",
        "Pune", "Raipur", "Rajkot", "Ranchi", "Rourkela", "Salem", "Sangli", "Satara",
        "Shimla", "Shillong", "Shivamogga", "Solapur", "Srinagar", "Surat", "Thane",
        "Thiruvananthapuram", "Thrissur", "Tirupati", "Tirunelveli", "Udaipur", "Ujjain",
        "Vadodara", "Varanasi", "Vasai", "Vijayawada", "Visakhapatnam", "Vellore", "Warangal"
    ];

    $scope.localizedData = {
        "Jamshedpur Blocks": [
            "Sakchi, Jamshedpur", "Bistupur, Jamshedpur", "Golmuri, Jamshedpur", 
            "Telco Colony, Jamshedpur", "Sonari, Jamshedpur", "Kadma, Jamshedpur", 
            "Mango, Jamshedpur", "Jugsalai, Jamshedpur", "Baridih, Jamshedpur", 
            "Parsudih, Jamshedpur", "Adityapur, Jamshedpur", "Gamharia, Jamshedpur", 
            "Ghatshila, Jamshedpur"
        ],
        "Jamtara Blocks": [
            "Jamtara Town, Jamtara", "Mihijam, Jamtara", "Karmatanr, Jamtara", 
            "Narayanpur, Jamtara", "Kundhit, Jamtara", "Nala, Jamtara", "Fatehpur, Jamtara"
        ],
        "Ranchi Blocks": [
            "Lalpur, Ranchi", "Doranda, Ranchi", "Kanke, Ranchi", "Ratu Road, Ranchi", 
            "Morabadi, Ranchi", "Hatia, Ranchi", "Namkum, Ranchi", "Bariatu, Ranchi", 
            "Chutia, Ranchi", "Dhurwa, Ranchi", "Kokar, Ranchi"
        ],
        "Dhanbad Blocks": [
            "Jharia, Dhanbad", "Sindri, Dhanbad", "Katras, Dhanbad", "Chirkunda, Dhanbad", 
            "Govindpur, Dhanbad", "Putkee, Dhanbad", "Saraidhela, Dhanbad", "Bank More, Dhanbad"
        ],
        "Jamtara Side-by Regions": [
            "Chittaranjan", "Rupnarayanpur", "Asansol", "Deoghar", "Madhupur", "Dumka", "Giridih"
        ]
    };

    $scope.cities = angular.copy($scope.majorCities);
    angular.forEach($scope.localizedData, function(places) {
        $scope.cities = $scope.cities.concat(places);
    });

    $scope.cities = $scope.cities.filter(function(item, index, self) {
        return self.indexOf(item) === index;
    });

    $scope.city = "Mumbai"; 
    $scope.selectedCity = "Mumbai"; 
    $scope.weather = null; 
    $scope.loading = false;
    $scope.error = "";
    
    $scope.toggleUnits = function() {
        $scope.isCelsius = !$scope.isCelsius;
    };

    $scope.convertTemp = function(tempC) {
        if (tempC === undefined || tempC === null) return 0;
        return $scope.isCelsius ? tempC : (tempC * 9/5) + 32;
    };

    $scope.convertSpeed = function(speedMs) {
        if (!speedMs) return 0;
        return $scope.isCelsius ? speedMs : speedMs * 2.23694;
    };

    $scope.convertDist = function(meters) {
        if (!meters) return 0;
        return $scope.isCelsius ? (meters / 1000) : (meters / 1609.34);
    };

    $scope.getWindDirection = function(deg) {
        if (!deg) return "N";
        var val = Math.floor((deg / 22.5) + 0.5);
        var arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
        return arr[(val % 16)];
    };

    $scope.getLifestyleAdvice = function(temp, humidity) {
        if (!temp) return "Conditions are stable.";
        if (temp > 30) return "High thermal exertion index. Stay hydrated.";
        if (humidity > 80) return "Elevated moisture content detected.";
        return "Ideal ambient baseline for routine outdoor operations.";
    };

    $scope.getWeather = function(cityName) {
        var searchTarget = cityName || $scope.city || $scope.selectedCity;
        if (!searchTarget) return;
        
        $scope.loading = true;
        $scope.error = "";
        
        var url = "https://api.openweathermap.org/data/2.5/weather?q=" + encodeURIComponent(searchTarget) + "&units=metric&appid=" + apiKey;
        
        $http.get(url)
            .then(function(response) {
                var data = response.data;
                
                $scope.dewPoint = data.main.temp - ((100 - data.main.humidity) / 5);

                var currentTime = Math.floor(Date.now() / 1000);
                $scope.isDaytime = currentTime >= data.sys.sunrise && currentTime <= data.sys.sunset;
                $scope.comfortIndex = data.main.humidity > 70 ? "Humid" : "Optimal";

                $scope.weather = data;
                $scope.rawTelemetryOut = data;
                $scope.loading = false;
            })
            .catch(function(error) {
                $scope.loading = false;
                $scope.error = "Location payload error or city not found.";
                console.error(error);
            });
    };

    $scope.searchWeather = function() {
        $scope.getWeather();
    };

    $scope.getWeather();
});
