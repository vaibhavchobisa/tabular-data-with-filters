import DataTable from 'react-data-table-component';
import { memo } from 'react';

const paginationComponentOptions = {
    // noRowsPerPage: true,
}

// eslint-disable-next-line react/prop-types
const Table = ({ tableData, columns, tableProgress }) => {

    return (
        <>
            <DataTable
                paginationPerPage={100}
                paginationRowsPerPageOptions={[100]}
                progressPending={tableProgress}
                columns={columns}
                data={tableData}
                paginationComponentOptions={paginationComponentOptions}
                pagination
                highlightOnHover
            // fixedHeader
            // fixedHeaderScrollHeight={"300px"}
            />
        </>
    );
}

export default memo(Table);