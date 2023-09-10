import DataTable from 'react-data-table-component';
import { memo } from 'react';

const paginationComponentOptions = {
    // noRowsPerPage: false,
}

const Table = ({ tableData, columns }) => {

    return (
        <>
            <DataTable
                columns={columns}
                data={tableData}
                paginationComponentOptions={paginationComponentOptions}
                pagination
                highlightOnHover
            />
        </>
    );
}

export default memo(Table);