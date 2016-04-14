// Map jQuery Plugin
// A jQuery map plugin to create a map.

(function($) {
    var Map = function(element, options) {
        this.mapWrapper = $(element);
        this.mapObj = null;
        this.map = null;

        this.config = $.extend({
            locked: false,
            htmlMarkers: false,
            hideHtmlMarkers: true,
            lat: 0,
            lng: 0,
            zoom: 0,
            styles: [],
            markers: [],
            customGlobalClasses: {}
        }, options || {});

        this.classes = $.extend({
            active: 'is-active',
            open: 'is-open',
            hover: 'is-hover',
            clicked: 'is-clicked',
            extern: 'is-external',
            error: 'is-error'
        }, (window.classes !== undefined ? window.classes : this.config.customGlobalClasses) || {});

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
            this.mapWrapper.append('<div class="map-inner-wrapper"></div>');
            this.$mapObj = this.mapWrapper.find(".map-inner-wrapper");
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
            var $markersWrapper = this.mapWrapper.find(".markers");
            var lenght = this.mapWrapper.find(".markers > .marker").length;
            var $markers = this.mapWrapper.find(".marker");

            // Hide HTML markers if config is set to true
            if (this.config.hideHtmlMarkers == true) {
                $markersWrapper.hide();
            }

            // Look through each markers and put the HTML data into an array
            // Then call the addMarker function with the marker array
            _.each($markers, $.proxy(function(marker) {
                var markerElement = [];
                markerElement.position = new window.google.maps.LatLng($(marker).attr("data-lat"), $(marker).attr("data-lng"));
                markerElement.icon = $(marker).attr("data-icon");
                markerElement.title = $(marker).attr("data-title");
                markerElement.infoWindowContent = $(marker).html();

                this.addMarker(markerElement);

                if (length > 1) {
                    this.bounds.extend(position);
                    this.map.fitBounds(this.bounds);
                }
            }, this));
        },

        // Add marker on map with it's info window
        // @param marker: array with one marker infos
        addMarker: function(marker) {
            var infoWindow = "";

            var markerObj = new window.google.maps.Marker({
                position: marker.position,
                map: this.map,
                icon: marker.icon,
                title: marker.title
            });

            //Add the info window if content not empty
            if (marker.infoWindowContent != "" && marker.infoWindowContent != null) {
                infoWindow = new google.maps.InfoWindow({
                    content: marker.infoWindowContent,
                });
                this.addInfoWindow(markerObj, infoWindow);
            }
        },

        // Bind info window on marker
        addInfoWindow: function(marker, infoWindow) {
            marker.addListener('click', function() {
                infoWindow.open(this.map, marker);
            });
        },

        // Lock the map so you can't scroll in it
        lockMap: function() {
            this.$mapObj.css('pointer-events', 'none');
            this.bindLockMapEvents();
        },

        // Events binding on the map
        bindMapEvents: function() {
            window.google.maps.event.addDomListener(window, 'resize', $.proxy(function() {
                var center = this.map.getCenter();
                window.google.maps.event.trigger(this.map, 'resize');
                this.map.setCenter(center);
            }, this));
        },

        // Events binding for the locked map
        // - on click activate the map
        // - on mouse leave desactivate the map
        bindLockMapEvents: function() {
            this.mapWrapper.on('click', $.proxy(function() {
                this.mapWrapper.addClass('is-active');
                this.$mapObj.css('pointer-events', 'auto');
            }, this));

            this.mapWrapper.on('mouseleave', $.proxy(function() {
                this.mapWrapper.removeClass('is-active');
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
