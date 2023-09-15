self.addEventListener("message", (event) => {
  const {
    selectedList,
    allTableData,
    tableData,
    allOptions,
    headers,
    header,
    filter,
  } = event.data;

  const result = filterWorker(
    selectedList,
    allTableData,
    tableData,
    allOptions,
    headers,
    header,
    filter
  );

  self.postMessage(result);
});

function filterWorker(
  selectedList,
  allTableData,
  tableData,
  allOptions,
  headers,
  header,
  filter
) {
  filter.current[header] = selectedList;

  const applyFilters = () => {
    let data;
    const newOptions = {};

    headers.forEach((header) => {
      newOptions[header] = new Set();
    });

    const checkFilterArrays = (arr) => {
      let nonEmptyCount = 0;
      let nonEmptyLength = 0;

      for (let i = 0; i < arr.length; i++) {
        if (Array.isArray(arr[i]) && arr[i].length > 0) {
          nonEmptyCount++;
          if (arr[i].length === 1) {
            nonEmptyLength = 1;
          } else if (arr[i].length > 1) {
            nonEmptyLength = Math.max(nonEmptyLength, arr[i].length);
          }
        }
      }

      if (nonEmptyCount === 0) {
        data = allTableData.current;
        return "0";
      } else if (nonEmptyCount === 1 && nonEmptyLength === 1) {
        let newObj, frontHeader;
        data = allTableData.current;
        for (const [header, filterArr] of Object.entries(filter.current)) {
          if (filterArr.length === 1) {
            newObj = { [header]: filter.current[header] };
            frontHeader = header;
          }
        }
        for (const key in filter.current) {
          if (key !== frontHeader) {
            newObj[key] = filter.current[key];
          }
        }
        filter.current = newObj;
        return "1-1";
      } else if (nonEmptyCount === 1 && nonEmptyLength > 1) {
        data = allTableData.current;
        return "1>1";
      } else {
        data = tableData;
        return ">1";
      }
    };

    const filterArrays = Object.values(filter.current);

    const filterOperationStatus = checkFilterArrays(filterArrays);

    console.log(filterOperationStatus);

    // now applying the filters to data and then options

    let i = 0;
    for (const [header, filterArr] of Object.entries(filter.current)) {
      if (filterArr.length !== 0) {
        if (filterOperationStatus === ">1" && i !== 0) {
          data = data.filter((rowObj) => filterArr.includes(rowObj[header]));
        } else if (filterOperationStatus !== ">1") {
          data = data.filter((rowObj) => filterArr.includes(rowObj[header]));
        }
      }
      i += 1;
    }

    data.forEach((rowObj, idx) => {
      let i = 0;
      for (const header in filter.current) {
        if (i === 0 && idx === data.length - 1) {
          newOptions[header] = allOptions[header];
        } else {
          if (rowObj[header] !== "No Data") {
            newOptions[header].add(rowObj[header]);
          }
        }
        i += 1;
      }
    });

    headers.forEach((header) => {
      newOptions[header] = [...newOptions[header]];
      newOptions[header].sort((a, b) => a - b);
    });

    console.log(filter.current);

    const newFilter = filter;

    return { data, newOptions, newFilter };
  };

  return applyFilters();
}
