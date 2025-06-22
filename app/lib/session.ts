import {cookies} from 'next/headers';
import jwt from 'jsonwebtoken'


const JWT_SECRET=process.env.JWT_SECRET||"secret_key_works";


export async function getSession(){
    const cookieStore=cookies();
    const token= (await cookieStore).get('token')?.value;

    if(!token)return null;


    try{
        const decoded=jwt.verify(token,JWT_SECRET)as{
            id: string; 
            email: string; 
            role: string
        }
        return {user:decoded};


    }
    catch(error){
        console.error('Session validation failed:', error);
        return null;
    }

}
export async function requireAdmin(request?: Request) {
    const session = await getSession();
    if (!session?.user || session.user.role !== 'seller') {
      throw new Error('seller access required');
    }
    return session;
  }