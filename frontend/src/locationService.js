// Location service for handling geolocation and address details

// Function to get user's coordinates
export const getUserCoordinates = () => {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coordinates = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    resolve(coordinates);
                },
                (error) => {
                    reject(new Error('Error fetching location: ' + error.message));
                }
            );
        } else {
            reject(new Error("Geolocation is not supported by this browser."));
        }
    });
};

// Function to fetch address details using Nominatim API
export const fetchAddressDetails = async (lat, lon) => {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18`;
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'MonumentIdentificationApp/1.0'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch address details');
        }

        const data = await response.json();
        
        return {
            country: data.address.country || '',
            state: data.address.state || data.address.province || data.address.region || '',
            displayName: data.display_name || '',
            latitude: lat,
            longitude: lon
        };
    } catch (error) {
        throw new Error('Error fetching address details: ' + error.message);
    }
}; 





// these are the fields in the response from the nominatim api
// and i am accessing the following fields COUNTRY, STATE, CITY, DISPLAY_NAME
// {
//     "place_id": 230160805,
//     "licence": "Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright",
//     "osm_type": "way",
//     "osm_id": 420732822,
//     "lat": "17.438038943866758",
//     "lon": "78.54039990142756",
//     "category": "highway",
//     "type": "residential",
//     "place_rank": 26,
//     "importance": 0.0534016960402838,
//     "addresstype": "road",
//     "name": "",
//     "display_name": "Indira Nagar, Marredpally mandal, Greater Hyderabad Municipal Corporation North Zone, Hyderabad, Telangana, 500017, India",
//     "address": {
//       "neighbourhood": "Indira Nagar",
//       "suburb": "Marredpally mandal",
//       "city_district": "Greater Hyderabad Municipal Corporation North Zone",
//       "city": "Hyderabad",
//       "state_district": "Hyderabad",
//       "state": "Telangana",
//       "ISO3166-2-lvl4": "IN-TS",
//       "postcode": "500017",
//       "country": "India",
//       "country_code": "in"
//     },
    
//     "boundingbox": [
//       "17.4379645",
//       "17.4380404",
//       "78.5402403",
//       "78.5405868"
//     ]
// }