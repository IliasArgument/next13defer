import { User, Session } from 'next-auth'


export interface SessionInterface extends Session {
  [x: string]: any;
  user: User & {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
  };
}