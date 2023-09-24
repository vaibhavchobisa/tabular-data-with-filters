self.addEventListener("message", (event: MessageEvent) => {
  const { allTableData, allOptions, headers, queryParams } = event.data;
  const result = filterWorker(allTableData, allOptions, headers, queryParams);
  self.postMessage(result);
});

function filterWorker(
  allTableData: { current: any[] },
  allOptions: { current: { [key: string]: string[] } },
  headers: string[] | undefined,
  queryParams: { [key: string]: string[] }
) {
  const arrangeFilterByLength = (obj: { [key: string]: any[] }) => {
    const keyValueArray = Object.entries(obj);
    keyValueArray.sort((a, b) => b[1].length - a[1].length);
    const sortedObject: { [key: string]: any[] } =
      Object.fromEntries(keyValueArray);
    return sortedObject;
  };

  const sortedFilter = arrangeFilterByLength(queryParams);

  const applyFilters = () => {
    let i = 0;
    const newOptions: { [key: string]: Set<any> } = {};
    const newOptionsArr: { [key: string]: number[] } = {};
    let data = allTableData.current;

    headers?.forEach((header) => {
      newOptions[header] = new Set();
    });

    for (const [header, filterArr] of Object.entries(sortedFilter)) {
      if (filterArr.length !== 0) {
        if (i === 0) {
          data = allTableData.current.filter((rowObj) =>
            filterArr.includes(rowObj[header])
          );
        } else {
          data = data.filter((rowObj) => filterArr.includes(rowObj[header]));
        }
        i += 1;
      }
    }

    data.forEach((rowObj, idx) => {
      i = 0;
      for (const header in sortedFilter) {
        if (i === 0 && idx === data.length - 1) {
          newOptions[header] = new Set(allOptions.current[header]);
        } else {
          if (rowObj[header] !== "No Data") {
            newOptions[header]?.add(rowObj[header]);
          }
        }
        i += 1;
      }
    });

    headers?.forEach((header) => {
      newOptionsArr[header] = [...newOptions[header]];
      newOptionsArr[header].sort((a, b) => a - b);
    });

    return { data, newOptionsArr };
  };

  return applyFilters();
}
