var app = angular.module('weatherApp', []);

app.controller('WeatherController', function($scope, $http) {
    var apiKey = "2f2fa6d5d0491211a65e070dd1b17185"; 

    $scope.isCelsius = true;
    $scope.suggestions = [];

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

    // Search Suggestions Logic
    $scope.showSuggestions = function() {
        if (!$scope.city || $scope.city.trim() === '') {
            $scope.suggestions = [];
            return;
        }
        var query = $scope.city.toLowerCase();
        $scope.suggestions = $scope.cities.filter(function(cityName) {
            return cityName.toLowerCase().indexOf(query) !== -1;
        }).slice(0, 6);
    };

    $scope.selectCity = function(cityName) {
        $scope.city = cityName;
        $scope.suggestions = [];
        $scope.getWeather(cityName);
    };

    // Helper Conversion Functions
    $scope.convertTemp = function(tempC) {
        if (tempC === undefined || tempC === null) return 0;
        return $scope.isCelsius ? tempC : (tempC * 9/5) + 32;
    };

    $scope.convertSpeed = function(speedMS) {
        if (!speedMS) return 0;
        return $scope.isCelsius ? speedMS : (speedMS * 2.23694);
    };

    $scope.convertDist = function(distMeters) {
        if (!distMeters) return 0;
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
        $scope.suggestions = [];
        
        var url = "https://api.openweathermap.org/data/2.5/weather?q=" + encodeURIComponent(searchTarget) + "&units=metric&appid=" + apiKey;
        
        $http.get(url)
            .then(function(response) {
                var data = response.data;
                $scope.weather = data;
                $scope.weatherData = data;
                
                if (data.main) {
                    $scope.dewPoint = data.main.temp - ((100 - data.main.humidity) / 5);
                    $scope.comfortIndex = data.main.humidity > 70 ? 'Humid' : (data.main.humidity < 30 ? 'Dry' : 'Optimal');
                }

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

    $scope.removeRecentCity = function(city) {
        var index = $scope.recentCities.indexOf(city);
        if (index !== -1) {
            $scope.recentCities.splice(index, 1);
        }
    };

    $scope.getWeather();
});
