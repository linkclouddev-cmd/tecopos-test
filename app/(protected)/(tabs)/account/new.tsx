import { Input } from '@/components/global/input';
import { g_accounts_new } from '@/server/core.api';
import { useAccounts } from '@/stores/account.store';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface nci {
      name:string,
      amountCents:number,
      currency:string,
};

const NewAccount: React.FC = () => {

  const [l,sl] = useState<boolean>(false);
  const na = useAccounts().addA;
  const router = useRouter();


  const [dat,sd] = useState<nci>({
    amountCents:0,
    currency:"CUP",
    name:""
  });

  async function createAccount(){
    const res = await g_accounts_new(sl,dat);
    if(res.data){
      na(res.data);
      router.back();
    };
  };

  return <View
    style={{
      padding:20,
      display:"flex",
      gap:20,
      flexDirection:"column"
    }}
  >
    <Text
      style={{
        fontSize:25
      }}
    >
      Crear nueva cuenta
    </Text>
    <Input
      onChangeText={e=>sd(prev=>({...prev,name:e}))}
      placeholder='Ingrese el nombre de su cuenta'
    />
    <Input
      onChangeText={e=>sd(prev=>({...prev,currency:e}))}
      placeholder='Ingrese la moneda'
    />
    <Input
    placeholder='Ingrese la cantidad inicial'
    keyboardType='numeric'
    onChangeText={e=>sd(prev=>({...prev,amountCents:Number(e)}))}
    />
    <TouchableOpacity
    onPress={createAccount}
      style={{
        backgroundColor:"#000",
        padding:14,
        borderRadius:10,
        marginTop:20,
        display:"flex",
        alignItems:"center",
        justifyContent:"center"
      }}
    >
      <Text
        style={{
          color:"#fff",
        }}
      >
        Crear cuenta
      </Text>
    </TouchableOpacity>
  </View>;
} 

export default NewAccount;
