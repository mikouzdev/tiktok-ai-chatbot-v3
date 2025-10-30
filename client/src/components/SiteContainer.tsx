function Container(props: { className: string; children: React.ReactNode }) {
  return <div className={props.className}>{props.children}</div>;
}

export default Container;
