import { BotInput, UserInfo } from "@/types";
import axios from "axios";

const ServerBaseUrl = `http://localhost:3000/api/`;

export async function createCustomerapi(user: UserInfo) {
  const res = await axios.post(`${ServerBaseUrl}customer`, user);
  console.log(res);
}
export async function createBot(botInfo: BotInput) {
  const formData = new FormData();

  // Append text fields
  formData.append("name", botInfo.name);
  formData.append("website", botInfo.website);
  formData.append("topic", botInfo.topic);

  // Append file if it exists
  if (botInfo.file) {
    formData.append("file", botInfo?.file);
  }

  try {
    const res = await axios.post(`${ServerBaseUrl}bot`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("Response:", res.data);
  } catch (error) {
    console.error("Error uploading bot info:", error);
  }
}

export async function getBotinfo(id: string) {
  const res = await axios.get(`${ServerBaseUrl}bot/${id}`);
  console.log(res.data?.data);
  return res.data?.data;
}

export async function learnapi(file: File) {
  try {
    const formdata = new FormData();
    if (file) {
      formdata.append("file", file);
    }
    const res = await axios.post(`${ServerBaseUrl}learn`, formdata, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log(res?.data);
    return res?.data?.data;
  } catch (error) {
    console.log(error);
  }
}

export async function getBotlist() {
  const res = await axios.get(`${ServerBaseUrl}bot`);
  console.log(res.data);
  return res.data;
}
