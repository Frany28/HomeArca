import clsx from "clsx";

import "./MovingGradientTitle.css";

function MovingGradientTitle({ children, className, ...props }) {
  return (
    <h2
      className={clsx("services-moving-gradient-title", className)}
      data-node-id="4462:2840"
      {...props}
    >
      {children}
    </h2>
  );
}

export default MovingGradientTitle;
