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

  const prompt = `คุณคือระบบวิเคราะห์ภาพดิจิทัลที่มีความเชี่ยวชาญสูงและใส่ใจในรายละเอียดเป็นพิเศษ, ถูกฝึกมาเพื่อตรวจสอบและอ่านข้อมูลจากมิเตอร์ไฟฟ้าของการไฟฟ้าส่วนภูมิภาค (PEA) โดยเฉพาะ โปรดวิเคราะห์รูปภาพที่แนบมานี้ และตอบกลับเป็นรูปแบบ JSON ที่ถูกต้องตาม schema ที่กำหนดให้เท่านั้น ห้ามเพิ่ม markdown formatting ใดๆ

**ขั้นตอนการวิเคราะห์:**
1.  **ตรวจสอบเบื้องต้น:** ยืนยันว่าภาพนี้เป็นมิเตอร์ไฟฟ้าของ PEA จริง
2.  **ระบุข้อมูล:** ค้นหาและระบุข้อมูลแต่ละส่วนอย่างเป็นระบบ: หมายเลขเครื่องวัด -> ขนาด -> ประเภท -> สภาพภายนอก
3.  **การอ่านค่าหน่วย:** ให้ความสำคัญสูงสุดกับการอ่านค่าหน่วยการใช้ไฟฟ้า (reading) เป็นลำดับสุดท้าย เพื่อให้แน่ใจว่าได้โฟกัสอย่างเต็มที่
4.  **ทวนสอบ:** ก่อนสร้างผลลัพธ์ JSON, โปรดทบทวนข้อมูลที่ดึงมาทั้งหมดกับภาพอีกครั้งเพื่อความถูกต้องสูงสุด

**คำสั่งการอ่านค่าหน่วย (reading) อย่างละเอียด:**
- ตั้งใจวิเคราะห์ตัวเลขบนหน้าปัดอย่างถี่ถ้วนที่สุด หากภาพไม่ชัดเจน, มีแสงสะท้อน, หรือมีเงาบดบัง ให้พยายามตีความตัวเลขอย่างดีที่สุด
- สำหรับมิเตอร์แบบจานหมุน (Analog Meter): ตัวเลขสุดท้ายทางขวามือ (มักอยู่ในกรอบสีแดง) คือทศนิยม 1 ตำแหน่ง โปรดรวมทศนิยมนี้ในค่าที่อ่านได้ (เช่น 1234.5) และสังเกตทิศทางของเข็มในแต่ละหลักให้ถูกต้อง
- สำหรับมิเตอร์แบบดิจิทัล (Digital Meter): อ่านค่าตัวเลขที่ปรากฏบนหน้าจอโดยตรง
- สำหรับตัวเลขที่ก้ำกึ่งหรือไม่ชัดเจน ให้ใช้บริบทรอบข้างในการอนุมานค่าที่สมเหตุสมผลที่สุด

**ขอบเขตการวิเคราะห์:**
- วิเคราะห์ข้อมูลที่อยู่บนตัวเรือนและหน้าปัดของมิเตอร์ไฟฟ้า *เท่านั้น* ห้ามนำข้อมูลจากสภาพแวดล้อมรอบข้าง เช่น ข้อความบนกำแพง, เสาไฟ, หรือป้ายอื่นๆ ที่ไม่เกี่ยวข้อง มาใส่ในผลลัพธ์โดยเด็ดขาด

**ข้อมูลที่ต้องการ:**
1.  **meterSize:** ขนาดของมิเตอร์ (เช่น 5(15)A, 15(45)A, 30(100)A)
2.  **meterType:** ประเภทของมิเตอร์ ('จานหมุน' หรือ 'ดิจิทัล')
3.  **peaNumber:** หมายเลขเครื่องวัดที่ระบุบนตัวมิเตอร์
4.  **reading:** หน่วยการใช้ไฟฟ้า (kWh) ที่อ่านได้
5.  **meterCondition:** สภาพภายนอก ('ปกติ', 'ชำรุด', 'กระจกฝ้า/มัว', 'รอยแตก', 'คราบสกปรก', 'ความเสียหายจากน้ำ')

หากข้อมูลส่วนใดไม่สามารถระบุได้อย่างแน่ชัดหลังจากการพยายามอย่างดีที่สุดแล้ว ให้ใส่ค่าเป็น 'ไม่สามารถระบุได้'`;

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
            description: "หน่วยการใช้ไฟฟ้าที่อ่านได้จากมิเตอร์ (kWh)",
          },
          meterCondition: {
            type: Type.STRING,
            description: "สภาพภายนอกของมิเตอร์ (เช่น ปกติ, ชำรุด, กระจกฝ้า/มัว, รอยแตก, คราบสกปรก, ความเสียหายจากน้ำ)",
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