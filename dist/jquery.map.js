// Map jQuery Plugin
// A jQuery map plugin to create a map.

(function($) {
    var Map = function(element, options) {
        this.mapWrapper = $(element);
        this.mapObj = null;
        this.map = null;

        // Default module configuration
        this.defaults = {
            locked: false,
            htmlMarkers: false,
            hideHtmlMarkers: true,
            lat: 0,
            lng: 0,
            zoom: 0,
            styles: [],
            markers: [],
            classes: {
                mapInnerWrapper: '',
                states: {
                    active: 'is-active'
                }
            }
        };

        // Markers
        this.markers = [];

        // Markers container element
        this.markersContainer = this.mapWrapper.find('.markers');

        // Merge default classes with window.project.classes
        this.classes = $.extend(true, this.defaults.classes, (window.project ? window.project.classes : {}));

        // Merge default labels with window.project.labels
        this.labels = $.extend(true, this.defaults.labels, (window.project ? window.project.labels : {}));

        // Merge default config with custom config
        this.config = $.extend(true, this.defaults, options || {});

        this.init();
    };

    $.extend(Map.prototype, {

        // Component initialization
        init: function() {
            // Check if the API is already loaded
            if (!window.googleAPI) {
                this.loadAPI();
            }
            // Global event after the Google Map API is loaded
            $(window).on('googleAPI', $.proxy(this.callback, this));
        },

        // Load the google map API
        loadAPI: function() {
            window.googleAPI = true;
            $.getScript('https://www.google.com/jsapi', $.proxy(function() {
                if (!window.google.maps) {
                    google.load('maps', '3', {
                        other_params: 'sensor=false',
                        callback: $.proxy(function() {
                            // Trigger global event to initialize maps
                            $(window).trigger('googleAPI');
                        }, this)
                    });
                }
            }, this));
        },

        callback: function() {
            this.createMap();
        },

        // Prepare the MAP element, create it and call the function to add markers
        createMap: function() {
            this.mapWrapper.append('<div class="map-inner-wrapper ' + this.config.classes.mapInnerWrapper + '"></div>');
            this.$mapObj = this.mapWrapper.find('.map-inner-wrapper');
            this.mapObj = this.$mapObj.get(0);
            this.$mapObj.css('height', '100%');

            this.bounds = new window.google.maps.LatLngBounds();
            this.map = new window.google.maps.Map(this.mapObj, {
                mapTypeId: 'roadmap',
                disableDefaultUI: true,
                center: new window.google.maps.LatLng(this.config.lat, this.config.lng),
                zoom: this.config.zoom,
                styles: this.config.styles
            });

            this.bindMapEvents();
            this.addMarkersJs();

            if (this.config.htmlMarkers == true) {
                this.addMarkersHTML();
            }
            if (this.config.locked == true) {
                this.lockMap();
            }
        },

        // Add markers via JS (config markers)
        addMarkersJs: function() {
            var length = this.config.markers.length;
            _.each(this.config.markers, $.proxy(function(marker) {
                marker.position = new window.google.maps.LatLng(marker.lat, marker.lng);
                this.addMarker(marker);

                if (length > 1) {
                    this.bounds.extend(position);
                    this.map.fitBounds(this.bounds);
                }
            }, this));
        },

        // Add markers via HTML elements
        addMarkersHTML: function() {
            var $markersWrapper = this.mapWrapper.find('.markers');
            var lenght = this.mapWrapper.find('.markers > .marker').length;
            var $markers = this.mapWrapper.find('.marker');

            // Bind events for html markers hover
            this.bindHtmlMarkerEvents($markers);

            // Hide HTML markers if config is set to true
            if (this.config.hideHtmlMarkers == true) {
                $markersWrapper.hide();
            }

            // Look through each markers and put the HTML data into an object
            // Then call the addMarker function with the marker object
            _.each($markers, $.proxy(function(marker) {
                var markerElement = {};
                var $marker = $(marker);
                markerElement.position = new window.google.maps.LatLng($marker.attr('data-lat'), $marker.attr('data-lng'));
                // Set marker icon (global or for this one only)
                if ($marker.attr('data-icon') != '' && $marker.attr('data-icon') != undefined) {
                    markerElement.icon = $marker.attr('data-icon');
                } else {
                    markerElement.icon = this.markersContainer.attr('data-icon');
                }
                // Set marker icon hover (global or for this one only)
                if ($marker.attr('data-icon-hover') != '' && $marker.attr('data-icon') != undefined) {
                    markerElement.iconHover = $marker.attr('data-icon-hover');
                } else {
                    markerElement.iconHover = this.markersContainer.attr('data-icon-hover');
                }
                // Set other data
                markerElement.title = $marker.attr('data-title');
                markerElement.id = $marker.attr('data-id');
                markerElement.infoWindowContent = $marker.html();

                this.addMarker(markerElement);

                if (length > 1) {
                    this.bounds.extend(position);
                    this.map.fitBounds(this.bounds);
                }
            }, this));
        },

        // Add marker on map with it's info window
        // @param marker: object with one marker infos
        addMarker: function(marker) {
            var infoWindow = '';

            var markerObj = new window.google.maps.Marker({
                position: marker.position,
                map: this.map,
                icon: marker.icon,
                iconDefault: marker.icon,
                iconHover: marker.iconHover,
                title: marker.title,
                customId: marker.id,
            });

            // Add marker to the global array
            this.markers[marker.id] = markerObj;
            // Bind events for the marker
            this.bindMapsMarkerEvents(markerObj);

            //Add the info window if content not empty
            if (marker.infoWindowContent != '' && marker.infoWindowContent != null) {
                infoWindow = new google.maps.InfoWindow({
                    content: marker.infoWindowContent,
                });
                this.bindInfoWindowEvent(markerObj, infoWindow);
            }
        },

        // Bind info window on marker
        bindInfoWindowEvent: function(marker, infoWindow) {
            marker.addListener('click', function() {
                infoWindow.open(this.map, marker);
            });
        },

        // Events for the map
        bindMapEvents: function() {
            window.google.maps.event.addDomListener(window, 'resize', $.proxy(function() {
                var center = this.map.getCenter();
                window.google.maps.event.trigger(this.map, 'resize');
                this.map.setCenter(center);
            }, this));
        },

        // Events on all HTML markers
        bindHtmlMarkerEvents: function($markers) {
            $markers.on('mouseenter', $.proxy(function(e) {
                $element = $(e.currentTarget);
                this.changeMarkerIcon($element, 'hover');
            }, this));
            $markers.on('mouseleave', $.proxy(function(e) {
                $element = $(e.currentTarget);
                this.changeMarkerIcon($element, 'default');
            }, this));
        },

        // Event on all google maps markers
        bindMapsMarkerEvents: function(marker) {
            var $marker = $('[data-id="' + marker.customId + '"]');
            // Add or remove active class on html markers
            google.maps.event.addListener(marker, 'mouseover', $.proxy(function() {
                $marker.addClass(this.classes.states.active);
                this.changeMarkerIcon($marker, 'hover');
            }, this));
            google.maps.event.addListener(marker, 'mouseout', $.proxy(function() {
                $marker.removeClass(this.classes.states.active);
                this.changeMarkerIcon($marker, 'default');
            }, this));
        },

        // Changer marker icon
        // @param $marker: marker element (jQuery object or GMAP object)
        // @param state: define the state of the icon (active or default)
        changeMarkerIcon: function($marker, state) {
            var markerObject = this.markers[$marker.attr('data-id')];
            // Default icon or hover
            var markerIcon = markerObject.iconDefault;
            if (state === 'hover') {
                markerIcon = markerObject.iconHover;
            }
            if (markerIcon != "") {
                markerObject.setIcon(markerIcon);
            }
        },

        // Lock the map so you can't scroll in it
        lockMap: function() {
            this.$mapObj.css('pointer-events', 'none');
            this.bindLockMapEvents();
        },

        // Events binding for the locked map
        // - on click activate the map
        // - on mouse leave desactivate the map
        bindLockMapEvents: function() {
            this.mapWrapper.on('click', $.proxy(function() {
                this.mapWrapper.addClass(this.classes.states.active);
                this.$mapObj.css('pointer-events', 'auto');
            }, this));

            this.mapWrapper.on('mouseleave', $.proxy(function() {
                this.mapWrapper.removeClass(this.classes.states.active);
                this.$mapObj.css('pointer-events', 'none');
            }, this));
        }

    });

    $.fn.map = function(options) {
        return this.each(function() {
            var element = $(this);

            // Return early if this element already has a plugin instance
            if (element.data('map')) return;

            // pass options to plugin constructor
            var map = new Map(this, options);

            // Store plugin object in this element's data
            element.data('map', map);
        });
    };
})(jQuery);
