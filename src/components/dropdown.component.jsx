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

const Dropdown = ({ options, header, onSelectRemove, preSelectedValues, tableProgress }) => {

    return (
        <>
            <Multiselect
                isObject={false}
                onRemove={(selectedList, selectRemoveValue) => onSelectRemove(selectedList, selectRemoveValue, header)}
                onSelect={(selectedList, selectRemoveValue) => onSelectRemove(selectedList, selectRemoveValue, header)}
                options={options}
                placeholder={header}
                style={dropdownStyle}
                selectedValues={preSelectedValues}
                showCheckbox
                showArrow
                loading={tableProgress}
            />
        </>
    )
}

export default memo(Dropdown);
