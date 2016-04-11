// extrapolates totals from data that has been aquired from vector tiles at
// zoom levels lower then maxZoom where some a sub-sample of all features is
// present for performance reasons

const calibrationData = {
  buildings: [
    1.000E0,
    1.005E0,
    1.015E0,
    1.148E0,
    2.754E0,
    9.957E0,
    3.868E1,
    1.622E2,
    6.488E2,
    2.595E3,
    1.038E4,
    4.152E4,
    1.661E6,
    6.644E6,
    2.657E6
  ].reverse(),
  highways: 1.4 // todo
}

export default function getExtrapolationFactor(mode, requestZoom) {
  const calibration = calibrationData[mode]
  if (calibration.length) {
    return calibration[requestZoom] // todo: this doesn't seem to fit every region :/ check
  } else {
    return Math.pow(1.4, 14-requestZoom)
    // todo: how to account for line simplification of roads affecting their length?
  }
}
