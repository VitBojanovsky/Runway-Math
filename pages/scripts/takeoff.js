async function loadAircraftData(aircraft) {
  const response = await fetch(`../data/${aircraft}.json`);
  if (!response.ok) {
    throw new Error("Failed to load aircraft data");
    alert("Aircraft data could not be loaded.");
  }
  return await response.json();
}   
/*
async function calculatePressureAltitude(pressure, temperature, altitude) {
    const standardPressure = 1013.25;  // Standard atmospheric pressure in hPa
    const pressureAltitude = altitude + (standardPressure - pressure) * 30; // in feet
    return pressureAltitude;
}
    */
  
async function calculatePressureAltitude(pressureHpa, fieldElevationFt) {
  const standardPressure = 1013.25; // hPa
  return fieldElevationFt + (standardPressure - pressureHpa) * 27;
}

async function calculateVSpeeds({
  weightLb,
  densityAltFt,
  REF
}) {
  const weightRatio = weightLb / REF.weightLb;
  const densityFactor = Math.sqrt(densityCorrection(densityAltFt, REF));

  const vr = REF.vrKt * Math.sqrt(weightRatio) * densityFactor;
  const v1 = vr; 
  const v2 = vr * 1.2;

  return {
    V1: v1,
    VR: vr,
    V2: v2
  };
}

