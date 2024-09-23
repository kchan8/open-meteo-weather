export interface OptionType {
  value: string;
  label: string;
}

export const weatherVariables: OptionType[] = [
  { value: 'temperature_2m', label: 'Temperature' },
  { value: 'relative_humidity_2m', label: 'Rel. Humidity' },
  { value: 'weather_code', label: 'Weather Code' },
  { value: 'dew_point_2m', label: 'Dew Point' },
  { value: 'rain', label: 'Rain' },
];
