import DataTable from "react-data-table-component";
import MyErrorBoundary from "./error-boundary.component";
import { memo } from "react";

interface TableProps {
  tableData: any[][];
  columns: any[];
  tableProgress: boolean;
  resetHandler: () => void;
}

const paginationComponentOptions = {
  // noRowsPerPage: true,
};

const customStyles = {
  rows: {
    style: {
      minHeight: "25px",
    },
  },
};

const Table: React.FC<TableProps> = ({
  tableData,
  columns,
  tableProgress,
  resetHandler,
}) => {
  return (
    <MyErrorBoundary resetHandler={resetHandler}>
      <DataTable
        paginationPerPage={100}
        paginationRowsPerPageOptions={[100]}
        progressPending={tableProgress}
        columns={columns}
        data={tableData}
        paginationComponentOptions={paginationComponentOptions}
        pagination
        highlightOnHover
        noDataComponent={
          <h1 style={{ padding: "20px", fontSize: "24px", fontWeight: "400" }}>
            Select a .csv file to begin.
          </h1>
        }
        fixedHeader
        fixedHeaderScrollHeight={"70vh"}
        customStyles={customStyles}
      />
    </MyErrorBoundary>
  );
};

export default memo(Table);
