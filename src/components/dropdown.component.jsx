/* eslint-disable react/prop-types */
import Multiselect from 'multiselect-react-dropdown';
import { memo } from 'react';

const dropdownStyle = {
    multiselectContainer: {
        // marginRight: "30px",
        paddingLeft: "1rem",
        paddingRight: "1rem",
        paddingBottom: "1.5rem",
        width: "220px"
    },
    inputField: {
        paddingLeft: "12px"
    }
}

const Dropdown = ({ allTableData, tableData, setTableData, allOptions, options, setOptions, headers, header, filter, setTableProgress, dropdownProgress, setDropdownProgress }) => {

    const selectUnselectHandler = (selectedList) => {
        setTableProgress(true);
        // setDropdownProgress(true);

        const worker = new Worker(new URL('../web-workers/filter.worker.js', import.meta.url));
        const messageData = {
            allTableData,
            tableData,
            allOptions,
            selectedList,
            headers,
            header,
            filter,
        }
        worker.postMessage(messageData);

        worker.onmessage = (event) => {
            const { data, newOptions, newFilter } = event.data;
            filter.current = newFilter.current;
            setTableData(() => data);
            setOptions(() => newOptions);
        };

        return () => worker.terminate();
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
                style={dropdownStyle}
                showArrow
            // loading={dropdownProgress}
            />
        </>
    )
}

export default memo(Dropdown);
