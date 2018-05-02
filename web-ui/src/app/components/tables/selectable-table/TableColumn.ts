/** Columns to be used in selectable-table component */
interface TableColumn<T> {
    field: keyof T;
    header: string;
}

export { TableColumn };
