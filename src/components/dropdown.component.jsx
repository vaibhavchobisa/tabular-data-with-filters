/* eslint-disable react/prop-types */
import Multiselect from 'multiselect-react-dropdown';
import { memo } from 'react';

// eslint-disable-next-line react/prop-types
const Dropdown = ({ allTableData, setTableData, allOptions, options, setOptions, headers, header, filter, setTableProgress, dropdownProgress, setDropdownProgress }) => {

    const selectUnselectHandler = (selectedList) => {
        setTableProgress(true);
        // setDropdownProgress(true);

        const worker = new Worker(new URL('../web-workers/filter.worker.js', import.meta.url));
        const messageData = {
            allTableData,
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
            // loading={dropdownProgress}
            />
        </>
    )
}

export default memo(Dropdown);
