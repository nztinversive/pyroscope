"""Cog predictor for PyroScope fire/smoke detection on Replicate."""
import os
os.environ["POLARS_SKIP_CPU_CHECK"] = "1"

from cog import BasePredictor, Input, Path
from ultralytics import YOLO
from PIL import Image
import json
import io
import tempfile


class Predictor(BasePredictor):
    def setup(self):
        """Load the YOLO model."""
        self.model = YOLO("best.pt")
        # Warm up
        import numpy as np
        dummy = np.zeros((640, 640, 3), dtype=np.uint8)
        self.model.predict(source=dummy, verbose=False)

    def predict(
        self,
        image: Path = Input(description="Image to analyze for fire/smoke"),
        confidence: float = Input(
            description="Minimum confidence threshold",
            default=0.25,
            ge=0.01,
            le=1.0,
        ),
        return_annotated: bool = Input(
            description="Return annotated image with bounding boxes",
            default=True,
        ),
    ) -> Path:
        """Run fire/smoke detection on an image."""
        img = Image.open(str(image)).convert("RGB")
        
        import numpy as np
        img_array = np.array(img)[:, :, ::-1].copy()  # RGB to BGR
        
        results = self.model.predict(
            source=img_array,
            conf=confidence,
            verbose=False,
        )
        
        result = results[0]
        w, h = img.size
        
        detections = []
        for box in result.boxes:
            cls_id = int(box.cls[0])
            detections.append({
                "class": result.names[cls_id],
                "confidence": round(float(box.conf[0]), 4),
                "bbox": [round(float(v)) for v in box.xyxy[0]],
            })
        
        if return_annotated:
            # Return annotated image
            annotated = result.plot()
            ann_img = Image.fromarray(annotated[..., ::-1])
            output_path = Path(tempfile.mktemp(suffix=".jpg"))
            ann_img.save(str(output_path), quality=90)
            return output_path
        else:
            # Return JSON results as a text file
            output = {
                "image_size": [w, h],
                "detections": detections,
                "has_fire": any(d["class"] == "fire" for d in detections),
                "has_smoke": any(d["class"] == "smoke" for d in detections),
                "model": "pyroscope-v1-yolo11s",
            }
            output_path = Path(tempfile.mktemp(suffix=".json"))
            with open(str(output_path), "w") as f:
                json.dump(output, f, indent=2)
            return output_path
