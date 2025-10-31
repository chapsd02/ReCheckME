import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult } from '../types';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

export const analyzeMeterImage = async (imageFile: File): Promise<AnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API key is not configured. Please set the API_KEY environment variable.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-2.5-pro';

  const imageBase64 = await fileToBase64(imageFile);

  const prompt = `คุณคือผู้เชี่ยวชาญ AI ระดับโลกด้านการวิเคราะห์ภาพ (OCR) สำหรับมิเตอร์ไฟฟ้าในประเทศไทยโดยเฉพาะ ภารกิจหลักของคุณคือการอ่านค่าหน่วยบนหน้าปัดให้มีความแม่นยำสูงสุดเท่าที่จะเป็นไปได้ โดยเฉพาะอย่างยิ่งกับภาพที่เบลอหรือไม่ชัดเจน โปรดวิเคราะห์ภาพที่แนบมาและตอบกลับเป็น JSON object ที่ถูกต้องตาม schema เท่านั้น ห้ามมีข้อความอธิบายหรือ markdown ใดๆ นอกเหนือจาก JSON

**โปรโตคอลการวิเคราะห์ภาพ (ต้องปฏิบัติตามอย่างเคร่งครัด):**

0.  **ระบุตำแหน่งและขอบเขตของมิเตอร์ (Meter Localization):** ก่อนเริ่มการวิเคราะห์ใดๆ ให้ระบุตำแหน่งของมิเตอร์ไฟฟ้าในภาพก่อนเป็นอันดับแรก เพ่งความสนใจทั้งหมดไปที่วัตถุที่เป็นมิเตอร์เท่านั้น และ **เมินเฉยต่อวัตถุ สภาพแวดล้อม หรือพื้นหลังอื่นๆ ทั้งหมดในภาพโดยสิ้นเชิง** (เช่น กำแพง, สายไฟที่ไม่ใช่ส่วนหนึ่งของมิเตอร์, ต้นไม้, หรือบุคคล) การวิเคราะห์ทั้งหมดในขั้นตอนต่อไปจะต้องมาจากข้อมูลภายในขอบเขตของมิเตอร์ที่ระบุได้เท่านั้น
1.  **สแกนข้อมูลเบื้องต้น:** หลังจากระบุขอบเขตของมิเตอร์แล้ว ให้ระบุและดึงข้อมูลส่วนอื่นๆ จากตัวเครื่อง ได้แก่ \`peaNumber\`, \`meterSize\`, \`meterType\`, และ \`meterCondition\`
2.  **โฟกัสการอ่านค่าเชิงลึก (ขั้นตอนที่สำคัญที่สุด):** จากนั้น ทุ่มเทความสามารถในการวิเคราะห์ทั้งหมดไปที่ค่า \`reading\` ซึ่งเป็นงานที่สำคัญที่สุด
3.  **การวิเคราะห์ทีละหลัก (Digit-by-Digit Analysis):**
    *   ตรวจสอบตัวเลขบนหน้าปัดจากซ้ายไปขวา ทีละหลัก
    *   **โปรโตคอลการวิเคราะห์ภาพเบลอ/ไม่ชัด (สำคัญมาก):** เมื่อพบตัวเลขที่เบลอ, ไม่ชัด, หรือมีแสงสะท้อน ให้คุณจินตนาการว่ากำลัง 'ปรับโฟกัส' ภาพในใจ สร้างสมมติฐานเกี่ยวกับตัวเลขที่เป็นไปได้มากที่สุด (เช่น "รอยพิกเซลนี้อาจจะเป็น 3 หรือ 8") แล้วเปรียบเทียบสมมติฐานนั้นกับร่องรอยของพิกเซลที่เห็นอย่างละเอียดเพื่อเลือกตัวเลขที่มีความเป็นไปได้สูงสุด
    *   ในแต่ละตำแหน่งของตัวเลข ให้วิเคราะห์รูปร่าง เส้นโค้ง และลายเส้นอย่างถี่ถ้วน หากไม่ชัดเจนให้ใช้โปรโตคอลด้านบน
4.  **การทวนสอบและสรุปผล:**
    *   หลังจากระบุตัวเลขครบทุกหลักแล้ว ให้อ่านค่าตัวเลขทั้งหมดจากภาพอีกครั้งเป็นครั้งสุดท้าย เพื่อทวนสอบผลลัพธ์ของคุณกับต้นฉบับ นี่คือขั้นตอนการแก้ไขข้อผิดพลาดด้วยตนเองที่สำคัญอย่างยิ่ง
    *   รวบรวมค่าที่อ่านได้ซึ่งผ่านการทวนสอบแล้วเป็นค่าสุดท้าย

**กฎเฉพาะสำหรับมิเตอร์แต่ละประเภท:**
- **มิเตอร์จานหมุน (Analog):** ตัวเลขในกรอบสีแดงขวาสุดคือทศนิยม 1 ตำแหน่ง ค่า \`reading\` ของคุณต้องรวมทศนิยมนี้ด้วย (เช่น \`1234.5\`) หากเข็มชี้อยู่ระหว่างตัวเลขสองตัว ให้เลือกตัวเลขที่น้อยกว่าเสมอ
- **มิเตอร์ดิจิทัล (Digital):** อ่านค่าตัวเลขที่ปรากฏบนหน้าจอแสดงผลโดยตรง

**ขอบเขตข้อมูล:**
- วิเคราะห์เฉพาะข้อมูลที่ปรากฏอยู่บนตัวเครื่องและหน้าปัดของมิเตอร์เท่านั้น ห้ามนำข้อมูลสภาพแวดล้อมโดยรอบมาพิจารณา
- หากข้อมูลส่วนใดไม่สามารถระบุได้อย่างแท้จริงหลังจากการพยายามวิเคราะห์อย่างสุดความสามารถแล้ว ให้ใช้ค่าเป็น 'ไม่สามารถระบุได้'

ผลลัพธ์สุดท้ายของคุณต้องเป็น JSON object ที่สมบูรณ์เพียงอย่างเดียวเท่านั้น`;

  const response = await ai.models.generateContent({
    model: model,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: imageFile.type,
            data: imageBase64,
          },
        },
        { text: prompt },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          peaNumber: {
            type: Type.STRING,
            description: "หมายเลข PEA หรือหมายเลขเครื่องวัดไฟฟ้า",
          },
          meterSize: {
            type: Type.STRING,
            description: "ขนาดของมิเตอร์ไฟฟ้า (เช่น 5(15)A, 15(45)A)",
          },
          meterType: {
            type: Type.STRING,
            description: "ประเภทของมิเตอร์ (จานหมุน หรือ ดิจิทัล)",
          },
          reading: {
            type: Type.STRING,
            description: "หน่วยการใช้ไฟฟ้าที่อ่านได้จากมิเตอร์ (kWh)",
          },
          meterCondition: {
            type: Type.STRING,
            description: "สภาพภายนอกของมิเตอร์ (เช่น ปกติ, ชำรุด, กระจกฝ้า/มัว)",
          },
        },
        required: ["peaNumber", "meterSize", "meterType", "reading", "meterCondition"],
      },
    },
  });

  try {
    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);
    return result as AnalysisResult;
  } catch (e) {
    console.error("Failed to parse Gemini response:", response.text);
    throw new Error("ไม่สามารถประมวลผลข้อมูลจาก AI ได้ กรุณาลองใหม่อีกครั้ง");
  }
};