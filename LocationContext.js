import React, { createContext, useState, useEffect } from "react";
import * as Location from "expo-location";

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const getLocation = async () => {
      console.log("Demande de permission...");
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== "granted") {
        console.log("Permission refusée");
        setErrorMsg("Permission refusée : Activez la localisation.");
        return;
      }
  
      console.log("Permission accordée. Récupération de la position...");
      let position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
  
      console.log("Position récupérée :", position.coords);
      setLocation(position.coords);
    };
  
    getLocation();
  }, []);
  

  return (
    <LocationContext.Provider value={{ location, errorMsg }}>
      {children}
    </LocationContext.Provider>
  );
};
