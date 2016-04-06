# VTT jQuery Map Plugin
This jQuery plugin purpose is to easily create a Google Map with little configurations.
This plugin takes automatically the markers you added in the map HTML container (or in the JS configuration) and adds them on the created map.

## Usage

1. Include jQuery and plugin dependencies:

	```html
	<script src="http://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js"></script>
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
	$("#element").map({
		// config
	});
	```

5. Enjoy your map with markers!

## Structure

The basic structure of the project is given in the following way:

```
├── demo/
│   └── index.html
├── dist/
│   ├── jquery.map.js
│   └── jquery.map.min.js
├── src/
│   └── jquery.map.js
├── .gitignore
├── bower.json
├── gulpfile.js
└── package.json
```

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

#### [demo/](demo)

Contains a simple HTML file to demonstrate the plugin.

#### [dist/](dist)

This is where the generated files are stored once Gulp runs.

#### [src/](src)

Contains the JavaScript files responsible for the plugin.

#### [.gitignore](.gitignore)

List of files that we don't want Git to track.

> Check this [Git Ignoring Files Guide](https://help.github.com/articles/ignoring-files) for more details.

#### [bower.json](bower.json)

Specify all dependencies loaded via Bower.

> Check [bower.io](http://bower.io//) if you haven't heard about this project yet.

#### [gulpfile.js](gulpfile.js)

Contains all automated tasks using Gulp.

> Check [gulpjs.com](http://gulpjs.com/) if you haven't heard about this project yet.

#### [package.json](package.json)

Specify all dependencies loaded via Node.JS.

> Check [NPM](https://npmjs.org/doc/json.html) for more details.

## History

Check [Releases](../../releases) for detailed changelog.

