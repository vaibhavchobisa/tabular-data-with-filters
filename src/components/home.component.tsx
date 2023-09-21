import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as JSURL from 'jsurl';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../App.css';
import CSVSelector from './csv-selector.component';
import Table from './table.component';
import Dropdown from './dropdown.component';

// Define the shape of your filter object
interface Filter {
    [key: string]: string[];
}

// Defining a custom hook for safe URL encoding
const useQueryParam = (key: string) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const paramValue = searchParams.get(key);

    const value = useMemo(() => JSURL.parse(paramValue), [paramValue]);

    const setValue = useCallback(
        (newValue: any, options?: { replace: boolean }) => {
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set(key, JSURL.stringify(newValue));
            setSearchParams(newSearchParams, options);
        },
        [key, searchParams, setSearchParams]
    );

    return [value, setValue] as const;
}

const Home: React.FC = () => {
    const [fileData, setFileData] = useState<any[][]>([]);
    const [tableData, setTableData] = useState<any[][]>([]);
    const [dropdownOptions, setDropdownOptions] = useState<{ [key: string]: any[] }>({});
    const [tableProgress, setTableProgress] = useState(false);
    const [dataPopulated, setDataPopulated] = useState(false);
    const [queryParams, setQueryParams] = useQueryParam("filter");
    
    const navigate = useNavigate();
    
    const filter = useRef<Filter>({});
    const allTableData = useRef<any[][]>([]);
    const allOptions = useRef<{ [key: string]: any[] }>({});
    const bigOptions = useRef<{ [key: string]: number }>({});
    const columnNames = useRef<any[]>([]);
    const pageNo = useRef<{ [key: string]: number }>({});
    const hasRunOnce = useRef(false);
    
    const headers = useMemo(() => fileData[0], [fileData]);
    const rows = useMemo(() => fileData.slice(1), [fileData]);

    // ... Rest of the code remains unchanged


    // For populating data when a file upload occurs, or when a project URL is visited directly
    useEffect(() => {
        if (headers) {
            console.log('populate');

            setTableProgress(true);
            filter.current = {}; // resetting for when a new file-upload happens

            const columns: { name: string; selector: (row: any) => any }[] = [];
            headers?.forEach((header) => {

            const headerObj: { name: string; selector: (row: any) => any } = {
            name: header,
            selector: (row) => row[header],
            };

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
        const fileDataJSON = localStorage.getItem('fileData');
        if (fileDataJSON) {
            const parsedFileData = JSON.parse(fileDataJSON) as any[];
            setFileData(parsedFileData);
        }

        if (fileData) {
            setFileData(fileData);
        }

        const upload = document.querySelector<HTMLInputElement>('#upload');
        if (upload) {
            upload.addEventListener('click', () => {
                navigate('/');
                filter.current = {};
                setTableData(allTableData.current);
            });
        }

        return () => {
            if (upload) {
                upload.removeEventListener('click', () => {
                    navigate('/');
                    filter.current = {};
                    setTableData(allTableData.current);
                });
            }
        };

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
    const selectUnselectHandler = (selectedList: string[], _: any, header: string) => {
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
                />
            </div>
        </>
    )
}

export default Home;