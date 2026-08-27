'use client';

import { HTMLAttributes, forwardRef } from 'react';

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  striped?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
}

export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ striped = false, hoverable = false, bordered = true, className = '', children, ...props }, ref) => {
    const tableClasses = `
      w-full text-sm font-sans
      ${striped ? 'divide-y divide-[#E2DFD9]' : ''}
      ${hoverable ? 'hover:bg-[#FAF8F3]' : ''}
      ${bordered ? 'border border-[#E2DFD9] rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]' : ''}
      ${className}
    `;

    return (
      <div className="overflow-x-auto">
        <table ref={ref} className={tableClasses} {...props}>
          {children}
        </table>
      </div>
    );
  }
);

export const TableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className = '', children, ...props }, ref) => (
    <thead
      ref={ref}
      className={`border-b border-[#E2DFD9] text-left text-[10px] uppercase tracking-[0.1em] text-[#7D7A74] font-semibold ${className}`}
      {...props}
    >
      {children}
    </thead>
  )
);

export const TableHead = forwardRef<HTMLTableCellElement, HTMLAttributes<HTMLTableCellElement>>(
  ({ className = '', children, ...props }, ref) => (
    <th ref={ref} className={`px-4 py-3 font-semibold text-[#1A1A18] ${className}`} {...props}>
      {children}
    </th>
  )
);

export const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className = '', children, ...props }, ref) => (
    <tbody ref={ref} className={className} {...props}>
      {children}
    </tbody>
  )
);

export const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  ({ className = '', children, ...props }, ref) => (
    <tr
      ref={ref}
      className={`border-b border-[#E2DFD9] transition-colors duration-150 ${className}`}
      {...props}
    >
      {children}
    </tr>
  )
);

export const TableCell = forwardRef<HTMLTableCellElement, HTMLAttributes<HTMLTableCellElement>>(
  ({ className = '', children, ...props }, ref) => (
    <td ref={ref} className={`px-4 py-3 text-[#5C5A54] ${className}`} {...props}>
      {children}
    </td>
  )
);

export default Table;
