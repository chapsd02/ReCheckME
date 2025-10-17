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

  const prompt = `คุณคือระบบ AI วิเคราะห์ภาพถ่ายมิเตอร์ไฟฟ้าในประเทศไทยที่มีความเชี่ยวชาญและความแม่นยำสูง โปรดวิเคราะห์ภาพที่แนบมา และตอบกลับเป็นรูปแบบ JSON ที่ถูกต้องตาม schema ที่กำหนดให้เท่านั้น ห้ามเพิ่ม markdown formatting ใดๆ

**ขั้นตอนการวิเคราะห์ (ปฏิบัติตามลำดับอย่างเคร่งครัด):**
1.  **ระบุหน่วยงาน:** ตรวจสอบโลโก้, ตัวย่อ, หรือข้อความบนมิเตอร์ เพื่อระบุว่าเป็นของ "PEA" (การไฟฟ้าส่วนภูมิภาค) หรือ "MEA" (การไฟฟ้านครหลวง) หากไม่สามารถระบุได้ชัดเจน ให้ระบุเป็น 'ไม่สามารถระบุได้'
2.  **ดึงข้อมูลหลัก:** ค้นหาและระบุข้อมูลแต่ละส่วนอย่างเป็นระบบ: หมายเลขเครื่องวัด -> ขนาด -> ประเภท -> สภาพภายนอก
3.  **อ่านค่าหน่วย (สำคัญที่สุด):** ให้ความสำคัญสูงสุดกับการอ่านค่าหน่วยการใช้ไฟฟ้า (reading) เป็นลำดับสุดท้าย เพื่อให้แน่ใจว่าได้โฟกัสอย่างเต็มที่

**กฎการอ่านค่าหน่วย (reading) อย่างละเอียด:**
- ตั้งใจวิเคราะห์ตัวเลขบนหน้าปัดอย่างถี่ถ้วนที่สุด หากภาพไม่ชัดเจน, มีแสงสะท้อน, หรือมีเงาบดบัง ให้พยายามตีความตัวเลขอย่างดีที่สุด
- **มิเตอร์จานหมุน (Analog):** ตัวเลขในกรอบสีแดงทางขวาสุดคือทศนิยม 1 ตำแหน่ง โปรดรวมทศนิยมนี้ในค่าที่อ่านได้ (เช่น 1234.5) และสังเกตทิศทางของเข็มในแต่ละหลักให้ถูกต้องตามมาตรฐานการไฟฟ้า (หมุนตามและทวนเข็มสลับกัน) หากตัวเลขอยู่ระหว่างเลขสองตัว ให้อ่านค่าตัวเลขที่น้อยกว่าเสมอ
- **มิเตอร์ดิจิทัล (Digital):** อ่านค่าตัวเลขที่ปรากฏบนหน้าจอโดยตรง
- **ตัวเลขก้ำกึ่ง:** หากตัวเลขใดไม่ชัดเจน ให้ใช้บริบทรอบข้างและรูปแบบของตัวเลขที่สมเหตุสมผลในการอนุมานค่าที่ดีที่สุด

**ขอบเขตการวิเคราะห์:**
- วิเคราะห์ข้อมูลที่อยู่บนตัวเรือนและหน้าปัดของมิเตอร์ไฟฟ้า *เท่านั้น* ห้ามนำข้อมูลจากสภาพแวดล้อมรอบข้างมาใส่ในผลลัพธ์โดยเด็ดขาด

**ข้อมูลที่ต้องการ:**
1.  **authority:** หน่วยงานที่รับผิดชอบมิเตอร์ ('PEA', 'MEA', หรือ 'ไม่สามารถระบุได้')
2.  **meterNumber:** หมายเลขเครื่องวัดที่ระบุบนตัวมิเตอร์
3.  **meterSize:** ขนาดของมิเตอร์ (เช่น 5(15)A, 15(45)A, 30(100)A)
4.  **meterType:** ประเภทของมิเตอร์ ('จานหมุน' หรือ 'ดิจิทัล')
5.  **reading:** หน่วยการใช้ไฟฟ้า (kWh) ที่อ่านได้
6.  **meterCondition:** สภาพภายนอกโดยรวม (เช่น 'ปกติ', 'ชำรุด', 'กระจกฝ้า/มัว', 'มีรอยแตก', 'มีคราบสกปรก', 'เสียหายจากน้ำ')

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
          authority: {
            type: Type.STRING,
            description: "หน่วยงานที่รับผิดชอบมิเตอร์ (PEA, MEA, หรือ ไม่สามารถระบุได้)",
          },
          meterNumber: {
            type: Type.STRING,
            description: "หมายเลขเครื่องวัดที่ระบุบนตัวมิเตอร์",
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
        required: ["authority", "meterNumber", "meterSize", "meterType", "reading", "meterCondition"],
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