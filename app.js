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
    $scope.weather = null; 

    $scope.getWeather = function() {
        var searchTarget = $scope.city;
        if (!searchTarget) return;
        
        var url = "https://api.openweathermap.org/data/2.5/weather?q=" + encodeURIComponent(searchTarget) + "&units=metric&appid=" + apiKey;
        
        $http.get(url)
            .then(function(response) {
                $scope.weather = response.data;
            })
            .catch(function(error) {
                console.error(error);
            });
    };

    $scope.getWeather();
});
