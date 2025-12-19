# 使用 Google Colab 執行 TripoSR 完整指南

## 步驟 1: 開啟 Google Colab

1. 前往 [Google Colab](https://colab.research.google.com/)
2. 點擊 **「新增筆記本」** 或 **「File → New notebook」**
3. 確認右上角顯示 **「已連線」** (如果沒有，點擊「連線」按鈕)

---

## 步驟 2: 設定 GPU 加速

1. 點擊選單 **「執行階段 (Runtime) → 變更執行階段類型 (Change runtime type)」**
2. 在 **「硬體加速器 (Hardware accelerator)」** 下拉選單中選擇 **「T4 GPU」**
3. 點擊 **「儲存 (Save)」**

---

## 步驟 3: 安裝 TripoSR

在第一個程式碼格 (cell) 中貼上以下指令，然後按 `Shift + Enter` 執行：

```python
# 安裝 TripoSR
!git clone https://github.com/VAST-AI-Research/TripoSR.git
%cd TripoSR
!pip install -q -r requirements.txt

print("✅ TripoSR 安裝完成！")
```

**執行時間**：約 2-3 分鐘

---

## 步驟 4: 上傳您的圖片

在新的程式碼格中執行：

```python
from google.colab import files
import shutil

# 上傳圖片
print("📤 請選擇您要轉換的圖片...")
uploaded = files.upload()

# 取得上傳的檔案名稱
filename = list(uploaded.keys())[0]
print(f"✅ 已上傳: {filename}")
```

執行後會出現 **「選擇檔案」** 按鈕，點擊並選擇您的牛丼圖片。

---

## 步驟 5: 生成 3D 模型

```python
# 執行 TripoSR 生成 3D 模型
!python run.py {filename} --output-dir ./output/

print("✅ 3D 模型生成完成！")
```

**執行時間**：約 5-10 秒

---

## 步驟 6: 下載結果

```python
# 列出生成的檔案
!ls -lh output/

# 下載 .obj 檔案 (帶貼圖的 3D 模型)
import os
from google.colab import files

output_files = os.listdir('output/')
for file in output_files:
    if file.endswith('.obj') or file.endswith('.mtl') or file.endswith('.png'):
        files.download(f'output/{file}')
        print(f"⬇️ 下載: {file}")
```

---

## 步驟 7: 在本地查看 3D 模型

下載的檔案可以用以下工具開啟：

### 線上查看器（推薦）
1. **[3D Viewer Online](https://3dviewer.net/)**
   - 直接拖入 `.obj` 檔案即可查看
   - 支援 360° 旋轉

2. **[PlayCanvas SuperSplat](https://playcanvas.com/supersplat/editor)**
   - 如果有 `.ply` 檔案可以用這個

### 桌面軟體
- **Blender** (免費)：專業 3D 軟體
- **MeshLab** (免費)：輕量級 3D 查看器

---

## 完整 Colab Notebook 範例

您也可以直接複製以下完整程式碼到一個 Colab notebook：

```python
# ========== Cell 1: 安裝 TripoSR ==========
!git clone https://github.com/VAST-AI-Research/TripoSR.git
%cd TripoSR
!pip install -q -r requirements.txt
print("✅ 安裝完成")

# ========== Cell 2: 上傳圖片 ==========
from google.colab import files
uploaded = files.upload()
filename = list(uploaded.keys())[0]
print(f"✅ 已上傳: {filename}")

# ========== Cell 3: 生成 3D ==========
!python run.py {filename} --output-dir ./output/
print("✅ 生成完成")

# ========== Cell 4: 下載結果 ==========
import os
output_files = os.listdir('output/')
for file in output_files:
    if file.endswith(('.obj', '.mtl', '.png', '.ply')):
        files.download(f'output/{file}')
        print(f"⬇️ {file}")
```

---

## 常見問題

### Q: 為什麼顯示「未連線到 GPU」？
**A**: 重新執行步驟 2，確保選擇了 T4 GPU。免費版 Colab 有使用時數限制。

### Q: 可以一次處理多張圖片嗎？
**A**: 可以！修改 Cell 2 和 Cell 3：

```python
# Cell 2: 上傳多張圖片
uploaded = files.upload()

# Cell 3: 批次處理
for filename in uploaded.keys():
    !python run.py {filename} --output-dir ./output/
```

### Q: 生成的模型背面是空的？
**A**: TripoSR 會自動補全背面。如果還是有問題，可能是：
- 原始圖片背景太複雜（建議使用去背後的圖片）
- 物體遮擋過多

### Q: 如何整合到我的網頁 UI？
**A**: 這需要使用 Colab 的 API 或改用 Replicate/Hugging Face Spaces。如果需要，我可以幫您設定。

---

## 下一步

如果您想要更自動化的流程（不用每次手動上傳下載），我可以幫您：
1. 設定 Replicate API 整合到現有網頁
2. 使用 Hugging Face Spaces 建立專屬的 3D 生成服務
3. 設定自動化的 Colab workflow

請告訴我您的需求！
