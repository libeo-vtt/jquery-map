// Map jQuery Plugin
// A jQuery map plugin to create a map.

(function($) {
    var CustomMap = function(element, options) {
        this.mapWrapper = $(element);
        this.mapObj = null;
        this.map = null;

        // Default module configuration
        this.defaults = {
            key: '',
            locked: false,
            markersSelector: '.marker',
            fitCenterMarkers: true,
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

        // Map
        this.map = null;

        // Merge default classes with window.project.classes
        this.classes = $.extend(true, this.defaults.classes, (window.project ? window.project.classes : {}));

        // Merge default labels with window.project.labels
        this.labels = $.extend(true, this.defaults.labels, (window.project ? window.project.labels : {}));

        // Merge default config with custom config
        this.config = $.extend(true, this.defaults, options || {});

        // HTML Markers
        this.$htmlMarkers = $(this.config.markersSelector);

        // Markers
        this.markers = [];

        // Info windows
        this.infoWindows = [];

        // Public methods
        this.publicMethods = {
            refreshMap: $.proxy(function() {
                this.refreshMap();
            }, this)
        };


        this.init();
    };

    $.extend(CustomMap.prototype, {

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
            var otherParams = 'sensor=false';
            if(this.config.key != '') {
                otherParams = otherParams + '&key=' + this.config.key;
            }
            $.getScript('https://www.google.com/jsapi', $.proxy(function() {
                if (!window.google.maps) {
                    google.load('maps', '3', {
                        other_params: otherParams,
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
            this.mapWrapper.html('<div class="' + this.config.classes.mapInnerWrapper + '"></div>');
            this.$mapObj = this.mapWrapper.find('.' + this.config.classes.mapInnerWrapper);
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

            if (this.$htmlMarkers.length > 0) {
                this.addMarkersHTML();
            }
            if (this.config.fitCenterMarkers === true) {
                this.fitCenterBounds();
            }
            if (this.config.locked === true) {
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
                    this.bounds.extend(marker.position);
                    this.map.fitBounds(this.bounds);
                }
            }, this));
        },

        // Add markers via HTML elements
        addMarkersHTML: function() {
            // Bind events for html markers hover
            this.bindHtmlMarkerEvents(this.$htmlMarkers);

            // Look through each markers and put the HTML data into an object
            // Then call the addMarker function with the marker object
            _.each(this.$htmlMarkers, $.proxy(function(marker) {
                var markerElement = {};
                var $marker = $(marker);

                markerElement.position = new window.google.maps.LatLng($marker.attr('data-lat'), $marker.attr('data-lng'));
                // Set marker icon and (global or for this one only)
                if ($marker.attr('data-icon') != '' && $marker.attr('data-icon') != undefined) {
                    markerElement.icon = $marker.attr('data-icon');
                } else {
                    if (this.mapWrapper.attr('data-icon') != '' && this.mapWrapper.attr('data-icon') != undefined) {
                        markerElement.icon = this.mapWrapper.attr('data-icon');
                    } else {
                        markerElement.icon = '';
                    }
                }
                // Set marker icon hover (global or for this one only)
                if ($marker.attr('data-icon-hover') != '' && $marker.attr('data-icon-hover') != undefined) {
                    markerElement.iconHover = $marker.attr('data-icon-hover');
                } else {
                    if (this.mapWrapper.attr('data-icon-hover') != '' && this.mapWrapper.attr('data-icon-hover') != undefined) {
                        markerElement.iconHover = this.mapWrapper.attr('data-icon-hover');
                    } else {
                        markerElement.iconHover = '';
                    }
                }
                // Set marker width
                if ($marker.attr('data-icon-width') != '' && $marker.attr('data-icon-width') != undefined) {
                    markerElement.iconWidth = parseInt($marker.attr('data-icon-width'));
                } else {
                    if (this.mapWrapper.attr('data-icon-width') != '' && this.mapWrapper.attr('data-icon-width') != undefined) {
                        markerElement.iconWidth = parseInt(this.mapWrapper.attr('data-icon-width'));
                    } else {
                        markerElement.iconWidth = '';
                    }
                }
                // Set marker size
                if ($marker.attr('data-icon-height') != '' && $marker.attr('data-icon-height') != undefined) {
                    markerElement.iconHeight = parseInt($marker.attr('data-icon-height'));
                } else {
                    if (this.mapWrapper.attr('data-icon-height') != '' && this.mapWrapper.attr('data-icon-height') != undefined) {
                        markerElement.iconHeight = parseInt(this.mapWrapper.attr('data-icon-height'));
                    } else {
                        markerElement.iconHeight = '';
                    }
                }
                // Set other data
                markerElement.title = $marker.attr('data-title');
                markerElement.id = $marker.attr('data-id');
                markerElement.infoWindowContent = $marker.find('.marker-popup-content').html();

                this.addMarker(markerElement);

                if (this.$htmlMarkers.length > 1) {
                    this.bounds.extend(markerElement.position);
                    this.map.fitBounds(this.bounds);
                }
            }, this));
        },

        // Add marker on map with it's info window
        // @param marker: object with one marker infos
        addMarker: function(marker) {
            var infoWindow = '';
            var icon = marker.icon;
            var iconHover = marker.iconHover;

            // Set icon with width and height if it's not empty or undefined
            if (marker.iconWidth !== '' && marker.iconWidth !== undefined &&
                marker.iconHeight !== '' && marker.iconHeight !== undefined &&
                marker.icon != '' && marker.icon != undefined &&
                marker.iconHover != '' && marker.iconHover != undefined) {

                icon = {
                    url: marker.icon,
                    scaledSize: new google.maps.Size(marker.iconWidth, marker.iconHeight)
                };
                iconHover = {
                    url: marker.iconHover,
                    scaledSize: new google.maps.Size(marker.iconWidth, marker.iconHeight)
                };
            }

            var markerObj = new window.google.maps.Marker({
                position: marker.position,
                map: this.map,
                icon: icon,
                iconDefault: icon,
                iconHover: iconHover,
                title: marker.title,
                customId: marker.id
            });

            // Add marker to the global array
            this.markers[marker.id] = markerObj;
            // Bind events for the marker
            this.bindMapsMarkerEvents(markerObj);

            //Add the info window if content not empty
            if (marker.infoWindowContent != '' && marker.infoWindowContent != null) {
                infoWindow = new google.maps.InfoWindow({
                    content: marker.infoWindowContent
                });
                this.infoWindows.push(infoWindow);
                this.bindInfoWindowEvent(markerObj, infoWindow);
            }
        },

        // Bind info window on marker
        bindInfoWindowEvent: function(marker, infoWindow) {
            // Marker click event to open info window
            marker.addListener('click', $.proxy(function() {
                // Reset all info windows
                _.each(this.infoWindows, $.proxy(function(infoWindow) {
                    infoWindow.close();
                }, this));
                // Reset all markers
                _.each(this.markers, $.proxy(function(marker) {
                    if (marker != undefined) {
                        this.resetMarker(marker);
                    }
                }, this));
                // Open the infowindow and activate the marker
                infoWindow.open(this.map, marker);
                marker.isClicked = true;
                this.changeMarkerIcon(marker, 'hover');
                $('[data-id="' + marker.customId + '"]').addClass(this.config.classes.states.active);
            }, this));
            // Info window close click
            infoWindow.addListener('closeclick', $.proxy(function() {
                // Reset all markers
                _.each(this.markers, $.proxy(function(marker) {
                    if (marker != undefined) {
                        this.resetMarker(marker);
                    }
                }, this));
            }, this));
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
        // @param $markers: markers html elements
        bindHtmlMarkerEvents: function($markers) {
            $markers.on('mouseenter', $.proxy(function(e) {
                var markerObject = this.markers[$(e.currentTarget).attr('data-id')];
                // Change the icon on hover
                this.changeMarkerIcon(markerObject, 'hover');
            }, this));
            $markers.on('mouseleave', $.proxy(function(e) {
                var markerObject = this.markers[$(e.currentTarget).attr('data-id')];
                // Change the icon on hover
                this.changeMarkerIcon(markerObject, 'default');
            }, this));
        },

        // Event on all google maps markers
        // @param marker: marker element (GMAP Object)
        bindMapsMarkerEvents: function(marker) {
            var $marker = $('[data-id="' + marker.customId + '"]');
            // Add or remove active class on html markers
            google.maps.event.addListener(marker, 'mouseover', $.proxy(function() {
                $marker.addClass(this.classes.states.active);
                this.changeMarkerIcon(marker, 'hover');
            }, this));
            google.maps.event.addListener(marker, 'mouseout', $.proxy(function() {
                if (marker.isClicked !== true) {
                    $marker.removeClass(this.classes.states.active);
                    this.changeMarkerIcon(marker, 'default');
                }
            }, this));
        },

        // Change marker icon
        // @param marker: marker element (GMAP object)
        // @param state: define the state of the icon (active or default)
        changeMarkerIcon: function(marker, state) {
            // Default icon or hover
            var markerIcon = marker.iconDefault;
            if (state === 'hover') {
                markerIcon = marker.iconHover;
            }
            if (markerIcon != '') {
                marker.setIcon(markerIcon);
            }
        },

        // Lock the map (remove scroll)
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
        },

        // Reload map and recenter it
        refreshMap: function() {
            window.google.maps.event.trigger(this.map, 'resize');
            if (this.config.fitCenterMarkers === true) {
                this.fitCenterBounds();
            } else {
                this.map.setCenter(new window.google.maps.LatLng(this.config.lat, this.config.lng));
            }
        },

        // Fit bounds map
        fitCenterBounds: function() {
            var bounds = new google.maps.LatLngBounds();
            _.each(this.markers, $.proxy(function(marker) {
                if (marker != undefined) {
                    bounds.extend(marker.getPosition());
                }
            }, this));
            this.map.fitBounds(bounds);
        },

        // Reset marker to default state
        // @param marker: marker (GMAP object)
        resetMarker: function(marker) {
            marker.isClicked = false;
            this.changeMarkerIcon(marker, 'default');
            $('[data-id="' + marker.customId + '"]').removeClass(this.config.classes.states.active);
        }

    });

    $.fn.customMap = function(options) {
        this.each($.proxy(function(index, element) {
            var $element = $(element);

            // Return early if this $element already has a plugin instance
            if ($element.data('custom-map')) return;

            // Pass options to plugin constructor
            var map = new CustomMap(element, options);

            // Add every public methods to plugin
            for (var key in map.publicMethods) {
                this[key] = map.publicMethods[key];
            }

            // Store plugin object in this $element's data
            $element.data('custom-map', map);
        }, this));

        return this;
    };
})(jQuery);
