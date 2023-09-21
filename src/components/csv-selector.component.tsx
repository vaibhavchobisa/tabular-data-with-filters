import Papa from "papaparse";
import { memo } from "react";

type Props = {
  onChange(data: string[][]): void;
};

const CSVSelector = ({ onChange }: Props) => {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      try {
        const file = e.target.files[0];

        Papa.parse<string[]>(file, {
          worker: true, // use a web worker so that the page doesn't hang up
          complete({ data }) {
            onChange(data);
          },
        });
      } catch (error) {
        console.error(error);
      }
    }
  };
  return <input type="file" id="upload" accept=".csv" onChange={handleFileChange} />;
};

export default memo(CSVSelector);