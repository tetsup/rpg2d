export function SoftPad() {
  return (
    <>
      <div className="softpad softpad-leftside">
        <button className="softpad-up" data-pad="up">
          ↑
        </button>
        <button className="softpad-left" data-pad="left">
          ←
        </button>
        <button className="softpad-right" data-pad="right">
          →
        </button>
        <button className="softpad-down" data-pad="down">
          ↓
        </button>
      </div>
      <div className="softpad softpad-rightside">
        <button data-pad="esc">B</button>
        <button data-pad="enter">A</button>
      </div>
    </>
  );
}
