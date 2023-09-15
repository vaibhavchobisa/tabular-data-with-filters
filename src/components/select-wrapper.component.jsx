import React, { useEffect, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import Select from 'react-select';
import AutoSizer from 'react-virtualized-auto-sizer';

const SelectWrapper = (props) => {
    const {
        hasNextPage,
        isNextPageLoading,
        options,
        loadNextPage,
        placeholder,
        onChange,
        value,
    } = props;
    const [selectedOption, setSelectedOption] = useState(value);

    useEffect(() => {
        setSelectedOption(value);
    }, [value]);

    // Extra row to hold a loading indicator if more options are present
    const itemCount = hasNextPage ? options.length + 1 : options.length;

    const loadMoreItems = isNextPageLoading ? () => { } : loadNextPage;

    // Every row is loaded except for our loading indicator row.
    const isItemLoaded = (index) => !hasNextPage || index < options.length;

    const MenuList = ({ children }) => {
        const childrenArray = React.Children.toArray(children);
        // Render an item or a loading indicator.
        const Item = ({ index, style, ...rest }) => {
            const child = childrenArray[index];

            return (
                <div
                    className="drop-down-list"
                    style={{
                        borderBottom: '1px solid rgb(243 234 234 / 72%)',
                        display: 'flex',
                        alignItems: 'center',
                        ...style,
                    }}
                    onClick={() => handleChange(options[index])}
                    {...rest}
                >
                    {isItemLoaded(index) && child ? child : `Loading...`}
                </div>
            );
        };
        return (
            <AutoSizer disableHeight>
                {({ width }) => (
                    <InfiniteLoader
                        isItemLoaded={(index) => index < options.length}
                        itemCount={itemCount}
                        loadMoreItems={loadMoreItems}
                    >
                        {({ onItemsRendered, ref }) => (
                            <List
                                className="List"
                                height={150}
                                itemCount={itemCount}
                                itemSize={35}
                                onItemsRendered={onItemsRendered}
                                ref={ref}
                                width={width}
                                overscanCount={4} //The number of options (rows or columns) to render outside of the visible area.
                            >
                                {Item}
                            </List>
                        )}
                    </InfiniteLoader>
                )}
            </AutoSizer>
        );
    };

    const handleChange = (selected) => {
        onChange(selected);
    };

    return (
        <Select
            placeholder={placeholder}
            // components=
            value={selectedOption}
            options={options}
            {...props}
        />
    );
};
export default SelectWrapper;