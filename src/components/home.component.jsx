import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as JSURL from "jsurl";
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../App.css';
import CSVSelector from './csv-selector.component';
import Table from './table.component';
import Dropdown from './dropdown.component';

// defining a custom hook for safe URL encoding
const useQueryParam = (key) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const paramValue = searchParams.get(key);

    const value = useMemo(() => JSURL.parse(paramValue), [paramValue]);

    const setValue = useCallback(
        (newValue, options) => {
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set(key, JSURL.stringify(newValue));
            setSearchParams(newSearchParams, options);
        },
        [key, searchParams, setSearchParams]
    );

    return [value, setValue];
}

const Home = () => {
    const [fileData, setFileData] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [dropdownOptions, setDropdownOptions] = useState({});
    const [tableProgress, setTableProgress] = useState(false);
    const [dataPopulated, setDataPopulated] = useState(false);
    let [queryParams, setQueryParams] = useQueryParam("filter");

    const navigate = useNavigate();

    const filter = useRef({});
    const allTableData = useRef([]);
    const allOptions = useRef({});
    const bigOptions = useRef({});
    const columnNames = useRef([]);
    const pageNo = useRef({});
    const hasRunOnce = useRef(false);

    const headers = useMemo(() => fileData[0], [fileData]);
    const rows = useMemo(() => fileData.slice(1), [fileData]);

    // For populating data when a file upload occurs, or when a project URL is visited directly
    useEffect(() => {
        if (headers) {
            console.log('populate');

            setTableProgress(true);
            filter.current = {}; // resetting for when a new file-upload happens

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

            const worker = new Worker(new URL('../web-workers/file-upload.worker.js', import.meta.url));

            const messageData = {
                headers,
                rows,
            }
            worker.postMessage(messageData);

            worker.onmessage = (event) => {
                let { data, options } = event.data;
                allTableData.current = data;
                allOptions.current = options;


                let i = 0;
                let newOptions = JSON.parse(JSON.stringify(options));
                for (let header in newOptions) {
                    if (newOptions[header].length > 200) {
                        bigOptions.current[header] = i;
                        newOptions[header] = newOptions[header].slice(0, 200);
                    }
                    i++;
                }

                console.log('worker1');

                if (!queryParams) {
                    setTableData(data);
                    setDropdownOptions(newOptions);
                }

                localStorage.setItem("fileData", JSON.stringify(fileData));
                setDataPopulated(true);
            };

            return () => {
                worker.terminate();
            };
        }
    }
        , [fileData])


    // for bookmark management, and populating data when query params exist
    useEffect(() => {
        if (headers && queryParams) {
            console.log('bookmark management');
            setTableProgress(true);

            filter.current = queryParams;

            const worker = new Worker(new URL('../web-workers/filter.worker.js', import.meta.url));
            const messageData = {
                allTableData,
                allOptions,
                headers,
                queryParams,
            }

            worker.postMessage(messageData);

            worker.onmessage = (event) => {
                const { data, newOptions } = event.data;
                console.log('worker2');

                setTableData(data);
                setDropdownOptions(newOptions);
            };

            return () => {
                worker.terminate();
            };
        }

    },
        [queryParams, dataPopulated]);



    // For persisting "fileData" on every re-load, which will further be filtered depending on queryParams(filters)
    useEffect(() => {
        const fileData = JSON.parse(localStorage.getItem('fileData'));

        if (fileData) {
            setFileData(fileData);
        }

        const upload = document.querySelector('#upload');
        upload.addEventListener('click', () => {
            navigate('/');
            filter.current = {};
            setTableData(allTableData.current);
        })

    }, []);


    // For removing loader when the data loads in the table
    useEffect(() => {
        tableProgress ? setTableProgress(false) : null;
    }
        , [tableData]);


    // For lazy loading dropdown with more than 200 values
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


    // handler for when a user selects/unselects an option from the dropdown
    const selectUnselectHandler = (...args) => {
        const [selectedList, , header] = args;
        filter.current[header] = selectedList;

        setQueryParams(filter.current);
    }


    return (
        <>
            <CSVSelector onChange={(data) => setFileData(data)} />
            <div id='dropdowns-container'>
                {
                    headers?.map((header, idx) =>
                        <Dropdown
                            key={idx}
                            options={dropdownOptions[header]}
                            header={header}
                            onSelectRemove={selectUnselectHandler}
                            fileData={fileData}
                            preSelectedValues={filter.current[header]}
                            tableProgress={tableProgress}
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
    )
}

export default Home;