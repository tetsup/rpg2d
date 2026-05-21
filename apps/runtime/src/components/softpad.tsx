export function SoftPad() {
  return (
    <>
      <div className="softpad softpad-left">
        <button data-pad="up">↑</button>
        <div>
          <button data-pad="left">←</button>
          <button data-pad="right">→</button>
        </div>
        <button data-pad="down">↓</button>
      </div>
      <div className="softpad softpad-right">
        <button data-pad="enter">A</button>
        <button data-pad="esc">B</button>
      </div>
    </>
  );
}
