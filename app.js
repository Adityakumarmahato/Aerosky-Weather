var app = angular.module('weatherApp', []);

app.controller('WeatherController', function($scope, $http) {
    var apiKey = "2f2fa6d5d0491211a65e070dd1b17185"; 

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

    $scope.getWeather = function(cityName) {
        var searchTarget = cityName || $scope.city || $scope.selectedCity;
        if (!searchTarget) return;
        
        $scope.loading = true;
        $scope.error = "";
        
        var url = "https://api.openweathermap.org/data/2.5/weather?q=" + encodeURIComponent(searchTarget) + "&units=metric&appid=" + apiKey;
        
        $http.get(url)
            .then(function(response) {
                var data = response.data;
                
                // 🌪️ FLAT MAP DATA LAYER: Populates explicit variable properties to fit your index.html slots perfectly
                data.temperature = Math.round(data.main.temp);
                data.temp = Math.round(data.main.temp);
                data.feels_like = Math.round(data.main.feels_like);
                data.feels = Math.round(data.main.feels_like);
                data.dewpoint = Math.round(data.main.temp - ((100 - data.main.humidity) / 5)); // Calculates standard physical dewpoint
                data.windSpeed = data.wind.speed;
                data.wind_speed = data.wind.speed;
                data.visibilityMiles = (data.visibility / 1609).toFixed(1);
                data.visibility_miles = (data.visibility / 1609).toFixed(1);

                // Send the enhanced object to your templates
                $scope.weather = data;
                $scope.weatherData = data;
                $scope.loading = false;
            })
            .catch(function(error) {
                $scope.loading = false;
                $scope.error = "Location payload error.";
                console.error(error);
            });
    };

    $scope.searchWeather = function() {
        $scope.getWeather();
    };

    $scope.getWeather();
});
