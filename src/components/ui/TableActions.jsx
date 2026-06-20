export const tableThClass =
  'px-4 py-2 text-left text-xs font-semibold tracking-wide text-gray-500';

export const tableTdClass = 'px-4 py-2 text-sm';

const indexHeaderClass = `w-12 ${tableThClass}`;

const indexCellClass = `${tableTdClass} font-medium text-gray-500`;

const actionHeaderClass = `${tableThClass} text-right`;

const actionCellClass = `${tableTdClass} text-right`;

export function TableIndexHeader({ label = '#' }) {
  return <th className={indexHeaderClass}>{label}</th>;
}

export function TableIndexCell({ index }) {
  return <td className={indexCellClass}>{index}</td>;
}

export function TableActionHeader({ label = 'ACTION' }) {
  return <th className={actionHeaderClass}>{label}</th>;
}

export function TableActionCell({ children }) {
  return (
    <td className={actionCellClass}>
      <div className="flex items-center justify-end gap-1">{children}</div>
    </td>
  );
}
