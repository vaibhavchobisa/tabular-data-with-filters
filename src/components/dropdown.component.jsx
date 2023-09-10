import Multiselect from 'multiselect-react-dropdown';
import { memo } from 'react';

const Dropdown = ({ allTableData, setTableData, allOptions, options, setOptions, headers, header, filter }) => {

    const selectUnselectHandler = (selectedList) => {
        filter.current[header] = selectedList;

        const arrangeFilterByLength = (obj) => {
            const keyValueArray = Object.entries(obj);
            keyValueArray.sort((a, b) => b[1].length - a[1].length);
            const sortedObject = Object.fromEntries(keyValueArray);

            return sortedObject;
        }
        const sortedFilter = arrangeFilterByLength(filter.current);

        const applyFilters = () => {
            let i = 0;
            const newOptions = {};
            let data = allTableData.current;

            headers.forEach(header => {
                newOptions[header] = new Set();
            })

            for (const [header, filterArr] of Object.entries(sortedFilter)) {
                if (filterArr.length !== 0) {
                    if (i === 0) {
                        data = allTableData.current.filter(rowObj => filterArr.includes(rowObj[header]));
                    } else {
                        data = data.filter(rowObj => filterArr.includes(rowObj[header]));
                    }
                    i += 1;
                }
            }

            data.forEach((rowObj, idx) => {
                i = 0;
                for (const header in sortedFilter) {
                    if (i === 0 && idx === data.length - 1) {
                        newOptions[header] = allOptions[header];
                    } else {
                        newOptions[header].add(rowObj[header]);
                    }
                    i += 1;
                }
            })

            headers.forEach(header => {
                newOptions[header] = [...newOptions[header]];
                newOptions[header].sort((a, b) => a - b);
            })

            setTableData(() => data);
            setOptions(() => newOptions);
        }
        applyFilters();
    }

    return (
        <>
            <Multiselect
                isObject={false}
                onRemove={selectUnselectHandler}
                onSelect={selectUnselectHandler}
                showCheckbox
                options={options}
                placeholder={header}
            />
        </>
    )
}

export default memo(Dropdown);