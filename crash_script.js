
const actions= [
     'CONTRIBUTING FACTOR VEHICLE 1',
     'CONTRIBUTING FACTOR VEHICLE 2',
     'CONTRIBUTING FACTOR VEHICLE 3',
     'CONTRIBUTING FACTOR VEHICLE 4',
     'CONTRIBUTING FACTOR VEHICLE 5',
]

const categories = [ // [label, color of marker]
	['killed', '#ff0000'],
	['injured', '#0000ff'],
];

const vehicle_types = [
    'VEHICLE TYPE CODE 1',
    'VEHICLE TYPE CODE 2',
    'VEHICLE TYPE CODE 3',
    'VEHICLE TYPE CODE 4',
    'VEHICLE TYPE CODE 5'
]

var getcategory = function (feature) {
    if (
        Number(feature.properties['NUMBER OF PEDESTRIANS KILLED']) > 0 |
        Number(feature.properties['NUMBER OF CYCLIST KILLED']) > 0
    ) {
        return categories[0]
    }
    else {
        return categories[1]
    }
}

var getboundary = function (city, map) { // Add municipal boundary
    url = `https://nominatim.openstreetmap.org/search.php?city=${city}&state=new york&polygon_geojson=1&format=jsonv2`
    fetch(url).then(function(response) {
        return response.json();
    })
    .then(function(json) {
        boundaryFeature = json[0].geojson;
        L.geoJSON(boundaryFeature,{
            color: 'blue',        // Outline color
            fillColor: '#00004', // Fill color
            fillOpacity: 0.10     // Fill opacity (0.0 to 1.0)
        }).addTo(map);
    });
    return map;
}

var getlabel = function (feature) { // For use constructing popup
    var retstr = feature.properties["CRASH DATE"] + ': '
    var commas = false;
    if (
        Number(feature.properties['NUMBER OF PEDESTRIANS KILLED']) > 0
    ) {
        retstr += 'pedestrian killed';
        commas = true;
    }
    if (
        Number(feature.properties['NUMBER OF PEDESTRIANS INJURED']) > 0
    ) {
        retstr += `${commas ? ', ' : ''}pedestrian injured`;
        commas = true;
    }
    if (
        Number(feature.properties['NUMBER OF CYCLIST KILLED']) > 0
    ) {
        retstr += `${commas ? ', ' : ''}cyclist killed`;
        commas = true;
    }
    if (
        Number(feature.properties['NUMBER OF CYCLIST INJURED']) > 0
    ) {
        retstr += `${commas ? ', ' : ''}cyclist injured`;
        commas = true;
    }

    var acts = [];
    for (var i = 0; i < actions.length; i++) {
        action = feature.properties[actions[i]];
        if (action) {
            acts.push(action)
        }
    }
    retstr +=  `<br>Action[s] reported: ${acts.join()}`;

    var types = []
    for (var i = 0; i < vehicle_types.length; i++) {
        vtype = feature.properties[vehicle_types[i]];
        if (vtype) {
            types.push(vtype)
        }
    }
    retstr += `<br>Vehicle type[s]: ${types.join()}`
	return retstr
}

const circleMarkerStyle = {
    radius: 8,
    fillColor: '#000000',
    color: '#000',
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
}

const cities = [
    'new york'
];

var getMarker = function (feature, latlng) {
    var localStyle = circleMarkerStyle;
	localStyle.fillColor = getcategory(feature)[1];
    return L.circleMarker(latlng, localStyle);
}

// Initialize the map
const map = L.map('mapid').setView([40.7128, -74.0060], 12);

// Add municipal boundaries
 cities.forEach((city) => {
  getboundary(city, map);
});

// Add a tile layer (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 24,         // Allows user to zoom in up to level 24 on the map
    maxNativeZoom: 19,   // Tells Leaflet to stop fetching new tiles past 19 and scale existing ones
    attribution: '© [OpenStreetMap]() contributors'
}).addTo(map);

// Create legend
var legend = L.control({position: 'topright'});

legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend');
    var labels = ['<strong>Categories</strong>'];

    for (var i = 0; i < categories.length; i++) {
        div.innerHTML += labels.push(
            '<i style="background:' + categories[i][1] + '"></i> ' +
				categories[i][0]
        );
    }
    div.innerHTML = labels.join('<br>');
    return div;
};

legend.addTo(map);

// Create a Marker Cluster Group
var markers = L.markerClusterGroup({
	maxZoom: 24,
    disableClusteringAtZoom: 18, // Markers will decluster at zoom level 18 and below
    // maxClusterRadius: 30 // Use default
});

// Fetch the remote data
fetch('nyc_crashes.geojson')
    .then(response => response.json())
    .then(data => {
        // 3. Process and add markers using L.geoJSON
        L.geoJSON(data, {
            onEachFeature: function (feature, layer) {
                layer.bindPopup(
                    getlabel(feature)
                );
            },
            pointToLayer: function (feature, latlng) {
                return getMarker(feature, latlng)
            }
        }).addTo(markers);
   }).catch(error => {
        console.error('Error fetching data:', error);
   });
map.addLayer(markers);

