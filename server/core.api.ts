import { api } from "./system.api";


export const g_accounts = async(
  setState: (value: boolean) => void
) =>{
  console.log("FETCHING ACCOUNTS");
  let data;
  let error:boolean = false;
  let error_msg:string = "";
  setState(true);
  await api.get('/accounts',{
  }).then(res=>{
    setState(false);
    console.log(res,"DATA FROM RES");
    data = res.data;
  }).catch(e=>{
    console.log(e.response,"ERROR",e);
    setState(false);
    error = true;
    if(e.response){
      if(e.response.status === 400)
        error_msg = "Verifique la información";
      else error_msg = e.response.data.message;
    }
    else if(e.request){
      console.log(e.request);
      error_msg = "No se recibio respuesta del servidor";
    }
    else {
      error_msg = "Ha ocurrido un error";
    };
  });
  console.log(error_msg);
  return {
    data,
    error,
    error_msg
  };
};

export const g_accounts_new = async(
  setState: (value: boolean) => void,
  d:{
    currency:string,
    amountCents:number,
    name:string,
  }
) =>{
  let data;
  let error:boolean = false;
  let error_msg:string = "";
  setState(true);
  await api.post(`/accounts`,{
    ...d
  }).then(res=>{
    setState(false);
    data = res.data;
  }).catch(e=>{
    console.log(e.response,"ERROR",e);
    setState(false);
    error = true;
    if(e.response){
      if(e.response.status === 400)
        error_msg = "Verifique la información";
      else error_msg = e.response.data.message;
    }
    else if(e.request){
      console.log(e.request);
      error_msg = "No se recibio respuesta del servidor";
    }
    else {
      error_msg = "Ha ocurrido un error";
    };
  });
  console.log(error_msg);
  return {
    data,
    error,
    error_msg
  };
};

export const g_accounts_tx = async(
  setState: (value: boolean) => void,
  id:number
) =>{
  let data;
  let error:boolean = false;
  let error_msg:string = "";
  setState(true);
  await api.get(`/accounts/${id}/transactions`,{
  }).then(res=>{
    setState(false);
    data = res.data.items;
  }).catch(e=>{
    console.log(e.response,"ERROR",e);
    setState(false);
    error = true;
    if(e.response){
      if(e.response.status === 400)
        error_msg = "Verifique la información";
      else error_msg = e.response.data.message;
    }
    else if(e.request){
      console.log(e.request);
      error_msg = "No se recibio respuesta del servidor";
    }
    else {
      error_msg = "Ha ocurrido un error";
    };
  });
  console.log(error_msg);
  return {
    data,
    error,
    error_msg
  };
};
