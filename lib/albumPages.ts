// じぶんのシールちょう用のページテーマ定義 (MVP: 3 ページ固定)
// 背景画像は将来 Codex で生成予定。今は単色グラデで表現する。

export type AlbumPageTheme = {
  id: string;
  title: string;
  readAloud: string;
  gradient: string; // CSS gradient
  accent: string;   // 枠線色
};

export const ALBUM_PAGE_THEMES: AlbumPageTheme[] = [
  {
    id: "rainbow",
    title: "にじのページ",
    readAloud: "にじの ページ！",
    gradient:
      "linear-gradient(135deg, #fff7e0 0%, #ffe3ef 30%, #e0f4ff 60%, #f1e1ff 100%)",
    accent: "#ff6fa8",
  },
  {
    id: "sea",
    title: "うみのページ",
    readAloud: "うみの ページ！",
    gradient:
      "linear-gradient(180deg, #d4f0ff 0%, #a6d9f5 55%, #7bb8e0 100%)",
    accent: "#3fb0ff",
  },
  {
    id: "sweets",
    title: "おかしのページ",
    readAloud: "おかしの ページ！",
    gradient:
      "linear-gradient(135deg, #fff0f6 0%, #ffd1e0 40%, #ffe8b3 100%)",
    accent: "#ffcf3a",
  },
];
