import { FormEvent, useState, useEffect } from 'react';
import Select from 'react-select';
import { MultiValue } from 'react-select';

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

const WeatherQuery = () => {
  const weatherVariables: OptionType[] = [
    { value: 'temperature_2m', label: 'Temperature' },
    { value: 'relative_humidity_2m', label: 'Rel. Humidity' },
    { value: 'weather_code', label: 'Weather Code' },
  ];

  const [headerContent, setHeaderContent] = useState<string[]>();
  const [resultContent, setResultContent] = useState<Row[]>();
  // State for input change
  // const [inputValue, setInputValue] = useState<string>('temperature_2m');
  const [isMounted, setIsMounted] = useState(false); // Track component mount status

  const locStyle = 'text-lg border w-24 mx-4 p-1';
  const dateStyle = 'text-lg border w-36 mx-4 p-1';
  const headerStyle =
    'sticky top-0 border border-gray-300 px-4 py-2 bg-gray-200';
  const rowStyle = 'text-center border border-gray-300 px-4 py-1';
  const [selectedVariables, setSelectedVariables] = useState<
    MultiValue<OptionType>
  >([]);

  // Ensure component is only rendered on the client after mounting
  useEffect(() => {
    setIsMounted(true); // Mark the component as mounted after client-side render
  }, []);

  const handleVariablesChange = (selected: MultiValue<OptionType>) => {
    console.log('handleVariablesChange...', selected);
    setSelectedVariables(selected || []); // Update state with selected values
    // const headerBody = selected.map(item => item.label);
    // setHeaderContent(headerBody);
    // console.log(headerBody);
  };

  // Handle input change in the search field
  // const handleInputChange = (
  //   inputValue: string,
  //   actionMeta: InputActionMeta
  // ) => {
  //   console.log('Input Changed:', inputValue, actionMeta);
  //   setInputValue(inputValue);
  // };

  // Handle menu open
  // const handleMenuOpen = () => {
  //   console.log(weatherVariables);
  //   console.log('Menu is opened');
  // };

  // Handle menu close
  // const handleMenuClose = () => {
  //   console.log('Menu is closed');
  // };

  const replaceValuesWithLabels = (
    values: string[],
    variables: OptionType[]
  ) => {
    return values.map(value => {
      const matchingVariable = variables.find(v => v.value === value);
      return matchingVariable ? matchingVariable.label : value;
    });
  };

  const objectOfArraysToObjects = <T,>(
    input: Record<string, T[]>
  ): Record<string, T>[] => {
    const keys = Object.keys(input); // Get the keys from the object
    const arrays = Object.values(input); // Get the arrays from the object

    // Check if all arrays have the same length
    const length = arrays[0].length;

    // Create an array of objects where each object maps a key to the corresponding value from each array
    return Array.from({ length }, (_, rowIndex) =>
      keys.reduce(
        (acc, key, i) => {
          acc[key] = arrays[i][rowIndex];
          return acc;
        },
        {} as Record<string, T>
      )
    );
  };

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
    console.log(selectedVariables);

    try {
      const response = await fetch(prompt);
      const data = await response.json();
      const rawHeader = Object.keys(data.hourly_units);
      const header = replaceValuesWithLabels(rawHeader, weatherVariables);
      console.log(header);
      const records = data.hourly;
      console.log(records);
      const tableBody = objectOfArraysToObjects(records);
      // const tableBody_old: Row[] = records.time.map((_: unknown, index: number) => {
      //   return {
      //     time: new Date(records.time[index]).toLocaleString(),
      //     temperature: records.temperature_2m[index],
      //     humidity: records.relative_humidity_2m[index],
      //     code: records.weather_code[index],
      //   };
      // });
      console.log(tableBody);
      // setResultContent(tableBody);
    } catch (error) {
      console.error(error);
    }
  };

  if (!isMounted) {
    // Prevent rendering of Select component until after the component has mounted
    return null;
  }

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
            <Select
              options={weatherVariables}
              onChange={handleVariablesChange}
              isMulti
              placeholder="Select variables..."
              // inputValue={inputValue}
              // value={selectedVariables}
              // onInputChange={handleInputChange}
              // className="basic-multi-select"
              // classNamePrefix="select"
              // onMenuOpen={handleMenuOpen}
              // onMenuClose={handleMenuClose}
            />
            <button type="submit" className="btn mt-2">
              Submit
            </button>
          </div>
          {/* <div className="mt-4">
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
          </div> */}
        </div>

        <div className="w-full h-96 overflow-y-auto border border-gray-300 mt-2">
          <table className="table-fixed w-full border-collapse border border-gray-300">
            <thead>
              {/* <tr>
                {headerContent ? (
                  headerContent.map((item, index) => (
                    <th key={index} className={headerStyle}>
                      {item}
                    </th>
                  ))
                ) : (
                  <tr>
                    <th>Empty</th>
                  </tr>
                )}
              </tr> */}

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

export default WeatherQuery;
