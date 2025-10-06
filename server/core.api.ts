export const register = async(
  payload:RegisterPayload,
  setState: (value: boolean) => void
) =>{
  let data;
  let error:boolean = false;
  let error_msg:string = "";
  setState(true);
  await api.post('/auth/register',{
    ...payload,
  }).then(res=>{
    setState(false);
    data = res.data;
  }).catch(e=>{
    console.log(e.response);
    setState(false);
    error = true;
    if(e.response){
      if(e.response.status === 400)
        error_msg = "Verifique la información";
      else error_msg = e.response.data.message;
    }
    else if(e.request){
      error_msg = "No se recibio respuesta del servidor";
    }
    else {
      error_msg = "Ha ocurrido un error";
    };
  });
  return {
    data,
    error,
    error_msg
  };
};
