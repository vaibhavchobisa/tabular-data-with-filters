import { useState, useEffect, useRef, useMemo } from 'react';
import './App.css';
import CSVSelector from './components/csv-selector.component';
import Table from './components/table.component';
// import Dropdown from './components/dropdown.component';
import SelectWrapper from './components/select-wrapper.component';


const App = () => {
  const [fileData, setFileData] = useState([]);
  const [tableData, setTableData] = useState([]);
  // const [dropdownOptions, setDropdownOptions] = useState({});
  const [tableProgress, setTableProgress] = useState(false);
  // const [dropdownProgress, setDropdownProgress] = useState(false);

  const [options, setOptions] = useState({});
  const [pageNo, setPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isNextPageLoading, setNextPageLoading] = useState(false);
  const [selectedValue, setSelectedOption] = useState('');

  const filter = useRef({});
  const allTableData = useRef([]);
  const allOptions = useRef({});
  const columnNames = useRef([]);

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
      setOptions(() => options);
      // setDropdownOptions(() => options);
    };

    return () => worker.terminate();
  }
    , [fileData])

  useEffect(() => {
    setTableProgress(false);
    // setDropdownProgress(false);
  }
    , [tableData]);


  const loadOptions = (header, page) => {
    const totalSize = allOptions.current[header]?.length;

    let newOptions;
    if (page === 0) {
      newOptions = allOptions.current[header]?.slice(0, 200);
    } else {
      newOptions = allOptions.current[header]?.slice(200 * page, 200 * (pageNo + 1));
    }

    setNextPageLoading(true);
    const itemsData = options[header]?.concat(newOptions);
    setOptions(options => {
      const obj = { ...options };
      obj[header] = itemsData;
      return obj;
    });
    setNextPageLoading(false);
    setHasNextPage(itemsData?.length < totalSize);
    setPage(page);
  };

  const loadNextPage = (header) => {
    loadOptions(pageNo + 1, header);
  };


  return (
    <>
      <CSVSelector onChange={(data) => setFileData(data)} />
      {
        headers?.map((header, idx) => {
          <SelectWrapper
            value={selectedValue}
            placeholder={header}
            hasNextPage={hasNextPage}
            isNextPageLoading={isNextPageLoading}
            options={options[header]}
            loadNextPage={loadNextPage(header)}
            onChange={(selected) => setSelectedOption(selected)}
            // header={header}
            isClearable
            isMulti
            isSearchable
          />
        })
      }
      {/* <div id='dropdowns-container'>
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
              setTableProgress={setTableProgress}
            // dropdownProgress={dropdownProgress}
            // setDropdownProgress={setDropdownProgress}
            />
          )
        }
      </div> */}
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
