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
                noDataComponent={<h1 style={{ padding: '20px', fontSize: '24px', fontWeight: '400' }}>Click on Choose File & select a .csv file to begin.</h1>}
                fixedHeader
                fixedHeaderScrollHeight={"70vh"}
            />
        </>
    );
}

export default memo(Table);