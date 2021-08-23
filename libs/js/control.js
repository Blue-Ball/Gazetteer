// Description: A simple scale control that shows the scale of the current center of screen in metric (m/km) and imperial (mi/ft) systems
// Source: https://leafletjs.com/reference-1.7.1.html#control-scale
// Implementation: Added Scale at the bottom left of the map.
L.control.scale().addTo(map);

// Description: A basic zoom control with two buttons (zoom in and zoom out)
// Source: https://leafletjs.com/reference-1.7.1.html#control-zoom
// Implementation: Setting Zoom control (+, -) on the top right of the map
map.zoomControl.setPosition("topright");


// Source:  https://github.com/stefanocudini/leaflet-search
let controlSearch = new L.Control.Search({
  position: "topleft",
  layer: district_boundary, // name of the layer
  initial: true, // search elements only by initial text
  marker: false, // false for hide
  textPlaceholder: "Search...",
  propertyName: "name",
});

// This function will execute, when a country is searched and found on control search bar
controlSearch.on("search:locationfound", function (e) {
  district_boundary.eachLayer(function (layer) {
    if (layer.feature.properties.name == e.text) {
      let iso_a2 = layer.feature.properties.iso_a2;
      highlight_boundary.clearLayers(); //Clears previously selected country
      highlight_boundary.addData(layer.feature); //Adding newly selected country
      map.fitBounds(layer.getBounds()); //Zooming in to country selected
      highlight_boundary.setStyle(highstyle); //Setting style to selected one
      LoadCountryInfo(iso_a2); //Calling LoadCountryInfo function from below to get the country's info
    }
  });
});

// Implementation: Added Search control bar for searching countries on the top left of the map
map.addControl(controlSearch);

//Ajax for loading the country info


// ######### ---> added code 0817
function LoadCountryInfo(name) {
  getCoronaHtml(name);
  getCountryHtml(name);
}

function addDropdownClickHandler()
{
  var dropClickHndler = function() {
    ShowDropDownCountry();
  }
  document.getElementById('dropdowncountry').onclick = dropClickHndler;
  
}
addDropdownClickHandler();

function addCountryTdHandlers() {
  var table = document.getElementById("country_list");
  var cols = table.getElementsByTagName("a");
    for (j = 0; j < cols.length; j++) {
      var currentTd = cols[j];
      var createClickHandler = function(currentTd) {
        if(!currentTd || currentTd==undefined || currentTd=='') return;
          return function() {
          zoomTo(currentTd.getAttribute('code'));          
         };
      };
      currentTd.onclick = createClickHandler(currentTd);
    }
  // }
}


function getCountryHtml(country)
{
  _url = "https://restcountries.eu/rest/v2/alpha/" + country;

  ajax.get(_url, {'country':country}, function(response) {
      try{
          if(response.length>3)
          {
            var output = JSON.parse(response);

            country_name = output.name;
            capital = output.capital;
            population = output.population;
            flag = output.flag;
            currency = output.currencies[0].name;

            countryHtml  = "";
            countryHtml += "<div class='card text-white bg-info m-10' style='max-width: 100vw;height:78vh'><div class='card-header'><h2>"+country_name+"</h2></div><div class='card-body p-0'><p class='card-text'>";  
            countryHtml += "<table class='table table-borderless text-white'>";  
            countryHtml += "<tr><th>Capital</th><td>"+capital+"</td></tr>";  
            countryHtml += "<tr><th>Population</th><td>"+population+"</td></tr>";  
            countryHtml += "<tr><th>Flag</th><td><img src='"+flag+"' style='height:50px'></td></tr>";
            countryHtml += "<tr><th>Currency</th><td>"+currency+"</td></tr>";  
            countryHtml += "<tr><th>Wikipedia</th><td><a href='https://en.wikipedia.org/wiki/"+country+"' target='#' class='text-dark'>"+country+"</a></td></tr>";  
            countryHtml += "</table>";
            countryHtml += "<div class='btn-group btn-group-sm' role='group' aria-label='Basic example'><button type='button' class='btn btn-danger m-1' data-toggle='modal' data-target='#coronoModal'><i class='fas fa-shield-virus'></i> Covid</button><button type='button' class='btn btn-success m-1' data-toggle='modal' data-target='#weatherModal'><i class='fas fa-cloud-sun'></i> Weather</button><button type='button' class='btn btn-warning m-1' data-toggle='modal' data-target='#newsModal'> <i class='far fa-newspaper'></i> News</button></div></div></div>";  
            document.getElementById("country_info").innerHTML = countryHtml;

            getWeatherAndNews(country, capital);
          }
          else{
            console.log( "Response by restcountries.eu is empty");
          }
        }
        catch(exception)
        {
          console.log('response = ' + response);
          console.log(exception);
        }
  });

}


