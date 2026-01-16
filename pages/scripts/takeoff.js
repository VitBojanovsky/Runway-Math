async function loadAircraftData(aircraft) {
  const response = await fetch(`./data/${aircraft}.json`);
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
    if(flapsSetting<0) {
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

async function weightCorrection(weightLb, REF) {
  return Math.pow(weightLb / REF.weightLb, 2);
}


async function airDensity(pressureAltFt) {
  return REF.seaLevelDensity *
    Math.pow(1 - 6.875e-6 * pressureAltFt, 4.256);
}

async function densityCorrection(pressureAltFt) {
  return REF.seaLevelDensity / airDensity(pressureAltFt);
}

async function windCorrection(windKt) {
  const ratio = windKt / REF.liftoffSpeedKt;
  return Math.max(0.7, 1 / (1 - ratio));
}

async function flapCorrection(flapsDeg) {
  if (flapsDeg <= 0) return 1.0;
  else if (flapsDeg <= 10) return 0.9;
  else if (flapsDeg <= 20) return 0.95;
  else if (flapsDeg <= 30) return 1.1;
  else {
    return 1.0;
    console.log("Flaps setting are fucked, using default correction factor of 1.0");
  }
}

async function surfaceCorrection(surface) {
  switch (surface) {
    case "DRY":
      return 1.0;
    case "WET":
      return 1.15;
    case "GRASS":
      return 1.3;
    case "SOFT":
      return 1.5;
    default:
      return 1.0;
        console.log("Runway surface type is unknown, using default correction factor of 1.0");
        console.log("Surface type: " + surface);
        console.log("something is fucked");
  }
}

async function calculateTakeoffGroundRoll({
  weightLb,
  pressureAltFt,
  windKt,
  flapsDeg,
  runwaySurface
}) {
  return REF.groundRollFt
    * weightCorrection(weightLb)
    * densityCorrection(pressureAltFt)
    * windCorrection(windKt)
    * flapCorrection(flapsDeg)
    * surfaceCorrection(runwaySurface);
}






document.getElementById('takeoff-form').addEventListener('submit', async (event) => {
        event.preventDefault();


        const aircraft = document.getElementById('aircraft').value;
        const pressure = parseFloat(document.getElementById('pressure').value);
        const temperature = parseFloat(document.getElementById('temperature').value);
        const altitude = parseFloat(document.getElementById('altitude').value);
        const wind = parseFloat(document.getElementById('wind').value);
        const runwaySurface = document.getElementById('runway-surface').value;
        const fuelLoad = parseFloat(document.getElementById('fuel').value);
        const flapsSetting = document.getElementById('flaps').value;
        const payload = parseFloat(document.getElementById('payload').value);


        const data = await loadAircraftData(aircraft);
        console.log(data.takeoffPerformance);

        if(emptyWeight> data.maximumUsefulLoadLb) {
            alert("Payload exceeds maximum useful load!");
            return;
            console.log("Payload exceeds maximum useful load! by " + (emptyWeight - data.maximumUsefulLoadLb) + " lbs");
            console.log(`Maximum Useful Load: ${data.maximumUsefulLoadLb} lbs`);
        }

        if(fuelLoad > data.fuelAndOil.fuelCapacityGal) {
            alert("Fuel load exceeds maximum fuel capacity!");
            return;
            console.log("Fuel load exceeds maximum fuel capacity! by " + (fuelLoad - data.fuelAndOil.fuelCapacityGal) + " lbs");
            console.log(`Fuel Capacity: ${data.fuelAndOil.fuelCapacityGal} lbs`);
        }

        const REF = {
            weightLb: data.takeoffPerformance.reference.weightLb,
            groundrollFt: data.takeoffPerformance.reference.groundrollFt,
            liftoffspeedKt: data.takeoffPerformance.reference.liftoffspeedKt,
            seaLeveldensity: 1.225
        }


        const weightCorrectionValue = await weightCorrection(aircraft_weight, REF);
        const airdensityValue = await airDensity(pressureAltitude);
        const densityCorrectionValue = await densityCorrection(pressureAltitude);
        const windCorrectionValue = await windCorrection(wind);
        const flapCorrectionValue = await flapCorrection(flapsValue);
        const surfaceCorrectionValue = await surfaceCorrection(runwaySurface);

        const pressureAltitude = await calculatePressureAltitude(pressure, temperature, altitude);
        console.log(`Pressure Altitude: ${pressureAltitude} ft`);

        const aircraft_empty_weight = data.emptyWeight;
        const aircraft_weight = aircraft_empty_weight + fuelLoad + payload;
        console.log(`Aircraft Weight: ${aircraft_weight} lbs`);


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



        const flapsValue = await aproximate_flaps_setting(flapsSetting);
        console.log(`Flaps Setting: ${flapsValue} degrees`);


        const aircraft_max_takeoff_weight = data.maxTakeoffWeight;
        const aircraft_takeoff_performance = data.takeoffPerformance;

        const takeoffGroundRoll = await calculateTakeoffGroundRoll({
            weightLb: aircraft_weight,
            pressureAltFt: pressureAltitude,
            windKt: wind,
            flapsDeg: flapsValue,
            runwaySurface: runwaySurface
        });

        const obstacleClearence = takeoffGroundRoll * data.poh.takeoffPerformance.obstacleClearanceFactorRatio;
        console.log(`Takeoff Ground Roll: ${takeoffGroundRoll.toFixed(2)} ft`);

        




    });


