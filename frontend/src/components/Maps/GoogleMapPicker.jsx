import { useEffect, useState, useRef } from 'react';
import { Box, Text, Paper, Button, Group } from '@mantine/core';
import { useJsApiLoader, GoogleMap, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px'
};

// Default center (Galle, Sri Lanka)
const defaultCenter = {
  lat: 6.0535,
  lng: 80.2210
};

// Custom map styles for dark theme
const mapStyles = [
  {
    elementType: "geometry",
    stylers: [{ color: "#242f3e" }]
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#242f3e" }]
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#ffffff" }]
  },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }]
  },
  {
    featureType: "administrative",
    elementType: "labels.text.fill",
    stylers: [{ color: "#ffffff" }]
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#ffffff" }]
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }]
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#ffffff" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }]
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }]
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#ffffff" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }]
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#ffffff" }]
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }]
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#ffffff" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }]
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#ffffff" }]
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }]
  }
];

function GoogleMapPicker({ onLocationSelect, initialCoordinates }) {
  const mapRef = useRef(null);
  const [center, setCenter] = useState(initialCoordinates || defaultCenter);
  const [markerPosition, setMarkerPosition] = useState(initialCoordinates || defaultCenter);
  const [address, setAddress] = useState('');

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  useEffect(() => {
    if (initialCoordinates) {
      setCenter(initialCoordinates);
      setMarkerPosition(initialCoordinates);
      reverseGeocode(initialCoordinates);
    }
  }, [initialCoordinates]);

  const onMapLoad = (map) => {
    mapRef.current = map;
  };

  const onMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setMarkerPosition({ lat, lng });
    reverseGeocode({ lat, lng });
  };

  const reverseGeocode = async (coords) => {
    try {
      if (!window.google) return;
      
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: coords }, (results, status) => {
        if (status === 'OK' && results[0]) {
          setAddress(results[0].formatted_address);
        } else {
          setAddress('Address not found');
        }
      });
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      setAddress('Error getting address');
    }
  };

  const confirmLocation = () => {
    onLocationSelect(markerPosition, address);
  };

  const searchByAddress = (address) => {
    if (!window.google) return;
    
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        const newCoords = {
          lat: location.lat(),
          lng: location.lng()
        };
        
        setCenter(newCoords);
        setMarkerPosition(newCoords);
        setAddress(results[0].formatted_address);
        
        if (mapRef.current) {
          mapRef.current.panTo(newCoords);
        }
      }
    });
  };

  return (
    <Box>
      <Text size="sm" weight={500} mb="xs" style={{ color: 'white' }}>
        Click on the map to set your restaurant location or search by address
      </Text>
      
      {isLoaded ? (
        <>
          <Paper 
            shadow="xs" 
            p="md" 
            mb="md"
            style={{
              backgroundColor: 'rgba(20, 30, 50, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              overflow: 'hidden'
            }}
          >
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={15}
              onClick={onMapClick}
              onLoad={onMapLoad}
              options={{
                styles: mapStyles,
                mapTypeControl: false,
                streetViewControl: true,
                fullscreenControl: true,
                zoomControl: true,
                backgroundColor: '#1a2a41'
              }}
            >
              {/* Main marker */}
              <Marker 
                position={markerPosition}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  fillColor: '#d1ae36',
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 2,
                  scale: 10,
                }}
                animation={window.google.maps.Animation.DROP}
              />
              
              {/* Location pulse effect */}
              <Marker 
                position={markerPosition}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 25,
                  fillColor: '#d1ae36',
                  fillOpacity: 0.2,
                  strokeColor: '#d1ae36',
                  strokeWeight: 1,
                  strokeOpacity: 0.8,
                }}
              />
            </GoogleMap>
          </Paper>
          
          <Text size="sm" mb="sm" style={{ color: 'white' }}>
            Selected Address: {address || 'No address selected'}
          </Text>
          
          <Group position="right">
            <Button 
              onClick={confirmLocation}
              disabled={!markerPosition}
              style={{
                backgroundColor: '#d1ae36',
                color: '#1a2a41',
                '&:hover': {
                  backgroundColor: 'rgba(209, 174, 54, 0.9)'
                }
              }}
            >
              Confirm Location
            </Button>
          </Group>
        </>
      ) : (
        <Text style={{ color: 'white' }}>Loading map...</Text>
      )}
    </Box>
  );
}

export default GoogleMapPicker;