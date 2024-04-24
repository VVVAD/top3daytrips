
document.addEventListener("DOMContentLoaded", function () {
  // Load the navigation bar content
  var navbarContainer = document.getElementById("navbar-container");
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "navbar.html", true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      navbarContainer.innerHTML = xhr.responseText;
    }
  };
  xhr.send();
});

document.addEventListener("DOMContentLoaded", function () {
  // Load the navigation bar content
  var navbarContainer = document.getElementById("content-container");
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "content.html", true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      navbarContainer.innerHTML = xhr.responseText;
    }
  };
  xhr.send();
});
// Function to fetch countries data from an external source
async function fetchCountriesData() {
  try {
    const response = await fetch('https://restcountries.com/v3.1/all');
    if (!response.ok) {
      throw new Error('Failed to fetch countries data');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Function to populate the dropdown menu with countries
function populateCountryDropdown(countries) {
  var selectElement = document.getElementById('countrySelect');
  countries.forEach(function (country) {
    var option = document.createElement('option');
    option.value = country.cca2;
    option.textContent = country.name.common;
    selectElement.appendChild(option);
  });
}

fetchCountriesData()
  .then(countries => {
    populateCountryDropdown(countries);
    //setMapViewToCountry(document.getElementById('countrySelect').value);
    var selectedCountry = localStorage.getItem('selectedCountry');
    document.getElementById('countrySelect').value = selectedCountry;
  })
  .catch(error => {
    console.error('Error fetching countries data:', error);
  });

// Event delegation for handling click events on generateRoutesBtn button
document.body.addEventListener('click', function (event) {
  var targetButton = event.target.closest('#generateRoutesBtn');
  if (targetButton) {
    event.preventDefault(); // Prevent the default action (page refresh or form submission)
    document.getElementById("loader").style.visibility = "visible";
    generateRandomRoutes();
    var currentPage = localStorage.getItem("currentPage");
    if (currentPage) {
      enterPage(parseInt(currentPage));
    }
  }
});

function isHomePage() {
  // Check whatever conditions necessary to determine if it's the home page
  // For example, you can check the current URL

  return window.location.pathname.includes('/index.html') // Adjust the URL as needed
}

// Resize the width of the .menu-image
function resizeMenuImage() {
  const menuImages  = document.querySelectorAll('.menu-image');
  menuImages.forEach(function (menuImage) {
    if (isHomePage()) {
      // Set the width to 700px for the home page
      menuImage.style.height = '700px';
    } else {
      // Set the width to 70px for other pages
      menuImage.style.height = '70px';
    }
  });
}



