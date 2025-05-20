import {Image, SafeAreaView, View, StyleSheet} from 'react-native';
import { useEffect, useState, useRef } from 'react';
import MapView, { Marker } from 'react-native-maps';
import {
  requestForegroundPermissionsAsync,
  getCurrentPositionAsync,
  LocationObject,
  watchPositionAsync,
  LocationAccuracy
} from 'expo-location';


const Mapa = () => {
  const [location, setLocation] = useState<LocationObject | null>(null);

  const mapRef = useRef<MapView>(null);

  async function requestLocationPermissions (){
    const { granted } = await requestForegroundPermissionsAsync();

    if(granted){
      const currentPosition = await getCurrentPositionAsync();
      setLocation(currentPosition);
    }
  }

  useEffect(() => {
    requestLocationPermissions();
  }, []);

  useEffect(() => {
    watchPositionAsync({
      accuracy: LocationAccuracy.Highest,
      timeInterval: 1000,
      distanceInterval: 1
    }, (response) => {
        console.log("NOVA LOZALIZAÇÃO! =>", response);
        setLocation(response);
        mapRef.current?.animateCamera({
          pitch: 30,
          center: response.coords
        })
    });   
  }, []);

  return (
    <SafeAreaView style={styles.container}> 
      <View style={styles.header}>
      </View>

      <View style={styles.body}>
        {
          location && 
            <MapView 
              ref={mapRef}
              style={styles.map}
              initialRegion={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005
              }}
            >
              <Marker 
                coordinate={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                }}
              >
                <Image
                  source={require('../assets/canguru.png')}
                  style={styles.markerImage}
                  resizeMode="contain"
                />
              </Marker>
            </MapView>
        }
      </View>

      <View style={styles.footer}>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    map: {
        flex: 1, 
        width: '100%',
    },
    markerImage: {
      width: 50,
      height: 50,
      borderRadius: 25,
    },
    header: {
      height: '15%',
      backgroundColor: '#BEACDE',
      alignItems: 'center',
      justifyContent: 'center',
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
    },
    body: {
      flex: 1,
      backgroundColor: '#fff',
    },
    footer: {
      height: '10%',
      backgroundColor: '#BEACDE',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
    },
    logo: {
      width: '80%',
    }
});

export default Mapa;