async function weightCorrection(weightLb, REF) {
  const ratio = weightLb / REF.weightLb;
  return 0.8 + 0.4 * ratio; 
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

async function densityCorrection(densityAltFt, REF) {
  const rho = airDensity(densityAltFt, REF);
  const ratio = REF.seaLevelDensity / rho;
  return Math.pow(ratio, 0.9); 
}


async function calculateDensityAltitude(pressureAltFt, temperatureC) {
  const ISA_TEMP_SEA_LEVEL = 15; // °C
  const tempAtAlt = ISA_TEMP_SEA_LEVEL - (pressureAltFt / 1000) * 2;
  const isaDeviation = temperatureC - tempAtAlt;
  return pressureAltFt + (120 * isaDeviation);
}


async function airDensity(densityAltFt, REF) {
  return REF.seaLevelDensity *
    Math.pow(1 - 6.875e-6 * densityAltFt, 4.256);
}


async function densityCorrection(densityAltFt, REF) {
  const rho = await airDensity(densityAltFt, REF);
  const ratio = REF.seaLevelDensity / rho;
  return Math.pow(ratio, 0.9); 
}


async function windCorrection(windKt, REF) {
  const headwind = windKt; 
  const v = REF.liftoffSpeedKt;

  const effectiveSpeed = Math.max(v - headwind, v * 0.6);
  return Math.pow(v / effectiveSpeed, 2);
}

async function calculateObstacleDistance({
  groundRollFt,
  weightLb,
  densityAltFt,
  REF
}) {
  const climbPenalty =
    weightLb / REF.weightLb *
    densityCorrection(densityAltFt, REF);

  const climbSegmentFt = REF.climbTo50FtBase * climbPenalty;
  return groundRollFt + climbSegmentFt;
}

function calculateVSpeeds({
  weightLb,
  densityAltFt,
  REF
}) {
  const weightRatio = weightLb / REF.weightLb;
  const densityFactor = Math.sqrt(densityCorrection(densityAltFt, REF));

  const vr = REF.vrKt * Math.sqrt(weightRatio) * densityFactor;
  const v1 = vr; 
  const v2 = vr * 1.2;

  return {
    V1: v1,
    VR: vr,
    V2: v2
  };
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
  densityAltFt,
  windKt,
  flapsDeg,
  runwaySurface,
  REF
}) {
  return REF.groundRollFt
    * await weightCorrection(weightLb, REF)
    * await densityCorrection(densityAltFt, REF)
    * await windCorrection(windKt, REF)
    * await flapCorrection(flapsDeg)
    * await surfaceCorrection(runwaySurface);
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

        if(payload > data.weights.maximumUsefulLoadLb.cessna152) {
            alert("Payload exceeds maximum useful load!");
            return;
            console.log("Payload exceeds maximum useful load! by " + (payload - data.weights.maximumUsefulLoadLb.cessna152) + " lbs");
            console.log(`Maximum Useful Load: ${data.weights.maximumUsefulLoadLb.cessna152} lbs`);
        }

        if(fuelLoad > data.fuelAndOil.fuelCapacityGal) {
            alert("Fuel load exceeds maximum fuel capacity!");
            return;
            console.log("Fuel load exceeds maximum fuel capacity! by " + (fuelLoad - data.fuelAndOil.fuelCapacityGal) + " lbs");
            console.log(`Fuel Capacity: ${data.fuelAndOil.fuelCapacityGal} lbs`);
        }

        const REF = {
            weightLb: data.weights.maximum.takeoffLandingLb,
            groundRollFt: data.takeoffPerformance.groundRollFt,
            liftoffSpeedKt: data.stallSpeedsCAS.flapsDownPowerOff,
            seaLevelDensity: 1.225,
            climbTo50FtBase: data.takeoffPerformance.distanceOver50FtObstacleFt


        }



        const windCorrectionValue = await windCorrection(wind, REF);
        const surfaceCorrectionValue = await surfaceCorrection(runwaySurface);

        const pressureAltitude = await calculatePressureAltitude(pressure, altitude);
        console.log(`Pressure Altitude: ${pressureAltitude} ft`);
        const airdensityValue = await calculateDensityAltitude(pressureAltitude, temperature);
        densityAltitude = airdensityValue;
        const densityCorrectionValue = await densityCorrection(pressureAltitude, REF);

        const aircraft_empty_weight = data.weights.standardEmptyWeightLb.cessna152;
        const aircraft_weight = aircraft_empty_weight + fuelLoad + payload;
        console.log(`Aircraft Weight: ${aircraft_weight} lbs`);
        const weightCorrectionValue = await weightCorrection(aircraft_weight, REF);

        if(aircraft_weight > data.weights.maximum.takeoffLandingLb) {
            alert("Aircraft weight exceeds maximum takeoff weight!");
            return;
            console.log("Aircraft weight exceeds maximum takeoff weight! by " + (aircraft_weight - data.weights.maximum.takeoffLandingLb) + " lbs");
            console.log(`Max Takeoff Weight: ${data.weights.maximum.takeoffLandingLb} lbs`);
        }



        const flapsValue = await aproximate_flaps_setting(flapsSetting);
        console.log(`Flaps Setting: ${flapsValue} degrees`);
        const flapCorrectionValue = await flapCorrection(flapsValue);


        const aircraft_max_takeoff_weight = data.weights.maximum.takeoffLandingLb;
        const aircraft_takeoff_performance = data.takeoffPerformance;

        const takeoffGroundRoll = await calculateTakeoffGroundRoll({
            weightLb: aircraft_weight,
            densityAltFt: densityAltitude,
            windKt: wind,
            flapsDeg: flapsValue,
            runwaySurface: runwaySurface
          , REF: REF
        });

        const obstacleClearanceRatio = data.takeoffPerformance.distanceOver50FtObstacleFt / data.takeoffPerformance.groundRollFt;
        const obstacleClearence = takeoffGroundRoll * obstacleClearanceRatio;
        console.log(`Takeoff Ground Roll: ${takeoffGroundRoll.toFixed(2)} ft`);

        document.getElementById('result').innerHTML = `
            <h2>Takeoff Performance Results</h2>
            <p><strong>Takeoff Ground Roll:</strong> ${takeoffGroundRoll.toFixed(2)} ft</p>
            <p><strong>Distance to Clear 50 ft Obstacle:</strong> ${obstacleClearence.toFixed(2)} ft</p>
        `;





    });


