# jQuery Map Plugin
Create a simple Google Map with markers

## Usage

1. Include jQuery and plugin dependencies:

	```html
    <script src="path/to/jquery.min.js"></script>
	```

2. Include plugin's code:

	```html
	<script src="path/to/jquery.map.js"></script>
	```

3. Prepare the HTML for the map:

	```html
	 <div id="element">
        <div class="markers">
        	<div class="marker" data-lat="46.834742" data-lng="-71.297905" data-icon="" data-title="Libéo">
                <div class="marker-popup-content">
                    <span class="title">Libéo</span>
                    <span class="adress">5700, boul. des Galeries, Bureau 300, Québec QC G2K 0H5</span>
                </div>
            </div>
		</div>
     </div>
	```

4. Call the plugin:

	```javascript
	$('#element').map({
		// config
	});
	```

5. Enjoy your map with markers!

## Downloads

* [Source](https://raw.githubusercontent.com/libeo-vtt/jquery-map/master/dist/jquery.map.js)
* [Minified version](https://raw.githubusercontent.com/libeo-vtt/jquery-map/master/dist/jquery.map.min.js)

## Configuration

__The configurations options for the plugin are the following:__

Whether the map is locked or not locked on hover (zoomable and dragable only on click, then locked again on mouse out)
```javascript
	locked: boolean //default is false
```
Whether you want to add HTML markers on the map or not
```javascript
    htmlMarkers: boolean //default is false
```
Whether you want to hide the added HTML markers or not
```javascript
    hideHtmlMarkers: boolean //default is true
```
The latitude of the center of the map
```javascript
	lat: 0
```
The longitude of the center of the map
```javascript
    lng: 0
```
The zoom of the map
```javascript
    zoom: 0
```
A JSON array of the styles you want for the map
```javascript
    styles: []
```
An array of markers using these options:
```javascript
    markers: [
		lat: 46.830543,
        lng: -71.299396,
        title: 'Marker 1',
        infoWindowContent: '<span>This is the marker 1 location</span>'
    ]
```

## History

Check [Releases](../../releases) for detailed changelog.

