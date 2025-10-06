import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, PropsWithChildren, useEffect, useState } from "react";
import { STORAGE_AUTH_KEY } from "@/constants/db";

type auth_state = {
  is_logged:boolean;
  log_in:()=>Promise<void>;
  log_out:()=>Promise<void>;
  ready:boolean;
};

export const AuthContext = createContext<auth_state>({
  is_logged:false,
  log_in:async()=>{},
  log_out:async()=>{},
  ready:false
});

export type auth_stored = {
  logged:boolean;
};

export function AuthProvider(props:PropsWithChildren){
  const [isLogged,setIsLogged] = useState<boolean>(false);
  const [ready,setIsReady] = useState<boolean>(false);

  async function storeAuthState(
    data:auth_stored
  ):Promise<void>{
    const p = JSON.stringify(data);
    try {
      await AsyncStorage.setItem(
        STORAGE_AUTH_KEY,
        p,
      );
    }
    catch(e){
      console.log(e);
      throw new Error("Auth not persisted");
    };
  };

  useEffect(()=>{
    const ret = async ()=>{
      try{
        const v = await AsyncStorage.getItem(STORAGE_AUTH_KEY);
        if(v !== null){
          const auth:auth_stored = JSON.parse(v);
          setIsLogged(auth.logged);
        }
      }
      catch(e){
        console.error("Error fetching from storage",e);
      };
      setIsReady(true);
    };
    ret();
  },[]);
    
  const logIn = async()=>{
    const p:auth_stored = {
      logged:true,
    };
    await storeAuthState(p);
    setIsLogged(true);
  };
  const logOut = async()=>{
    const p:auth_stored = {
      logged:false,
    };
    await storeAuthState(p);
    setIsLogged(false);
  };

  return(
    <AuthContext.Provider
      value={{
        log_out:logOut,
        log_in:logIn,
        is_logged:isLogged,
        ready
      }}
    >
      {props.children}
    </AuthContext.Provider>
  )
};
