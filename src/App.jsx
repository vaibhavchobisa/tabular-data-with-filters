import { useState, useEffect, useRef, useMemo } from 'react';
import './App.css';
import CSVSelector from './components/csv-selector.component';
import Table from './components/table.component';
import Dropdown from './components/dropdown.component';

const App = () => {
  const [fileData, setFileData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [dropdownOptions, setDropdownOptions] = useState({});
  const [tableProgress, setTableProgress] = useState(false);
  // const [dropdownProgress, setDropdownProgress] = useState(false);
  const filter = useRef({});
  const allTableData = useRef([]);
  const allOptions = useRef({});
  const bigOptions = useRef({});
  const columnNames = useRef([]);
  const pageNo = useRef({});
  const hasRunOnce = useRef(false);

  const headers = useMemo(() => fileData[0], [fileData]);
  const rows = useMemo(() => fileData.slice(1), [fileData]);

  useEffect(() => {
    setTableProgress(true);
    // setDropdownProgress(true);

    const columns = [];
    headers?.forEach((header) => {
      const headerObj = {};
      headerObj["name"] = header;
      // headerObj["sortable"] = true;
      headerObj["selector"] = (row) => row[header];
      columns.push(headerObj);

      filter.current[header] = [];
      pageNo.current[header] = 0;
    });
    columnNames.current = columns;

    const worker = new Worker(new URL('./web-workers/file-upload.worker.js', import.meta.url));

    const messageData = {
      headers,
      rows,
    }
    worker.postMessage(messageData);

    worker.onmessage = (event) => {
      const { data, options } = event.data;
      allTableData.current = data;
      allOptions.current = options;

      let i = 0;
      const newOptions = JSON.parse(JSON.stringify(options));
      for (let header in newOptions) {
        if (newOptions[header].length > 200) {
          bigOptions.current[header] = i;
          newOptions[header] = newOptions[header].slice(0, 200);
        }
        i++;
      }
      setTableData(data);
      setDropdownOptions(newOptions);
    };

    return () => worker.terminate();
  }
    , [fileData])

  useEffect(() => {
    setTableProgress(false);
  }
    , [tableData]);

  useEffect(() => {
    if (Object.keys(dropdownOptions).length && !hasRunOnce.current) {
      const dropdowns = document.querySelectorAll(".optionContainer");
      for (let [header, index] of Object.entries(bigOptions.current)) {
        dropdowns[index].addEventListener('scroll', function () {
          if (dropdowns[index].scrollHeight - dropdowns[index].scrollTop === dropdowns[index].clientHeight) {
            pageNo.current[header] += 1;
            setDropdownOptions((options) => {
              const obj = { ...options };
              const upperBound = 200 * (pageNo.current[header] + 1);
              obj[header] = allOptions.current[header].slice(0, upperBound);
              return obj;
            })
          }
        })
      }
      hasRunOnce.current = true;
    }
  }, [dropdownOptions]);

  // console.log('app.jsx ran');

  return (
    <>
      <CSVSelector onChange={(data) => setFileData(data)} />
      <div id='dropdowns-container'>
        {
          headers?.map((header, idx) =>
            <Dropdown
              key={idx}
              headers={headers}
              header={header}
              allTableData={allTableData}
              tableData={tableData}
              setTableData={setTableData}
              allOptions={allOptions.current}
              // bigOptions={bigOptions.current}
              options={dropdownOptions[header]}
              setOptions={setDropdownOptions}
              filter={filter}
              setTableProgress={setTableProgress}
            // dropdownProgress={dropdownProgress}
            // setDropdownProgress={setDropdownProgress}
            />
          )
        }
      </div>
      <div id='table-container'>
        <Table
          tableData={tableData}
          columns={columnNames.current}
          tableProgress={tableProgress}
          setTableProgress={setTableProgress}
        />
      </div>
    </>
  );

}

export default App;