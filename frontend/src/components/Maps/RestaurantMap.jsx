import { useEffect, useState } from 'react';
import { Box, Text, Paper, Group } from '@mantine/core';
import { useJsApiLoader, GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import styles from './RestaurantMap.module.css';
import { IconMapPin } from '@tabler/icons-react';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px',
};

// Default center (Matara, Sri Lanka)
const defaultCenter = {
  lat: 5.9549,
  lng: 80.5550
};

// Custom map styles for dark theme
const mapStyles = [
  {
    elementType: "geometry",
    stylers: [
      { color: "#242f3e" }
    ]
  },
  {
    elementType: "labels.text.stroke",
    stylers: [
      { color: "#242f3e" }
    ]
  },
  {
    elementType: "labels.text.fill",
    stylers: [
      { color: "#ffffff" }
    ]
  },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [
      { color: "#ffffff" }
    ]
  },
  {
    featureType: "administrative",
    elementType: "labels.text.fill",
    stylers: [
      { color: "#ffffff" }
    ]
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [
      { color: "#ffffff" }
    ]
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [
      { color: "#263c3f" }
    ]
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [
      { color: "#ffffff" }
    ]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [
      { color: "#38414e" }
    ]
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [
      { color: "#212a37" }
    ]
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [
      { color: "#ffffff" }
    ]
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [
      { color: "#746855" }
    ]
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [
      { color: "#1f2835" }
    ]
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [
      { color: "#ffffff" }
    ]
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [
      { color: "#2f3948" }
    ]
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [
      { color: "#ffffff" }
    ]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [
      { color: "#17263c" }
    ]
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [
      { color: "#ffffff" }
    ]
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [
      { color: "#17263c" }
    ]
  }
];

function RestaurantMap({ coordinates, name, address }) {
  const [selectedMarker, setSelectedMarker] = useState(true);
  const [center, setCenter] = useState(null);
  const [hasValidCoordinates, setHasValidCoordinates] = useState(false);
  const [map, setMap] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  useEffect(() => {
    // Parse coordinates if they're strings
    let lat = typeof coordinates?.lat === 'string' ? parseFloat(coordinates.lat) : coordinates?.lat;
    let lng = typeof coordinates?.lng === 'string' ? parseFloat(coordinates.lng) : coordinates?.lng;

    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      const validCoords = {
        lat: lat,
        lng: lng
      };
      setHasValidCoordinates(true);
      setCenter(validCoords);
    } else {
      // Try to geocode the address if coordinates are not valid
      if (isLoaded && window.google && address) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: address }, (results, status) => {
          if (status === 'OK' && results[0]?.geometry?.location) {
            const location = results[0].geometry.location;
            setCenter({
              lat: location.lat(),
              lng: location.lng()
            });
            setHasValidCoordinates(true);
          } else {
            setCenter(defaultCenter);
            setHasValidCoordinates(false);
          }
        });
      } else {
        setCenter(defaultCenter);
        setHasValidCoordinates(false);
      }
    }
  }, [coordinates, address, isLoaded]);

  const onLoad = (map) => {
    setMap(map);
  };

  const onUnmount = () => {
    setMap(null);
  };

  return (
    <Box>
      <Group position="apart" mb="md">
        <Text size="xl" weight={500} color="white" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IconMapPin size={24} color="#d1ae36" />
          Location Details
        </Text>
      </Group>
      
      {isLoaded && center ? (
        <Paper 
          shadow="md" 
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
            options={{
              styles: mapStyles,
              mapTypeControl: false,
              streetViewControl: true,
              fullscreenControl: true,
              zoomControl: true,
              backgroundColor: '#1a2a41'
            }}
            onLoad={onLoad}
            onUnmount={onUnmount}
          >
            {hasValidCoordinates && (
              <>
                {/* Main restaurant marker */}
                <Marker 
                  position={center}
                  onClick={() => setSelectedMarker(true)}
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
                  position={center}
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
              </>
            )}
            
            {hasValidCoordinates && selectedMarker && (
              <InfoWindow
                position={center}
                onCloseClick={() => setSelectedMarker(false)}
                options={{
                  pixelOffset: new window.google.maps.Size(0, -30)
                }}
              >
                <div className={styles.infoWindow}>
                  <div className={styles.infoWindowTitle}>{name}</div>
                  <div className={styles.infoWindowAddress}>{address}</div>
                  <a 
                    className={styles.directionsLink}
                    href={`https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Get Directions
                  </a>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
          
          {!hasValidCoordinates && (
            <Box p="md">
              <Text color="white" size="sm" italic style={{ textAlign: 'center' }}>
                Showing approximate location for {address || name}.
                The exact coordinates will be updated soon.
              </Text>
            </Box>
          )}
        </Paper>
      ) : (
        <Text color="white">Loading map...</Text>
      )}
    </Box>
  );
}

export default RestaurantMap; 