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
  const [dropdownProgress, setDropdownProgress] = useState(false);
  const filter = useRef({});
  const allTableData = useRef([]);
  const allOptions = useRef({});
  const columnNames = useRef([]);

  const headers = useMemo(() => fileData[0], [fileData]);
  const rows = useMemo(() => fileData.slice(1), [fileData]);

  useEffect(() => {
    setTableProgress(true);
    setDropdownProgress(true);

    const columns = [];
    headers?.forEach((header) => {
      const headerObj = {};
      headerObj["name"] = header;
      headerObj["sortable"] = true;
      headerObj["selector"] = (row) => row[header];
      columns.push(headerObj);

      filter.current[header] = [];
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
      setTableData(() => data);
      setDropdownOptions(() => options);
    };

    const rowHeight = document.querySelector("#row-1")?.scrollHeight;
    console.log(rowHeight)

    return () => worker.terminate();
  }
    , [fileData])

  useEffect(() => {
    setTableProgress(false);
    setDropdownProgress(false);
  }
    , [tableData]);

  console.log('app.jsx ran');

  return (
    <>
      <CSVSelector onChange={(data) => setFileData(data)} />
      {
        headers?.map((header, idx) =>
          <>
            <Dropdown
              key={idx}
              headers={headers}
              header={header}
              allTableData={allTableData}
              tableData={tableData}
              setTableData={setTableData}
              allOptions={allOptions.current}
              options={dropdownOptions[header]}
              setOptions={setDropdownOptions}
              filter={filter}
              setTableProgress={setTableProgress}
              dropdownProgress={dropdownProgress}
              setDropdownProgress={setDropdownProgress}
            />
          </>
        )
      }
      <Table
        tableData={tableData}
        columns={columnNames.current}
        tableProgress={tableProgress}
        setTableProgress={setTableProgress}
      />
    </>
  );

}

export default App;
