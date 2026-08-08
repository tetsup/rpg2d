import React, { useState } from 'react';

// ブロックの型定義
type BlockType = 'move' | 'turn' | 'wait' | 'repeat';

interface Block {
  id: string;
  type: BlockType;
  label: string;
  color: string;
  children?: Block[]; // repeat型の場合に子ブロックを格納する配列
}

// 初期データ（スタートノード）
const initialBlocks: Block[] = [{ id: 'start', type: 'move', label: '▶ 旗が押されたとき', color: '#ffab19' }];

export default function ScratchStylePuzzle() {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);

  // ポップアップメニューの状態
  const [menuState, setMenuState] = useState<{
    parentId: string | null; // どの階層か（nullなら最上位）
    targetIndex: number; // どのブロックの後ろに挿入するか
    x: number;
    y: number;
  } | null>(null);

  // 1. メニューを開く
  const openMenu = (parentId: string | null, targetIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuState({ parentId, targetIndex, x: e.clientX, y: e.clientY });
  };

  // 2. 指定した階層の指定位置にブロックを挿入する（再帰関数）
  const insertBlockAt = (
    currentBlocks: Block[],
    parentId: string | null,
    targetIndex: number,
    newBlock: Block
  ): Block[] => {
    // 最上位レイヤーへの挿入の場合
    if (parentId === null) {
      const updated = [...currentBlocks];
      updated.splice(targetIndex + 1, 0, newBlock);
      return updated;
    }

    // 子階層（repeatの中など）を探して挿入する場合
    return currentBlocks.map((block) => {
      if (block.id === parentId && block.children) {
        const updatedChildren = [...block.children];
        updatedChildren.splice(targetIndex + 1, 0, newBlock);
        return { ...block, children: updatedChildren };
      } else if (block.children) {
        // さらに深い階層を再帰的に探索
        return { ...block, children: insertBlockAt(block.children, parentId, targetIndex, newBlock) };
      }
      return block;
    });
  };

  // 3. メニューからブロックを選択したときの処理
  const handleAddBlock = (type: BlockType) => {
    if (!menuState) return;
    const { parentId, targetIndex } = menuState;

    let label = '';
    let color = '#4c97ff';
    let children: Block[] | undefined = undefined;

    if (type === 'move') {
      label = '10 歩動かす';
      color = '#4c97ff';
    }
    if (type === 'turn') {
      label = '15 度回す';
      color = '#4c97ff';
    }
    if (type === 'wait') {
      label = '1 秒待つ';
      color = '#ff6680';
    }
    if (type === 'repeat') {
      label = '10 回繰り返す';
      color = '#34ace0';
      children = []; // 繰り返しブロックは子要素を持てるように空配列を初期化
    }

    const newBlock: Block = { id: `block-${Date.now()}`, type, label, color, children };

    setBlocks((prev) => insertBlockAt(prev, parentId, targetIndex, newBlock));
    setMenuState(null);
  };

  // 4. ブロックを削除する（再帰関数）
  const deleteBlockFrom = (currentBlocks: Block[], targetId: string): Block[] => {
    return currentBlocks
      .filter((block) => block.id !== targetId)
      .map((block) => {
        if (block.children) {
          return { ...block, children: deleteBlockFrom(block.children, targetId) };
        }
        return block;
      });
  };

  const handleDeleteBlock = (id: string) => {
    setBlocks((prev) => deleteBlockFrom(prev, id));
  };

  // --- 再帰的にブロックの列を描画するコンポーネント ---
  const RenderBlockList = ({ list, parentId }: { list: Block[]; parentId: string | null }) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        {list.map((block, index) => (
          <React.Fragment key={block.id}>
            {/* 通常のブロック、または繰り返しブロックの外枠 */}
            <div
              style={{
                background: block.color,
                color: '#fff',
                borderRadius: '4px',
                width: 240,
                padding: '10px 12px',
                fontWeight: 'bold',
                fontSize: '14px',
                fontFamily: 'sans-serif',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{block.label}</span>
                {block.id !== 'start' && (
                  <button onClick={() => handleDeleteBlock(block.id)} style={deleteBtnStyle}>
                    ✕
                  </button>
                )}
              </div>

              {/* 繰り返し（repeat）ブロックの場合の中身の表示エリア */}
              {block.type === 'repeat' && block.children && (
                <div
                  style={{
                    borderLeft: '15px solid rgba(0, 0, 0, 0.15)', // 左側の太い縦ライン（コの字を表現）
                    paddingLeft: '10px',
                    marginTop: '10px',
                    minHeight: '40px', // 空のときでもある程度高さを確保
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '2px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* 内側の最初の「＋」ボタン */}
                  <button onClick={(e) => openMenu(block.id, -1, e)} style={addBtnStyle}>
                    +
                  </button>

                  {/* 内側の子ブロックたちを再帰呼び出し */}
                  <RenderBlockList list={block.children} parentId={block.id} />
                </div>
              )}
            </div>

            {/* ブロックとブロックの間の 「＋」追加ボタン */}
            <button onClick={(e) => openMenu(parentId, index, e)} style={addBtnStyle}>
              +
            </button>
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div
      style={{ width: '100vw', height: '100vh', background: '#fafafa', padding: '40px' }}
      onClick={() => setMenuState(null)}
    >
      {/* 最初のブロックの手前（最上部）に追加したい場合のボタン */}
      <button onClick={(e) => openMenu(null, -1, e)} style={addBtnStyle}>
        +
      </button>

      {/* ブロックツリーのレンダリング開始 */}
      <RenderBlockList list={blocks} parentId={null} />

      {/* ポップアップメニュー */}
      {menuState && (
        <div
          style={{
            position: 'fixed',
            top: menuState.y,
            left: menuState.x,
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 9999,
            padding: '6px 0',
            display: 'flex',
            flexDirection: 'column',
            minWidth: '140px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button style={menuItemStyle} onClick={() => handleAddBlock('move')}>
            歩数を動かす
          </button>
          <button style={menuItemStyle} onClick={() => handleAddBlock('turn')}>
            角度を回す
          </button>
          <button style={menuItemStyle} onClick={() => handleAddBlock('wait')}>
            時間を待つ
          </button>
          <button style={menuItemStyle} onClick={() => handleAddBlock('repeat')}>
            ◯回繰り返す
          </button>
        </div>
      )}
    </div>
  );
}

// スタイル定義
const deleteBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#fff',
  opacity: 0.6,
  cursor: 'pointer',
  fontSize: '14px',
};
const menuItemStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  padding: '10px 16px',
  textAlign: 'left',
  cursor: 'pointer',
  fontSize: '13px',
  color: '#333',
};
const addBtnStyle: React.CSSProperties = {
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  background: '#33d9b2',
  border: '2px solid #fff',
  color: '#fff',
  fontSize: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  margin: '4px 0 4px 20px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  zIndex: 5,
};
