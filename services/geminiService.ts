
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
  const model = 'gemini-2.5-flash';

  const imageBase64 = await fileToBase64(imageFile);

  const prompt = `คุณคือผู้เชี่ยวชาญในการอ่านมิเตอร์ไฟฟ้าจากการไฟฟ้าส่วนภูมิภาค (PEA) โปรดวิเคราะห์รูปภาพของมิเตอร์ไฟฟ้าที่แนบมานี้ และตอบกลับเป็นรูปแบบ JSON ที่ถูกต้องตาม schema ที่กำหนดให้เท่านั้น ห้ามเพิ่ม markdown formatting. ข้อมูลที่ต้องการคือ: 
1. ขนาดของมิเตอร์ (meterSize) เช่น 5(15)A, 15(45)A, 30(100)A 
2. ประเภทของมิเตอร์ (meterType) ว่าเป็น 'จานหมุน' หรือ 'ดิจิทัล' 
3. หมายเลขเครื่องวัด (peaNumber) ซึ่งเป็นตัวเลขที่ระบุบนตัวมิเตอร์ 
4. หน่วยการใช้ไฟฟ้า (reading) ที่แสดงบนหน้าปัดหรือหน้าจอ
5. สภาพภายนอกของมิเตอร์ (meterCondition) เช่น 'ปกติ', 'ชำรุด', 'มีรอยขีดข่วน', 'กระจกฝ้า/มัว'
หากข้อมูลส่วนไหนไม่ชัดเจนหรือไม่สามารถอ่านได้ ให้ใส่ค่าเป็น 'ไม่สามารถระบุได้'`;

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
          meterSize: {
            type: Type.STRING,
            description: "ขนาดของมิเตอร์ไฟฟ้า (เช่น 5(15)A, 15(45)A)",
          },
          meterType: {
            type: Type.STRING,
            description: "ประเภทของมิเตอร์ (จานหมุน หรือ ดิจิทัล)",
          },
          peaNumber: {
            type: Type.STRING,
            description: "หมายเลข PEA ของมิเตอร์",
          },
          reading: {
            type: Type.STRING,
            description: "หน่วยการใช้ไฟฟ้าที่อ่านได้จากมิเตอร์",
          },
          meterCondition: {
            type: Type.STRING,
            description: "สภาพภายนอกของมิเตอร์ (เช่น ปกติ, ชำรุด, กระจกฝ้า/มัว)",
          },
        },
        required: ["meterSize", "meterType", "peaNumber", "reading", "meterCondition"],
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