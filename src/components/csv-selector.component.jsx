import Papa from "papaparse";
import { memo } from "react";

const CSVSelector = ({ onChange }) => {
    const handleFileChange = async (e) => {
        if (e.target.files) {
            try {
                const file = e.target.files[0];
                Papa.parse(file, {
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
    return <input id="upload" type="file" accept=".csv" onChange={handleFileChange} />;
};

export default memo(CSVSelector);