function getCoronaHtml(country)
{
  _url = "https://corona.lmao.ninja/v2/countries/"+country+"?yesterday&strict&query";

  ajax.get(_url, {'country':country}, function(response) {
      try{
          if(response.length>3)
          {
            var output = JSON.parse(response);
            total_cases =  output.cases;
            active =  output.active;
            recovered =  output.recovered;
            deaths =  output.deaths;
            todayCases =  output.todayCases;
            todayRecovered =  output.todayRecovered;
            todayDeaths =  output.todayDeaths;
            activePerOneMillion =  output.activePerOneMillion;
            recoveredPerOneMillion =  output.recoveredPerOneMillion;

            coronaHtml  = "";
            coronaHtml += "<table class='table table-borderless' style=font-size:2vh>";
            coronaHtml += "<tr><th>Total cases</th><td>"+total_cases+"</td></tr>";  
            coronaHtml += "<tr><th>Active</th><td>"+active+"</td></tr>";  
            coronaHtml += "<tr><th>Recovered</th><td>"+recovered+"</td></tr>";  
            coronaHtml += "<tr><th>Deaths</th><td>"+deaths+"</td></tr>";  
            coronaHtml += "<tr><th>Today cases</th><td>"+todayCases+"</td></tr>";  
            coronaHtml += "<tr><th>Today Recovered</th><td>"+todayRecovered+"</td></tr>";  
            coronaHtml += "<tr><th>Today Deaths</th><td>"+todayDeaths+"</td></tr>";  
            coronaHtml += "<tr><th>Active per Million</th><td>"+activePerOneMillion+"</td></tr>";  
            coronaHtml += "<tr><th>Recovered per Million</th><td>"+recoveredPerOneMillion+"</td></tr>";  
            coronaHtml += "</table>";  

            document.getElementById("covid_data").innerHTML = coronaHtml; // Sending data to Covid Modal
          }
          else{
            console.log( "Response by restcountries.eu is empty");
          }
        }
        catch(exception)
        {
          console.log('response = ' + response);
          console.log(exception);
        }
  });

}

function getWeatherAndNews(country, capital)
{
  //_url = "http://api.openweathermap.org/data/2.5/weather?q="+capital+","+country+"&APPID=4264d96a45968735df7a8073aa680813";
  ajax.post('libs/php/getData.php', {'country':country, 'capital' : capital}, function(response) {
    try{
          if(response.length>0)
          {
            var output = JSON.parse(response);

            console.log(output);
            weatherHtml = "";
            if(output.weather)
            {
              weatherHtml += "<table class='table table-borderless' style=font-size:2vh>";
              weatherHtml += "<tr><th>Average Temperature</th><td>"+output.weather.average_temp+"</td></tr>";  
              weatherHtml += "<tr><th>Max-Temperature</th><td>"+output.weather.temp_min+"</td></tr>";  
              weatherHtml += "<tr><th>Min-Temperature</th><td>"+output.weather.temp_max+"</td></tr>";  
              weatherHtml += "<tr><th>Pressure</th><td>"+output.weather.pressure+"</td></tr>";  
              weatherHtml += "<tr><th>Humidity cases</th><td>"+output.weather.humidity+"</td></tr>";  
              weatherHtml += "<tr><th>Cloud Percentage</th><td>"+output.weather.cloud_percentage+"</td></tr>";  
              weatherHtml += "<tr><th>Wind Speed</th><td>"+output.weather.wind_speed+"</td></tr>";  
              weatherHtml += "<tr><th>Wind Degrees</th><td>"+output.weather.wind_degree+"</td></tr>"; 
              weatherHtml += "</table>";  
  
              document.getElementById("weather_data").innerHTML = weatherHtml; // Sending data to Weather Modal
            }

            newsHtml = "";
            if(output.news)
            {
              newsHtml = "<table class='table table-borderless' style=font-size:2vh>";
              for(i=0; i<output.news.length; i++)
              {
                newsData = output.news[i];
                data = newsData.title;
                url = newsData.url;
                newsHtml += "<tr><td><i class='far fa-newspaper'></i> <a href='"+url+"' target='#' class='text-primary'>"+data+"</a></td></tr>";
              }
              newsHtml += "</table>";  
              document.getElementById("news_data").innerHTML = newsHtml; // Sending data to News Modal


            }  
            // document.getElementById("news_data").innerHTML = output.news_data; // Sending data to News Modal
          }
          else{
            console.log( "Response is empty");
          }
        }
        catch(exception)
        {
          console.log('response = ' + response);
          console.log(exception);
        }
  });
  
}

document.getElementById('copyright').innerHTML = document.getElementById('copyright').innerHTML + new Date().getFullYear();

