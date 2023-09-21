self.addEventListener("message", (event: MessageEvent) => {
  const { headers, rows } = event.data;
  const result = populateData(headers, rows);
  self.postMessage(result);
});

function populateData(headers: string[] | undefined, rows: (string | null)[][] | undefined) {
  const data: { [key: string]: any }[] = [];
  const options: { [key: string]: Set<any> } = {};
  const newOptions: { [key: string]: number[] } = {};

  headers?.forEach((header: string | undefined) => {
    if (header) {
      options[header] = new Set();
    }
  });

  rows?.forEach((row: (string | null)[], i: number) => {
    const rowObj: { [key: string]: any } = {};
    rowObj.id = i + 1;

    headers?.forEach((header: string | undefined, j: number) => {
      if (header) {
        rowObj[header] = row[j] ?? "No Data";
        if (row[j]) {
          options[header].add(row[j]);
        }
      }
    });

    data.push(rowObj);
  });

  for (let header in options) {
    newOptions[header] = [...options[header]];
    newOptions[header].sort((a, b) => a - b);
  }

  return { data, newOptions };
}
