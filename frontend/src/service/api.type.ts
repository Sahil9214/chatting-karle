export interface UserRegister {
  id: string;
  username: string;
  email: string;
  avatar?: string | File;
  password: string;
}

export interface Message {
  id: string;
  content: string;
  createdAt: Date;
  sender?: UserRegister;
}
export interface UserLogin {
  email: string;
  password: string;
}
