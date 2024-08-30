// src/table/Table.tsx
import React from 'react';

interface TableProps {
    columns: string[];
    data: { [key: string]: any }[];
}

const Table: React.FC<TableProps> = ({ columns, data }) => {
    return (
        <table className="min-w-full bg-white border border-gray-200">
            <thead>
                <tr>
                    {columns.map((column, index) => (
                        <th key={index} className="py-2 px-4 border-b border-gray-200 text-left">
                            {column}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {columns.map((column, colIndex) => (
                            <td key={colIndex} className="py-2 px-4 border-b border-gray-200">
                                {row[column]}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default Table;
