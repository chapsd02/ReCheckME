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

  const prompt = `คุณคือผู้เชี่ยวชาญ AI ระดับโลกด้านการวิเคราะห์ภาพ (OCR) สำหรับมิเตอร์ไฟฟ้าในประเทศไทยโดยเฉพาะ ภารกิจหลักของคุณคือการอ่านค่าหน่วยบนหน้าปัดให้มีความแม่นยำสูงสุดเท่าที่จะเป็นไปได้ โปรดวิเคราะห์ภาพที่แนบมาและตอบกลับเป็น JSON object ที่ถูกต้องตาม schema เท่านั้น ห้ามมีข้อความอธิบายหรือ markdown ใดๆ นอกเหนือจาก JSON

**โปรโตคอลการวิเคราะห์ (ต้องปฏิบัติตามอย่างเคร่งครัด):**

1.  **สแกนข้อมูลเบื้องต้น:** ในขั้นแรก ให้ระบุและดึงข้อมูลส่วนอื่นๆ ก่อน ได้แก่ \`peaNumber\`, \`meterSize\`, \`meterType\`, และ \`meterCondition\`
2.  **โฟกัสการอ่านค่าเชิงลึก (ขั้นตอนที่สำคัญที่สุด):** จากนั้น ทุ่มเทความสามารถในการวิเคราะห์ทั้งหมดไปที่ค่า \`reading\` ซึ่งเป็นงานที่สำคัญที่สุด
3.  **การวิเคราะห์ทีละหลัก (Digit-by-Digit Analysis):**
    *   ตรวจสอบตัวเลขบนหน้าปัดจากซ้ายไปขวา ทีละหลัก
    *   ในแต่ละตำแหน่งของตัวเลข ให้วิเคราะห์รูปร่าง เส้นโค้ง และลายเส้นอย่างละเอียดถี่ถ้วน
    *   หากตัวเลขใดไม่ชัดเจน, ถูกบดบังบางส่วน, หรือมีแสงสะท้อน ให้เปรียบเทียบส่วนที่มองเห็นกับรูปร่างของตัวเลขที่เป็นไปได้ทั้งสิบตัว (0-9) ในใจ และเลือกตัวเลขที่มีความเป็นไปได้สูงสุดจากการเปรียบเทียบนั้น
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
