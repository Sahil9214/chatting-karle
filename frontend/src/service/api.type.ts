export interface UserRegister {
  username: string;
  email: string;
  password: string;
  avatar?: string;
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
