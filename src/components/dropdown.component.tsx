import Multiselect from 'multiselect-react-dropdown';
import { memo } from 'react';

const dropdownStyle = {
    multiselectContainer: {
        paddingLeft: "1rem",
        paddingRight: "1rem",
        paddingBottom: "1.5rem",
        width: "220px"
    },
    inputField: {
        paddingLeft: "12px"
    }
}

interface DropdownProps {
    options: string[];
    header: string;
    onSelectRemove: (selectedList: string[], selectRemoveValue: string, header: string) => void;
    preSelectedValues: string[];
    tableProgress: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({ options, header, onSelectRemove, preSelectedValues, tableProgress }) => {

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
