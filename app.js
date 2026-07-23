var app = angular.module('weatherApp', []);

app.controller('WeatherController', function($scope, $http) {
    var apiKey = "2f2fa6d5d0491211a65e070dd1b17185"; 

    // Initialize units default (Metric / Celsius)
    $scope.isCelsius = true;

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
    $scope.weatherData = null; 
    $scope.loading = false;
    $scope.error = "";
    $scope.recentCities = [];

    // Helper Conversion Functions expected by HTML filters
    $scope.convertTemp = function(tempC) {
        if (tempC === undefined || tempC === null) return 0;
        return $scope.isCelsius ? tempC : (tempC * 9/5) + 32;
    };

    $scope.convertSpeed = function(speedMS) {
        if (!speedMS) return 0;
        // m/s to mph if Imperial, else stay m/s
        return $scope.isCelsius ? speedMS : (speedMS * 2.23694);
    };

    $scope.convertDist = function(distMeters) {
        if (!distMeters) return 0;
        // meters to km if Metric, else to miles
        return $scope.isCelsius ? (distMeters / 1000) : (distMeters / 1609.34);
    };

    $scope.toggleUnits = function() {
        $scope.isCelsius = !$scope.isCelsius;
    };

    $scope.getWindDirection = function(degree) {
        if (!degree) return 'N';
        var directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        return directions[Math.round(degree / 45) % 8];
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
                
                // Assign to scope
                $scope.weather = data;
                $scope.weatherData = data;
                
                // Compute Dewpoint & Comfort Index for HTML tags
                if (data.main) {
                    $scope.dewPoint = data.main.temp - ((100 - data.main.humidity) / 5);
                    $scope.comfortIndex = data.main.humidity > 70 ? 'Humid' : (data.main.humidity < 30 ? 'Dry' : 'Optimal');
                }

                // Manage Recent Searches
                if ($scope.recentCities.indexOf(data.name) === -1) {
                    $scope.recentCities.unshift(data.name);
                    if ($scope.recentCities.length > 5) $scope.recentCities.pop();
                }

                $scope.loading = false;
            })
            .catch(function(error) {
                $scope.loading = false;
                $scope.error = "Unable to fetch data for location.";
                console.error(error);
            });
    };

    $scope.searchWeather = function() {
        $scope.getWeather();
    };

    $scope.selectCity = function(cityName) {
        $scope.city = cityName;
        $scope.getWeather(cityName);
    };

    $scope.removeRecentCity = function(city) {
        var index = $scope.recentCities.indexOf(city);
        if (index !== -1) {
            $scope.recentCities.splice(index, 1);
        }
    };

    // Initial Load
    $scope.getWeather();
});
