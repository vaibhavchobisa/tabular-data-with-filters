self.addEventListener("message", (event) => {
  const { headers, rows } = event.data;
  const result = populateData(headers, rows);
  self.postMessage(result);
});

function populateData(headers, rows) {
  const data = [];
  const options = {};
  // const filter = {};

  headers?.forEach((header) => (options[header] = new Set()));

  rows?.forEach((row, i) => {
    const rowObj = {};
    rowObj.id = i + 1;

    headers?.forEach((header, j) => {
      row[j] ? (rowObj[header] = row[j]) : (rowObj[header] = "No Data");

      if (row[j]) options[header].add(row[j]);
    });

    data.push(rowObj);
  });

  for (let header in options) {
    options[header] = [...options[header]];
    options[header].sort((a, b) => a - b);
  }

  return { data, options };
}
