import {cookies} from 'next/headers';
import jwt from 'jsonwebtoken'


const JWT_SECRET="secrto-02-3";


export async function getSession(){
    const cookieStore=cookies();
    const token= (await cookieStore).get('token')?.value;
    console.log(token)

    if(!token)return null;


    try{
        const decoded=jwt.verify(token,JWT_SECRET)as{
            id: string; 
            email: string; 
            role: string
        }
        console.log(token)
        return {user:decoded};
  
    

    }
    catch(error){
        console.error('Session validation failed:', error);
        return null;
    }

}
export async function requireAdmin(request?: Request) {
    const session = await getSession();
    console.log(session)
    if (!session?.user || session.user.role !== 'seller') {

      throw new Error('seller access required');
    }
    return session;
  }