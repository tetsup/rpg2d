import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Activity, Bot, Image, Layers, LayoutGrid, Map, PanelsTopLeft, PersonStanding, Type, User } from 'lucide-react';
import { MenuCard } from '@base/components/form-control/menu-card';
import { FormSection } from '@base/components/form-field/form-section';

export function ResourceTypes() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
      <FormSection title={t('フィールド')} description={t('物語の舞台と登場人物、ストーリーを組み立てます')}>
        <MenuCard
          icon={Map}
          title={t('フィールドマップ')}
          description={t('世界やダンジョン、街などの地図')}
          onClick={() => navigate('/resources/field')}
        />
        <MenuCard
          icon={User}
          title={t('プレイヤー')}
          description={t('主人公や仲間の見た目、ステータス')}
          onClick={() => navigate('/resources/player')}
        />
        <MenuCard
          icon={Bot}
          title={t('エンティティ')}
          description={t('地図上に配置する登場人物やギミック')}
          onClick={() => navigate('/resources/entity')}
        />
        <MenuCard
          icon={Activity}
          title={t('イベント')}
          description={t('条件を満たすと動き出すプログラム')}
          onClick={() => navigate('/resources/action')}
        />
      </FormSection>
      <FormSection
        title={t('グラフィック')}
        description={t('キャラクターや地形など、画面上に表示される見た目の素材を作ります。')}
      >
        <MenuCard
          icon={Image}
          title={t('イメージ')}
          description={t('全ての表示の元になる、1枚単位の画像')}
          onClick={() => navigate('/resources/image')}
        />
        <MenuCard
          icon={Layers}
          title={t('テクスチャ')}
          description={t('複数画像を重ね合わせた、画面上での表示単位')}
          onClick={() => navigate('/resources/texture')}
        />
        <MenuCard
          icon={LayoutGrid}
          title={t('タイル')}
          description={t('マップに配置する床パーツ')}
          onClick={() => navigate('/resources/tile')}
        />
        <MenuCard
          icon={PersonStanding}
          title={t('スキン')}
          description={t('4方向を持ったキャラクターの見た目')}
          onClick={() => navigate('/resources/skin')}
        />
      </FormSection>
      <FormSection title={t('インターフェース')} description={t('メニューなどの表示領域のカスタマイズ')}>
        <MenuCard
          icon={PanelsTopLeft}
          title={t('パネルスキン')}
          description={t('メニュー・メッセージウィンドウの見た目')}
          onClick={() => navigate('/resources/panel-skin')}
        />
        <MenuCard
          icon={Type}
          title={t('フォント')}
          description={t('ゲーム内文字の見た目')}
          onClick={() => navigate('/resources/font')}
        />
        <MenuCard
          icon={PanelsTopLeft}
          title={t('パネル')}
          description={t('メッセージ・メニューなどの画面配置・内容')}
          onClick={() => navigate('/resources/panel')}
        />
      </FormSection>
    </>
  );
}
