import { FormEvent, useState, useEffect } from 'react';
import Select from 'react-select';
import { MultiValue } from 'react-select';
import { OptionType, weatherVariables } from '@/utils/weatherVariables';
import { weatherCodeMap } from '@/utils/weatherCodeMap';

const WeatherQuery = () => {
  const [headerContent, setHeaderContent] = useState<string[]>();
  const [resultContent, setResultContent] = useState<unknown[][]>([]);
  const [variablesContent, setVariablesContent] = useState<string[]>();
  // State for input change
  const [isMounted, setIsMounted] = useState(false); // Track component mount status

  const locStyle = 'text-lg border w-24 mx-4 p-1';
  const dateStyle = 'text-lg border w-36 mx-4 p-1';
  const headerStyle =
    'sticky top-0 border border-gray-300 px-4 py-2 bg-gray-200';
  const rowStyle = 'text-center border border-gray-300 px-4 py-1';
  // const [selectedVariables, setSelectedVariables] = useState<
  //   MultiValue<OptionType>
  // >([]);

  // Ensure component is only rendered on the client after mounting
  useEffect(() => {
    setIsMounted(true); // Mark the component as mounted after client-side render
  }, []);

  const handleVariablesChange = (selected: MultiValue<OptionType>) => {
    // setSelectedVariables(selected || []);
    const headerBody = selected.map(item => item.label);
    // Update table header with selected values
    setHeaderContent(['Time'].concat(headerBody));
    setVariablesContent(selected.map(item => item.value));
  };

  const replaceValuesWithLabels = (
    values: string[],
    variables: OptionType[]
  ) => {
    return values.map(value => {
      const matchingVariable = variables.find(v => v.value === value);
      return matchingVariable ? matchingVariable.label : value;
    });
  };

  // const objectOfArraysToObjects = <T,>(
  //   input: Record<string, T[]>
  // ): Record<string, T>[] => {
  //   const keys = Object.keys(input); // Get the keys from the object
  //   const arrays = Object.values(input); // Get the arrays from the object

  //   const length = arrays[0].length;

  //   // Create an array of objects where each object maps a key to the corresponding value from each array
  //   return Array.from({ length }, (_, rowIndex) =>
  //     keys.reduce(
  //       // (acc, key, i) => {
  //       //   acc[key] = arrays[i][rowIndex];
  //       //   return acc;
  //       // },
  //       (acc, key) => {
  //         acc[key] = input[key][rowIndex];
  //         return acc;
  //       },
  //       {} as Record<string, T>
  //     )
  //   );
  // };

  const objectOfArraysToArray = <T extends string | number>(
    input: Record<string, T[]>
  ): (string | T)[][] => {
    // ): T[][] => {
    const keys = Object.keys(input); // Get the keys from the object
    const arrays = Object.values(input); // Get the arrays from the object

    const length = arrays[0].length;
    return Array.from({ length }, (_, rowIndex) =>
      keys.map(key => {
        switch (key) {
          case 'time':
            return new Date(input[key][rowIndex]).toLocaleString('en-US', {
              year: 'numeric',
              month: 'numeric', // Full month name, e.g., "September"
              day: 'numeric',
              hour: 'numeric',
              minute: undefined,
              second: undefined, // Explicitly exclude seconds
              hour12: true, // Set to false for 24-hour format
            });
          case 'weather_code':
            return weatherCodeMap[input[key][rowIndex] as number];
          default:
            return input[key][rowIndex];
        }
        // key === 'weather_code'
        //   ? weatherCodeMap[
        //       input[key][rowIndex] as keyof typeof weatherCodeMap
        //     ] || 'Unknown'
        //   : input[key][rowIndex]
      })
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
    prompt += '&hourly=' + variablesContent?.join(',');
    prompt +=
      '&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FLos_Angeles';
    console.log(prompt);
    // console.log(selectedVariables);

    try {
      const response = await fetch(prompt);
      const data = await response.json();
      const rawHeader = Object.keys(data.hourly_units);
      const header = replaceValuesWithLabels(rawHeader, weatherVariables);
      console.log(header);
      const records = data.hourly;
      console.log(records);
      // const tableBody = objectOfArraysToObjects(records);
      const tableBody = objectOfArraysToArray(records);
      console.log(tableBody);
      setResultContent(tableBody);
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
              placeholder="Select variables for display..."
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
              <tr>
                {headerContent ? (
                  headerContent.map((item, index) => (
                    <th key={index} className={headerStyle}>
                      {item}
                    </th>
                  ))
                ) : (
                  <th>Empty</th>
                )}
              </tr>
            </thead>
            <tbody>
              {resultContent ? (
                resultContent.map((item, index) => (
                  <tr key={index}>
                    {item.map((itx, idx) => (
                      <td key={idx} className={rowStyle}>
                        {itx as string | number}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="text-center">No data available</td>
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
