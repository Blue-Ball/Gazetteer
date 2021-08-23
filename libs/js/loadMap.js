//Enabling map
let map = L.map("map", {
  attributionControl: false
}).setView([0, 0], 1.5);
//Adding basemap
let layer = new L.StamenTileLayer("toner");
map.addLayer(layer);

//---> added for map single click
map.options.singleClickTimeout = 250;
map.on('singleclick',function ( e ) {
  
  //http://api.geonames.org/countryCodeJSON?lat=49.03&lng=10.2&username=demo
  var mapurl = "https://maps.googleapis.com/maps/api/geocode/json?latlng="+e.latlng.lat + "," + e.latlng.lng+"&key=AIzaSyD6Cx1cmZX5lyQON7PCLwJLK36QpLI0SUo";
  //var param = "?lat="+e.latlng.lat+"&lng="+e.latlng.lng+"&username=yasha";
  ajax.get(mapurl, {}, function(data) {
      data = JSON.parse(data);
      //console.log(data);
      bFound = false;
      for( i=0; i<data.results.length; i++)
      {
        temp = data.results[i];
        for( j=0; j<temp.address_components.length; j++)
        {
          //console.log(temp.address_components[j]);
          if( temp.address_components[j].types[0]=='country' )
          {
            zoomTo(temp.address_components[j].short_name);            
            L.popup().setLatLng( e.latlng )
            .setContent( '<p>You are <code>clicked</code> at ' + temp.address_components[j].long_name )
            .openOn( map );
            bFound = true;
            break;
          }
        }
        if(bFound) return;
      }
  });

} );

var group = L.featureGroup().addTo(map);

var circle = L.circle([51.505, -0.09], 1000).addTo(group).on('singleclick', function(ev) {
	console.log( 'circle singleclick', ev );
	L.DomEvent.stop(ev);
	L.popup().setLatLng( ev.latlng )
		.setContent( '<p>Circle <code>singleclick</code> at ' + ev.latlng )
		.openOn( map );
});
circle.options.singleClickTimeout = 250;
//<---

//Declaring countries table
// let countries_tab =
//   "<table class='table table-hover' style='font-family:Georgia, arial,helvetica;'><thead class='glowing-btn'><tr><th scope='col' >Scroll & Select A Country</th></tr></thead><tbody>";
let countries_tab = "";

//Declaring country_boundry
let district_boundary = new L.geoJson();
district_boundary.addTo(map); //adding country_boundry to map

//Loading data using ajax
var ajax = {};
ajax.x = function () {
    if (typeof XMLHttpRequest !== 'undefined') {
        return new XMLHttpRequest();
    }
    var versions = [
        "MSXML2.XmlHttp.6.0",
        "MSXML2.XmlHttp.5.0",
        "MSXML2.XmlHttp.4.0",
        "MSXML2.XmlHttp.3.0",
        "MSXML2.XmlHttp.2.0",
        "Microsoft.XmlHttp"
    ];

    var xhr;
    for (var i = 0; i < versions.length; i++) {
        try {
            xhr = new ActiveXObject(versions[i]);
            break;
        } catch (e) {
        }
    }

    xhr.setRequestHeader('crossDomain', true);
    // xhr.setRequestHeader('Authorization', "Bearer " + accessToken);
    // xhr.setRequestHeader('Accept', "application/json");
    return xhr;
};

ajax.send = function (url, callback, method, data, async) {
    if (async === undefined) {
        async = true;
    }
    var x = ajax.x();
    x.open(method, url, async);
    x.onreadystatechange = function () {
        if (x.readyState == 4) {
            callback(x.responseText)
        }
    };
    if (method == 'POST') {
        x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    }
    x.send(data)
};

