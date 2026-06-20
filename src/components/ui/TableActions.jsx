const indexHeaderClass =
  'w-14 px-5 py-3 text-left text-xs font-semibold tracking-wide text-gray-500';

const indexCellClass = 'px-5 py-4 text-sm font-medium text-gray-500';

const actionHeaderClass =
  'px-5 py-3 text-right text-xs font-semibold tracking-wide text-gray-500';

const actionCellClass = 'px-5 py-4 text-right';

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
      <div className="flex items-center justify-end gap-2">{children}</div>
    </td>
  );
}
