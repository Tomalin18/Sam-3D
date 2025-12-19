# 使用 Google Colab 執行 SAM 3D Objects (Meta) 完整指南

## 為什麼選擇 SAM 3D Objects？

✅ **最強的 3D 理解能力**：能識別並分別重建場景中的不同物件  
✅ **完整的背面補全**：基於常識推理，即使看不到也能合理生成  
✅ **高品質紋理**：支援 Gaussian Splat 和 Textured Mesh 兩種輸出  
✅ **適合複雜場景**：如您的牛丼碗（碗、肉、飯、蔥花等多個物件）

---

## 步驟 1: 開啟 Google Colab 並設定 GPU

1. 前往 [Google Colab](https://colab.research.google.com/)
2. 建立新筆記本
3. **重要**：點擊 **「執行階段 → 變更執行階段類型」**
4. 選擇 **「T4 GPU」** 或 **「A100 GPU」**（如果有 Colab Pro）
5. 點擊「儲存」

---

## 步驟 2: 安裝 SAM 3D Objects

```python
# ========== Cell 1: 安裝依賴 ==========
!git clone https://github.com/facebookresearch/sam-3d-objects.git
%cd sam-3d-objects

# 安裝 PyTorch (CUDA 版本)
!pip install -q torch torchvision --index-url https://download.pytorch.org/whl/cu121

# 安裝其他依賴
!pip install -q huggingface-hub transformers diffusers accelerate
!pip install -q trimesh plyfile imageio opencv-python

print("✅ SAM 3D Objects 安裝完成！")
```

---

## 步驟 3: 登入 Hugging Face 並下載模型

SAM 3D Objects 的模型需要申請權限：

```python
# ========== Cell 2: 設定 Hugging Face Token ==========
from huggingface_hub import login

# 請先到 https://huggingface.co/settings/tokens 建立 Token
# 然後到 https://huggingface.co/facebook/sam-3d-objects 申請存取權限

token = input("請輸入您的 Hugging Face Token: ")
login(token=token)

print("✅ 已登入 Hugging Face")
```

**如何取得 Token**：
1. 前往 [Hugging Face Tokens](https://huggingface.co/settings/tokens)
2. 點擊 **「New token」**
3. 複製 Token
4. 前往 [SAM 3D Objects 模型頁面](https://huggingface.co/facebook/sam-3d-objects)
5. 點擊 **「Request access」** 並等待批准（通常幾分鐘內）

---

## 步驟 4: 上傳圖片

```python
# ========== Cell 3: 上傳圖片 ==========
from google.colab import files
from PIL import Image
import matplotlib.pyplot as plt

# 上傳圖片
print("📤 請選擇您要轉換的圖片...")
uploaded = files.upload()
filename = list(uploaded.keys())[0]

# 預覽圖片
img = Image.open(filename)
plt.figure(figsize=(10, 10))
plt.imshow(img)
plt.axis('off')
plt.title(f'上傳的圖片: {filename}')
plt.show()

print(f"✅ 圖片尺寸: {img.size}")
```

---

## 步驟 5: 執行 SAM 3D 生成

```python
# ========== Cell 4: 載入模型並生成 3D ==========
import sys
sys.path.append('notebook')
from inference import Inference, load_image

# 載入模型（第一次會下載，約 2-3 分鐘）
print("📥 載入 SAM 3D Objects 模型...")
config_path = "checkpoints/hf/pipeline.yaml"
inference = Inference(config_path, compile=False)
print("✅ 模型載入完成")

# 載入圖片
image = load_image(filename)

# 生成 3D（自動分割並重建所有物件）
print("🎨 開始生成 3D 模型...")
output = inference(image, seed=42)
print("✅ 3D 模型生成完成！")

# 儲存 Gaussian Splat (.ply)
output["gs"].save_ply("output.ply")
print("💾 已儲存: output.ply")
```

**執行時間**：約 20-40 秒（取決於圖片複雜度）

---

## 步驟 6: 下載結果

```python
# ========== Cell 5: 下載 3D 模型 ==========
from google.colab import files

# 下載 .ply 檔案
files.download('output.ply')
print("⬇️ 已下載 output.ply")

# 如果需要轉換為 .obj 格式
!pip install -q pymeshlab
import pymeshlab as ml

ms = ml.MeshSet()
ms.load_new_mesh('output.ply')
ms.save_current_mesh('output.obj')
files.download('output.obj')
print("⬇️ 已下載 output.obj")
```

---

## 進階功能：多物件場景重建

如果您的圖片包含多個物件（如牛丼碗中的碗、肉、飯），可以使用多物件模式：

```python
# ========== 進階: 多物件重建 ==========
from inference import load_multiple_masks

# SAM 3D 會自動偵測並分割多個物件
# 每個物件會生成獨立的 3D 模型

# 載入並處理多個物件
masks = load_multiple_masks(filename)  # 自動分割

for idx, mask in enumerate(masks):
    output = inference(image, mask, seed=42)
    output["gs"].save_ply(f"object_{idx}.ply")
    print(f"✅ 已生成物件 {idx}: object_{idx}.ply")

# 下載所有物件
import glob
for ply_file in glob.glob("object_*.ply"):
    files.download(ply_file)
```

---

## 完整 Colab Notebook（複製即用）

```python
# ===== 完整版本：一次執行所有步驟 =====

# Cell 1: 安裝
!git clone https://github.com/facebookresearch/sam-3d-objects.git
%cd sam-3d-objects
!pip install -q torch torchvision --index-url https://download.pytorch.org/whl/cu121
!pip install -q huggingface-hub transformers diffusers accelerate trimesh plyfile imageio opencv-python

# Cell 2: 登入 HF
from huggingface_hub import login
token = input("Hugging Face Token: ")
login(token=token)

# Cell 3: 上傳圖片
from google.colab import files
uploaded = files.upload()
filename = list(uploaded.keys())[0]

# Cell 4: 生成 3D
import sys
sys.path.append('notebook')
from inference import Inference, load_image

inference = Inference("checkpoints/hf/pipeline.yaml", compile=False)
image = load_image(filename)
output = inference(image, seed=42)
output["gs"].save_ply("output.ply")

# Cell 5: 下載
files.download('output.ply')
print("✅ 完成！")
```

---

## 與 TripoSR 的比較

| 特性 | SAM 3D Objects | TripoSR |
|------|----------------|---------|
| **速度** | ~30 秒 | ~5 秒 |
| **品質** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **多物件支援** | ✅ 優秀 | ❌ 單物件 |
| **背面補全** | ✅ 基於語義理解 | ✅ 基於幾何推測 |
| **複雜場景** | ✅ 優秀（如牛丼碗） | ⚠️ 一般 |
| **需要權限** | ✅ 需申請 HF 權限 | ❌ 無需權限 |

**建議**：
- 如果追求**最高品質**和**複雜場景** → 使用 **SAM 3D Objects**
- 如果追求**速度**和**簡單使用** → 使用 **TripoSR**

---

## 常見問題

### Q: 為什麼需要 Hugging Face Token？
**A**: SAM 3D Objects 是 Meta 的研究模型，需要申請權限才能下載。申請通常在幾分鐘內批准。

### Q: 可以在本地查看 .ply 檔案嗎？
**A**: 可以！使用：
- **線上**：[PlayCanvas SuperSplat](https://playcanvas.com/supersplat/editor)
- **桌面**：您現有的網頁 UI（已有 3D 查看器）

### Q: SAM 3D 和 SHARP 可以一起用嗎？
**A**: 可以！建議：
- **快速預覽**：用 SHARP（本地，1 秒）
- **最終輸出**：用 SAM 3D（Colab，30 秒）

### Q: 如果申請 HF 權限被拒怎麼辦？
**A**: 改用 **InstantMesh**（不需權限，品質也很好）。我可以提供 InstantMesh 的 Colab 指南。

---

## 下一步

如果您想要：
1. **InstantMesh 的 Colab 指南**（不需權限，品質介於兩者之間）
2. **整合到您的網頁 UI**（自動化上傳/下載）
3. **批次處理多張圖片**

請告訴我，我可以繼續協助！
