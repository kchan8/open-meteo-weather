import { FormEvent, useState, useEffect } from 'react';

interface OptionType {
  value: string;
  label: string;
}

type Row = {
  time: string;
  temperature: number;
  humidity: number;
  code: number;
};

const WeatherQuery1 = () => {
  const weatherVariables: OptionType[] = [
    { value: 'temperature_2m', label: 'Temperature' },
    { value: 'humidity_2m', label: 'Humidity' },
    { value: 'weather_code', label: 'Weather Code' },
  ];

  // const [headerContent, setHeaderContent] = useState<Row[]>();
  const [resultContent, setResultContent] = useState<Row[]>();

  const locStyle = 'text-lg border w-24 mx-4 p-1';
  const dateStyle = 'text-lg border w-36 mx-4 p-1';
  const headerStyle =
    'sticky top-0 border border-gray-300 px-4 py-2 bg-gray-200';
  const rowStyle = 'text-center border border-gray-300 px-4 py-1';

  // State to track selected options
  const [selectedOptions, setSelectedOptions] = useState([]);


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const latitude = formData.get('latitude');
    const longitude = formData.get('longitude');
    const startdate = formData.get('startdate');
    const enddate = formData.get('enddate');

    let prompt = process.env.NEXT_PUBLIC_WEATHER_BASE_URL;
    prompt = `${prompt}?latitude=${latitude}&longitude=${longitude}&start_date=${startdate}&end_date=${enddate}`;
    prompt +=
      '&hourly=temperature_2m,relative_humidity_2m,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FLos_Angeles';
    console.log(prompt);

    try {
      const response = await fetch(prompt);
      const data = await response.json();
      // const headers = data.hourly_units;
      const records = data.hourly;
      console.log(records);
      //   const headerFields = Object.keys(data.hourly_units);
      const tableBody: Row[] = records.time.map((_: unknown, index: number) => {
        return {
          time: new Date(records.time[index]).toLocaleString(),
          temperature: records.temperature_2m[index],
          humidity: records.relative_humidity_2m[index],
          code: records.weather_code[index],
        };
      });
      console.log(tableBody);
      setResultContent(tableBody);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form
      noValidate
      className="flex flex-col items-center justify-center h-screen"
      onSubmit={handleSubmit}
    >
      <h2 className="text-2xl mb-2">Open-Meteo Weather Data</h2>
      <div className="flex flex-col border border-green-800 rounded-lg p-4 max-w-5xl w-full">
        <div className="flex flex-row justify-center items-center">
          <label htmlFor="latitude" className="text-xl">
            Latitude:
          </label>
          <input type="text" name="latitude" className={locStyle} />
          <label htmlFor="longitude" className="text-xl">
            Longitude:
          </label>
          <input type="text" name="longitude" className={locStyle} />
          <label htmlFor="startdate" className="text-xl">
            Start Date:
          </label>
          <input type="date" name="startdate" className={dateStyle} />
          <label htmlFor="enddate" className="text-xl">
            End Date:
          </label>
          <input type="date" name="enddate" className={dateStyle} />
        </div>

        <div>
          <div className="flex flex-row justify-between items-center mb-2">
            <select multiple={true} onChange={handleSelectChange}>
            {weatherVariables.map((option, index) => (
            <option key={index} value={option}>
            {option}
          </option>
            </select>
              isMulti
              placeholder="Select variables..."
              inputValue={inputValue}
              value={selectedVariables}
              onChange={handleVariablesChange}
              onInputChange={handleInputChange}
              className="basic-multi-select"
              classNamePrefix="select"
              onMenuOpen={handleMenuOpen}
              onMenuClose={handleMenuClose}
            />
            <button type="submit" className="btn mt-2">
              Submit
            </button>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Selected Variables:</h3>
            <ul className="list-disc list-inside">
              {selectedVariables.length > 0 ? (
                selectedVariables.map(option => (
                  <li key={option.value}>{option.label}</li>
                ))
              ) : (
                <li>No variable selected</li>
              )}
            </ul>
          </div>
        </div>

        <div className="w-full h-96 overflow-y-auto border border-gray-300 mt-2">
          <table className="table-fixed w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className={headerStyle}>Time</th>
                <th className={headerStyle}>Temperature</th>
                <th className={headerStyle}>Humidity</th>
                <th className={headerStyle}>Code</th>
              </tr>
            </thead>
            <tbody>
              {resultContent ? (
                resultContent.map((item, index) => (
                  <tr key={index}>
                    <td className={rowStyle}>{item.time}</td>
                    <td className={rowStyle}>{item.temperature}</td>
                    <td className={rowStyle}>{item.humidity}</td>
                    <td className={rowStyle}>{item.code}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </form>
  );
};

export default WeatherQuery1;
