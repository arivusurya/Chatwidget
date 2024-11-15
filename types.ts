export interface UserInfo {
  name: string;
  email: string;
}

export interface Message {
  botid: string | null;
  id: number;
  content: string;
  sender: "user" | "bot";
}

export interface BotInput {
  name: string;
  website: string;
  file: File | null;
  topic: string;
}
