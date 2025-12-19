# ML-SHARP Web UI

基於 Apple SHARP 模型的 Web 介面，用於快速生成 3D Gaussian Splats，並整合 Meta SAM 3D Objects 用於高品質 360° 3D 重建。

## 🎯 專案簡介

本專案提供兩種 3D 生成工作流程：

| 工作流程 | 模型 | 速度 | 品質 | 360° 完整 | 使用場景 |
|---------|------|------|------|----------|---------|
| **本地快速** | SHARP (Apple) | ~1 秒 | ⭐⭐⭐ | ❌ (2.5D) | 快速預覽、測試 |
| **雲端高品質** | SAM 3D Objects (Meta) | ~30 秒 | ⭐⭐⭐⭐⭐ | ✅ (完整) | 最終輸出、複雜場景 |

## 📁 專案結構

```
ml-sharp/
├── README.md                    # 本文件
├── .gitignore                   # Git 忽略規則
│
├── data/                        # SHARP 模型資料
├── src/                         # SHARP 源碼
│
├── web-ui/                      # Web 介面（Next.js + Express）
│   ├── server.js                # Express 後端 API
│   ├── src/                     # Next.js 前端
│   │   ├── app/                 # 頁面和樣式
│   │   └── components/          # React 組件（3D 查看器）
│   ├── outputs/                 # 生成的 .ply 檔案（已忽略）
│   └── uploads/                 # 上傳的圖片（已忽略）
│
└── colab/                       # Google Colab Notebooks
    ├── SAM3D_Colab.ipynb        # SAM 3D Objects notebook
    └── README.md                # Colab 使用說明
```

## 🚀 快速開始

### 工作流程 A: 本地快速生成（SHARP）

適用於快速測試和預覽。

#### 1. 安裝依賴

```bash
# 安裝 Python 依賴（SHARP 模型）
python3.13 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 安裝 Node.js 依賴（Web UI）
cd web-ui
npm install
```

#### 2. 啟動服務

```bash
# 終端 1: 啟動後端
cd web-ui
node server.js

# 終端 2: 啟動前端
cd web-ui
npm run dev
```

#### 3. 使用

1. 開啟瀏覽器訪問 http://localhost:3000
2. 上傳圖片（拖放或點擊選擇）
3. 等待約 1 秒生成
4. 查看 3D 預覽或下載 .ply 檔案

**限制**：只能看到正面和周圍，背面會是空的或模糊的（2.5D 特性）。

---

### 工作流程 B: 雲端高品質生成（SAM 3D Objects）

適用於需要完整 360° 模型的場景。

#### 1. 準備工作

1. 註冊 [Hugging Face](https://huggingface.co/) 帳號
2. 建立 [Access Token](https://huggingface.co/settings/tokens)
3. 申請 [SAM 3D Objects](https://huggingface.co/facebook/sam-3d-objects) 權限

#### 2. 執行 Colab

1. 開啟 [Google Colab](https://colab.research.google.com/)
2. 上傳 `colab/SAM3D_Colab.ipynb`
3. 設定 GPU：執行階段 → 變更執行階段類型 → T4 GPU
4. 依序執行所有 Cell
5. 下載生成的 .ply 檔案

#### 3. 本地查看

將下載的 .ply 檔案放到 `web-ui/outputs/` 目錄，然後：
- 重新整理 http://localhost:3000
- 或上傳到 [PlayCanvas SuperSplat](https://playcanvas.com/supersplat/editor)

**優點**：完整的 360° 模型，可以從任意角度查看，包含完整的背面。

---

## 🛠️ 技術棧

### 前端
- **Framework**: Next.js 15 + React 19
- **Styling**: Tailwind CSS
- **3D Viewer**: @mkkellogg/gaussian-splats-3d
- **Icons**: Lucide React

### 後端
- **Runtime**: Node.js
- **Framework**: Express.js
- **File Upload**: Multer
- **CORS**: cors

### AI 模型
- **SHARP**: Apple 的單目 3D Gaussian Splatting
- **SAM 3D Objects**: Meta 的完整 3D 重建模型

---

## 📖 詳細文檔

- [Colab 使用指南](colab/README.md)
- [SHARP 官方文檔](https://github.com/apple/ml-sharp)
- [SAM 3D Objects 官方文檔](https://github.com/facebookresearch/sam-3d-objects)

---

## 🔧 開發

### 本地開發

```bash
# 後端開發（自動重啟）
cd web-ui
npm run dev

# 前端開發
cd web-ui
npm run dev
```

### 新增功能

1. Fork 本倉庫
2. 創建功能分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 開啟 Pull Request

---

## ⚠️ 常見問題

### Q: 為什麼 SHARP 生成的模型背面是空的？
**A**: SHARP 是單目視角合成模型，只能生成相機視角周圍的 2.5D 結構。如需完整 360° 模型，請使用 SAM 3D Objects（Colab）。

### Q: Colab 顯示「No module named 'inference'」？
**A**: 確保步驟 1 成功克隆了 `facebookresearch/sam-3d-objects` 倉庫。檢查 `/content/sam-3d-objects/` 目錄是否存在。

### Q: 如何在 Web UI 中查看 Colab 生成的模型？
**A**: 將 .ply 檔案放到 `web-ui/outputs/` 目錄，重新整理頁面即可。

### Q: 可以批次處理多張圖片嗎？
**A**: 本地 Web UI 目前一次處理一張。Colab 可以修改程式碼進行批次處理。

---

## 📄 授權

- SHARP 模型：Apple 授權
- SAM 3D Objects：Meta 授權
- Web UI 程式碼：MIT 授權

---

## 🙏 致謝

- [Apple ML Research](https://github.com/apple/ml-sharp) - SHARP 模型
- [Meta AI Research](https://github.com/facebookresearch/sam-3d-objects) - SAM 3D Objects
- [@mkkellogg](https://github.com/mkkellogg/GaussianSplats3D) - Gaussian Splats 3D 查看器
