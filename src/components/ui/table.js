import PropTypes from "prop-types";

export function Table({ className = "", children }) {
  return (
    <table
      className={`w-full border-collapse text-sm dark:text-gray-300 ${className}`}
    >
      {children}
    </table>
  );
}
Table.propTypes = { className: PropTypes.string, children: PropTypes.node };

export const Thead = ({ children }) => <thead className="bg-gray-100 dark:bg-gray-800">{children}</thead>;
Thead.propTypes = { children: PropTypes.node };

export const Tbody = ({ children }) => <tbody>{children}</tbody>;
Tbody.propTypes = { children: PropTypes.node };

export const Tr = ({ children }) => (
  <tr className="border-b border-gray-200 dark:border-gray-700 last:border-none">
    {children}
  </tr>
);
Tr.propTypes = { children: PropTypes.node };

export const Th = ({ className = "", children }) => (
  <th className={`px-3 py-2 font-medium text-left ${className}`}>{children}</th>
);
Th.propTypes = { className: PropTypes.string, children: PropTypes.node };

export const Td = ({ className = "", children }) => (
  <td className={`px-3 py-1 align-top ${className}`}>{children}</td>
);
Td.propTypes = { className: PropTypes.string, children: PropTypes.node };