ajax.get = function (url, data, callback, async) {
    var query = [];
    for (var key in data) {
        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
    ajax.send(url + (query.length ? '?' + query.join('&') : ''), callback, 'GET', null, async)
};

ajax.post = function (url, data, callback, async) {
    var query = [];
    for (var key in data) {
        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
    ajax.send(url, callback, 'POST', query.join('&'), async)
};


var CountryGeos = [];
ajax.get('data/countryBorders.geo.json', {}, function(data) {
    data = JSON.parse(data);
    CountryGeos = data.features;
    for(i=0; i<data.features.length; i++)
    {
      obj = data.features[i];
      //console.log(typeof obj);
      //onClick=zoomTo("' + obj.properties.iso_a2 + '")
      district_boundary.addData(obj); //adding each feature to district_boundary
      countries_tab +=
        '<a href="#" code="'+obj.properties.iso_a2 +'" >' +
        obj.properties.name + "</a>"; // adding countries in the list
    }
    
    countries_tab += "</tbody></table>";
    document.getElementById('country_list').innerHTML = countries_tab;
    addCountryTdHandlers();

    addCountryMarkerClusters();
    district_boundary.setStyle(polystyle); //setting style for country boundries
});

// for select dropdown
var is_smal_size = 768; // screen size = 768px
var is_mobile = false;
if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
  // true for mobile device
  is_mobile = true;
  document.getElementById("country_list").style.height = "69vh";
}else{
  // false for not mobile device
  is_mobile = false;
}

function ShowDropDownCountry() {
  if(window.screen.width < is_smal_size && is_mobile)
    document.getElementById("country_list").classList.toggle("show");
}
// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.glowing-btn')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}

//Define style
function polystyle(feature) {
  return {
    fillColor: "green",
    weight: 2,
    opacity: 1,
    color: "white", //Outline color
    fillOpacity: 0.7,
  };
}

//Setting and adding highlight info
let highlight_boundary = new L.geoJson();

highlight_boundary.addTo(map);

//Higlight style
function highstyle(feature) {
  return {
    fillColor: "blue",
    weight: 2,
    opacity: 1,
    color: "white", //Outline color
    fillOpacity: 0.7,
  };
}

//Making to zoom on a country
function zoomTo(iso) {
  country = iso; //$(e).html();
  district_boundary.eachLayer(function (layer) {
    if (layer.feature.properties.iso_a2 == country) {
      highlight_boundary.clearLayers();
      highlight_boundary.addData(layer.feature);
      map.fitBounds(layer.getBounds()); //zoom to country
      highlight_boundary.setStyle(highstyle); // make highlight
      LoadCountryInfo(country); //loading country info
    }
  });
}

// Description: A Leaflet control that search markers/features location by custom property.
function getSelectedBoundsCenterLatLng() {
  var bounds = map.getBounds(),
    southWest = bounds.getSouthWest(),
    northEast = bounds.getNorthEast(),
    lngSpan = northEast.lng - southWest.lng,
    latSpan = northEast.lat - southWest.lat;

  return new L.LatLng(
      southWest.lat + latSpan * Math.random(),
      southWest.lng + lngSpan * Math.random());
}
// var markers = L.markerClusterGroup();
// markers.on('clusterclick', function (a) {
//   a.layer.zoomToBounds();
// });

// var addressPoints = [];
// function addMarkerGroup()
// {
//   for (var i = 0; i < addressPoints.length; i++) {
//     var a = addressPoints[i];
//     var title = a[2];
//     var marker = L.marker(new L.LatLng(a[0], a[1]), {
//       title: title
//     });
//     marker.bindPopup(title);
//     markers.addLayer(marker);
//   }
//   map.addLayer(markers);
// }
function addCountryMarkerClusters()
{
  for(i=0; i<CountryGeos.length; i++)
  {
    countrycode = CountryGeos[i].properties.iso_a2;
    countrynum = CountryGeos[i].properties.iso_n3;
    countryname = CountryGeos[i].properties.name;

    polygons = CountryGeos[i].geometry.coordinates;
    var markers = L.markerClusterGroup();
    if(typeof polygons[i] == 'array')
    for(j=0; j<polygons[i].length; j++)
    {
      if(typeof polygons[i][j] == 'array')
      for(k=0; k<polygons[i][j].length; k++)
      {
        if(typeof polygons[i][j][k] == 'array')
        for(l=0; l<polygons[i][j][k].length; l++)
        {
          if(typeof polygons[i][j][k][l] == 'array')
          for(m=0; m<polygons[i][j][k][l].length; m++)
          {
            if(typeof polygons[i][j][k][l][m] == 'array')
            for(n=0; n<polygons[i][j][k][m].length; n++)
            {
              if(typeof polygons[i][j][k][l][m][n] != 'array')
              {
                var a = polygons[i][j][k][l][m];
                var marker = L.marker(new L.LatLng(a[0], a[1]), {});
                markers.addLayer(marker);
                break;
              }
            }
            else
            {
              var a = polygons[i][j][k][l];
              var marker = L.marker(new L.LatLng(a[0], a[1]), {});
              markers.addLayer(marker);
              break;
            }
          }
          else
          {
            var a = polygons[i][j][k];
            var marker = L.marker(new L.LatLng(a[0], a[1]), {});
            markers.addLayer(marker);
            break;
          }
        }
        else
        {
          var a = polygons[i][j];
          var marker = L.marker(new L.LatLng(a[0], a[1]), {});
          markers.addLayer(marker);
          break;
        }
      }
    }
    map.addLayer(markers);
  }
}