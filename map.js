
// Initialize the map

var map = L.map('map');

// Add tile layer
L.tileLayer('http://{s}.google.com/vt?lyrs=p&x={x}&y={y}&z={z}', {
  subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
}).addTo(map);

// Event delegation for handling change events on route options form
document.body.addEventListener('change', function (event) {
  var targetForm = event.target.closest('#routeOptionsForm');
  if (targetForm) {
    var routeOption = targetForm.querySelector('input[name="routeOption"]:checked').value;
    if (routeOption === 'walk') {
      routingControl.getRouter().options.routingOptions.profile = 'foot';
    } else if (routeOption === 'ride') {
      routingControl.getRouter().options.routingOptions.profile = 'bicycle';
    } else if (routeOption === 'car') {
      routingControl.getRouter().options.routingOptions.profile = 'car';
    }
    routingControl.route();
  }
});




async function fetchCountryBoundingBox(countryCode) {
  try {
    const response = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
    if (!response.ok) {
      throw new Error('Failed to fetch country data');
    }
    const data = await response.json();
    if (!data.borders || data.borders.length < 1) {
      throw new Error('Bounding box coordinates not found for the country');
    }
    return data.borders;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function setMapViewToCountry(countryCode) {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${countryCode}&format=json&addressdetails=1&limit=1`);
    if (!response.ok) {
      throw new Error('Failed to fetch geocoding data');
    }
    const data = await response.json();
    if (!data || data.length === 0) {
      throw new Error('Country not found');
    }
    const { lat, lon } = data[0];
    map.setView([lat, lon], 5);
  } catch (error) {
    console.error(error);
    alert('Error: Failed to geocode country. Please try again later.');
  }
}


// Function to remove the image from the database
async function removeImageFromDB() {
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    const response = await fetch(`https://top3daytrips-db.vercel.app/api/userdata/${userId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to remove image from DB');
    }

    console.log('Image removed from DB successfully');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Event delegation for handling change events on country select element
document.body.addEventListener('change', function (event) {
  var targetSelect = event.target.closest('#countrySelect');
  if (targetSelect) {
    var countryCode = targetSelect.value;
    setMapViewToCountry(countryCode);
    localStorage.setItem('selectedCountry', countryCode);
    localStorage.removeItem('dataId');
    removeImageFromDB();
    fetchData();

    // Remove the image from the database when changing the country
    
  }
});


// Function to generate random latitude and longitude within a bounding box
function getRandomLatLng(bounds) {
  var southWest = bounds.getSouthWest(),
    northEast = bounds.getNorthEast(),
    lat = Math.random() * (northEast.lat - southWest.lat) + southWest.lat,
    lng = Math.random() * (northEast.lng - southWest.lng) + southWest.lng;
  return L.latLng(lat, lng);
}

// Keep track of routing controls added to the map
var routingControls = [];

// Function to generate random routes within the map's current view
function generateRandomRoutes() {
  // Remove existing routes from the map
  routingControls.forEach(function (routingControl) {
    map.removeControl(routingControl);
  });
  routingControls = [];

  var bounds = map.getBounds();
  var numRoutes = 3; // Number of random routes to generate
  var storedRoutes = []; // Array to store the routes

  for (var i = 0; i < numRoutes; i++) {
    var start = getRandomLatLng(bounds);
    var end = getRandomLatLng(bounds);

    var routingControl = L.Routing.control({
      waypoints: [
        start,
        end
      ],
      lineOptions: {
        styles: [{ color: '#007bff', opacity: 0.7, weight: 5 }]
      },
      routeWhileDragging: true,
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1'
      })
    });

    // Add the routing control to the array for tracking
    routingControls.push(routingControl);

    // Get the route data from the routing control
    var routeData = routingControl.getWaypoints().map(function (waypoint) {
      return { lat: waypoint.latLng.lat, lng: waypoint.latLng.lng };
    });

    // Store the route data in the array
    storedRoutes.push(routeData);
  }

  // Convert the storedRoutes array to a string before saving to localStorage
  var storedRoutesString = JSON.stringify(storedRoutes);

  // Save routes to localStorage
  localStorage.setItem("storedRoutes", storedRoutesString);

  // Hide loader after a delay
  setTimeout(function () {
    document.getElementById("loader").style.visibility = "hidden";
  }, 1000);
}


// Function to enter a page
function enterPage(pageNumber) {
  // Remove any previously displayed routes
  removeDisplayedRoute();

  // Set the current page in localStorage
  localStorage.setItem("currentPage", pageNumber);

  // Add the corresponding route based on the page number
  var routeIndex = pageNumber - 1; // Route index is 0-based
  addRouteToMap(routeIndex);
}

// Function to remove the currently displayed route
function removeDisplayedRoute() {
  // Remove any existing routing controls from the map
  routingControls.forEach(function (routingControl) {
      map.removeControl(routingControl);
  });
  routingControls = [];
}

// Function to add a route to the map
function addRouteToMap(routeIndex) {
  // Retrieve routes from localStorage
  var storedRoutesString = localStorage.getItem("storedRoutes");

  if (storedRoutesString) {
      // Parse routes string back into an array
      var storedRoutes = JSON.parse(storedRoutesString);

      // Check if the route index is valid
      if (routeIndex >= 0 && routeIndex < storedRoutes.length) {
          // Get route data for the specified index
          var routeData = storedRoutes[routeIndex];

          // Add the route to the map
          var waypoints = routeData.map(function(waypoint) {
              return L.latLng(waypoint.lat, waypoint.lng);
          });

          var routingControl = L.Routing.control({
              waypoints: waypoints,
              lineOptions: {
                  styles: [{ color: '#007bff', opacity: 0.7, weight: 5 }]
              },
              routeWhileDragging: true,
              router: L.Routing.osrmv1({
                  serviceUrl: 'https://router.project-osrm.org/route/v1'
              })
          });

          // Add the routing control to the map
          routingControl.addTo(map);

          // Add the routing control to the array for tracking
          routingControls.push(routingControl);
      } else {
          console.log("Invalid route index.");
      }
  } else {
      console.log("No stored routes found in localStorage.");
  }
}





window.onload = function () {
  resizeMenuImage();
  var selectedCountry = localStorage.getItem('selectedCountry');
  if (selectedCountry) {
    // Set the map view to the selected country
    setMapViewToCountry(selectedCountry);
    
  }
  var currentPage = localStorage.getItem("currentPage");
  if (currentPage) {
      enterPage(parseInt(currentPage));
  }
};

