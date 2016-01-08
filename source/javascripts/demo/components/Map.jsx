var Map = React.createClass({
  componentDidMount: function(argument) {
    var props = this.props;
    var mapId = props.mapId || props.src || 'mapbox.streets';
    var options = {};
    var ownProps = ['mapId', 'onMapCreated'];

    for (var k in props) {
      if (props.hasOwnProperty(k) && ownProps.indexOf(k) === -1) {
        options[k] = props[k];
      }
    }
    
    this.map = L.mapbox.map(ReactDOM.findDOMNode(this), mapId, options);
    this.layer = L.mapbox.featureLayer().addTo(this.map);
    this.geocoder = L.mapbox.geocoder('mapbox.places');

    if (this.props.disableDragAndZoom) {
      this.map.dragging.disable();
      this.map.touchZoom.disable();
      this.map.doubleClickZoom.disable();
      this.map.scrollWheelZoom.disable();
      this.map.keyboard.disable();
    }

    if (this.props.onMapCreated) {
      this.props.onMapCreated(this.map, L);
    }
    
    if (this.props.location) {
      this.setLocation(this.props.location);
    }
    
    if (this.props.destination) {
      this.setDestination(this.props.destination);
    }
  },
  componentWillUpdate: function(nextProps) {
    if (nextProps.location !== this.props.location) {
      this.setLocation(nextProps.location);
    }
    if (nextProps.destination !== this.props.destination) {
      this.setDestination(nextProps.destination);
    }
  },
  setLocation: function(location) {
    var self = this;
    this.geocoder.query(location, function(err, data) {
      if (data.latlng) {
        // coordinates here are in longitude, latitude order because
        // x, y is the standard for GeoJSON and many formats
        self.setState({ locationCoords: [data.latlng[1], data.latlng[0]] });
        _.defer(self.updateMap);
      }
    });
  },
  setDestination: function(destination) {
    var self = this;
    this.geocoder.query(destination, function(err, data) {
      if (data.latlng) {
        // coordinates here are in longitude, latitude order because
        // x, y is the standard for GeoJSON and many formats
        self.setState({ destinationCoords: [data.latlng[1], data.latlng[0]] });
        _.defer(self.updateMap);
      }
    });
  },
  updateMap: function() {
    var features = [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: this.state.locationCoords
        },
        properties: {
          // 'title': 'Here I am!',
          'marker-color': '#ff8888',
          'marker-symbol': 'star'
        }
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: this.state.destinationCoords
        },
        properties: {
          // 'title': 'Here I am!',
          'marker-color': '#ff8888',
          'marker-symbol': 'star'
        }
      },
      {
        type: 'Feature',
        properties: {
          color: '#000'
        },
        geometry: {
          type: 'LineString',
          coordinates: [
            this.state.locationCoords,
            this.state.destinationCoords
          ]
        }
      }
    ];
    
    this.layer.setGeoJSON({
      type: 'FeatureCollection',
      features: features
    });

    this.map.fitBounds(this.layer.getBounds());
  },
  render: function() {
    var mapStyle = {
      width: '100%',
      height: '100%'
    };

    return (
      <div style={mapStyle}></div>
    );
  }
});