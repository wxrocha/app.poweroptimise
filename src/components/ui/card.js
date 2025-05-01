import PropTypes from "prop-types";

/**
 * Simple Card component (shadcn/ui–style) built with Tailwind.
 * Usage:
 *   <Card>
 *     <CardHeader>Title</CardHeader>
 *     <CardContent>…children…</CardContent>
 *   </Card>
 */
export function Card({ className = "", children }) {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white shadow-sm dark:bg-gray-900 dark:border-gray-800 ${className}`}
    >
      {children}
    </div>
  );
}
Card.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export function CardHeader({ className = "", children }) {
  return (
    <div className={`px-4 pt-4 pb-2 font-semibold text-lg ${className}`}>
      {children}
    </div>
  );
}
CardHeader.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export function CardContent({ className = "", children }) {
  return <div className={`px-4 pb-4 ${className}`}>{children}</div>;
}
CardContent.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export function CardFooter({ className = "", children }) {
  return <div className={`px-4 pt-2 pb-4 ${className}`}>{children}</div>;
}
CardFooter.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

