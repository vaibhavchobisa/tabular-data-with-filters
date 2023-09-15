import DataTable from 'react-data-table-component';
import { memo } from 'react';

const paginationComponentOptions = {
    // noRowsPerPage: true,
}

const customStyles = {
    rows: {
        style: {
            minHeight: '25px',
        }
    }
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
                noDataComponent={<h1 style={{ padding: '20px', fontSize: '24px', fontWeight: '400' }}>Select a .csv file to begin.</h1>}
                fixedHeader
                fixedHeaderScrollHeight={"70vh"}
                customStyles={customStyles}
            />
        </>
    );
}

export default memo(Table);