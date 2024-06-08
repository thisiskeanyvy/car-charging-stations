$(document).on('click', '.location', function () {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            async function (position) {
                var latitude = position.coords.latitude;
                var longitude = position.coords.longitude;
                //alert("Latitude : " + latitude + "\nLongitude : " + longitude);
                const response = await fetch('/assets/cities.json');
                const citiesData = await response.json();

                // Fonction pour trouver la ville la plus proche
                function findNearestCity(latitude, longitude) {
                    var nearestCity = null;
                    var minDistance = Number.MAX_VALUE;

                    citiesData.cities.forEach(function(city) {
                        var cityLatitude = parseFloat(city.latitude);
                        var cityLongitude = parseFloat(city.longitude);

                        // Calculer la distance entre la ville actuelle et les coordonnées fournies
                        var distance = calculateDistance(latitude, longitude, cityLatitude, cityLongitude);

                        // Mettre à jour la ville la plus proche si la distance est plus petite que la distance minimale actuelle
                        if (distance < minDistance) {
                            minDistance = distance;
                            nearestCity = city;
                        }
                    });

                    return nearestCity;
                }

                //calculer la distance entre deux points en utilisant la formule de Haversine
                function calculateDistance(lat1, lon1, lat2, lon2) {
                    var R = 6371; // Rayon de la Terre en kilomètres
                    var dLat = deg2rad(lat2 - lat1);
                    var dLon = deg2rad(lon2 - lon1);

                    var a =
                        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

                    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    var distance = R * c;

                    return distance;
                }

                //convertir des degrés en radians
                function deg2rad(deg) {
                    return deg * (Math.PI / 180);
                }

                var userLatitude = latitude;
                var userLongitude = longitude;

                var nearestCity = findNearestCity(userLatitude, userLongitude);

                if (nearestCity) {
                    citySearch = nearestCity.city_code.replaceAll(" ","_");
                    location.href = '/recherche/?q='+citySearch+'&lat='+latitude+'&lng='+longitude;
                    //console.log("Ville la plus proche : " + nearestCity.city_code);
                } else {
                    console.log("Aucune ville trouvée.");
                }
            },
            function (error) {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        console.log("L'utilisateur a refusé la demande de géolocalisation.");
                        break;
                    case error.POSITION_UNAVAILABLE:
                        console.log("Les informations de géolocalisation ne sont pas disponibles.");
                        break;
                    case error.TIMEOUT:
                        console.log("La demande de géolocalisation a expiré.");
                        break;
                    default:
                        console.log("Une erreur inconnue s'est produite.");
                        break;
                }
            }
        );
    } else {
        alert("La géolocalisation n'est pas prise en charge par votre navigateur.");
    }
});