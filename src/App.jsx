import './App.css';
import CSVSelector from './components/csv-selector.component';
import Table from './components/table.component';
import Dropdown from './components/dropdown.component';

import { useState, useEffect, useRef, useMemo } from 'react';

const App = () => {
  const [fileData, setFileData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [dropdownOptions, setDropdownOptions] = useState({});
  const filter = useRef({});
  const allTableData = useRef([]);
  const allOptions = useRef({});
  const columnNames = useRef([]);

  const headers = useMemo(() => fileData[0], [fileData]);
  const rows = useMemo(() => fileData.slice(1), [fileData]);

  useEffect(() => {
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

    return () => worker.terminate();
  }
    , [fileData])

  console.log('app.jsx ran');

  return (
    <>
      <CSVSelector onChange={(data) => setFileData(data)} />
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
            options={dropdownOptions[header]}
            setOptions={setDropdownOptions}
            filter={filter}
          />
        )
      }
      <Table tableData={tableData} columns={columnNames.current} />
    </>
  );

}

export default App;
