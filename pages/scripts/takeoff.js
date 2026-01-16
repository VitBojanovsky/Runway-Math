async function loadAircraftData(aircraft) {
  const response = await fetch(`./data/${aircraft}_specifications.json`);
  if (!response.ok) {
    throw new Error("Failed to load aircraft data");
    alert("Aircraft data could not be loaded.");
  }
  return await response.json();
}

async function calculatePressureAltitude(pressure, temperature, altitude) {
    const standardPressure = 1013.25;  // Standard atmospheric pressure in hPa
    const pressureAltitude = altitude + (standardPressure - pressure) * 30; // in feet
    return pressureAltitude;
}

async function aproximate_flaps_setting(flapsSetting) {
    let flapsValue = 0;
    if(flapsSetting === undefined) {
        return flapsValue;
    }
    if(flapsSetting === null) {
        return flapsValue;
    }
    if(flapsSetting === '') {
        return flapsValue;
    }
    if(flapsettings<0) {
        return flapsSetting*-1;
    }
    if(isNaN(flapsSetting)) {
        return flapsValue;
    }
    if(flapsSetting > 30) {
        return 30;
    }
    switch(flapsSetting) {
        case 'up':
            flapsValue = 0;
            break;
        case '10':
            flapsValue = 10;
            break;
        case '20':
            flapsValue = 20;
            break;
        case '30':
            flapsValue = 30;
            break;
        default:
            flapsValue = 0;
    }
    return flapsValue;
}



document.getElementById('takeoff-form').addEventListener('submit', async (event) => {
        event.preventDefault();

        // Get input values from the form
        const aircraft = document.getElementById('aircraft').value;
        const pressure = parseFloat(document.getElementById('pressure').value);
        const temperature = parseFloat(document.getElementById('temperature').value);
        const altitude = parseFloat(document.getElementById('altitude').value);
        const wind = parseFloat(document.getElementById('wind').value);
        const runwaySurface = document.getElementById('runway-surface').value;
        const fuelLoad = parseFloat(document.getElementById('fuel').value);
        const flapsSetting = document.getElementById('flaps').value;
        const payload = parseFloat(document.getElementById('payload').value);

        //get data from data/plane
        const data = await loadAircraftData(aircraft);
        console.log(data.takeoffPerformance);

        // Calculate pressure altitude
        const pressureAltitude = await calculatePressureAltitude(pressure, temperature, altitude);
        console.log(`Pressure Altitude: ${pressureAltitude} ft`);

        const aircraft_empty_weight = data.emptyWeight;
        const aircraft_weight = aircraft_empty_weight + fuelLoad + payload;
        console.log(`Aircraft Weight: ${aircraft_full_weight} lbs`);

        //check if aiircraft weight is over max takeoff weight
        if(aircraft_weight > data.maxTakeoffWeight) {
            alert("Aircraft weight exceeds maximum takeoff weight!");
            return;
            console.log("Aircraft weight exceeds maximum takeoff weight! by " + (aircraft_weight - data.maxTakeoffWeight) + " lbs");
            console.log(`Max Takeoff Weight: ${data.maxTakeoffWeight} lbs`);
        }

        if(aircraft_weight < data.minTakeoffWeight) {
            alert("Aircraft weight is below minimum takeoff weight!");
            return;
            console.log("Aircraft weight is below minimum takeoff weight! by " + (data.minTakeoffWeight - aircraft_weight) + " lbs");
            console.log(`Min Takeoff Weight: ${data.minTakeoffWeight} lbs`);
        }

        //aproximate flaps setting
        const flapsValue = await aproximate_flaps_setting(flapsSetting);
        console.log(`Flaps Setting: ${flapsValue} degrees`);

        



        const aircraft_max_takeoff_weight = data.maxTakeoffWeight;
        const aircraft_takeoff_performance = data.takeoffPerformance;

        




    });


