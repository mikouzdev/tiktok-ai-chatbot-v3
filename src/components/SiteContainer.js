import React from "react";

function Container(props) {
  return <div className={props.className}>{props.children}</div>;
}

export default Container;
