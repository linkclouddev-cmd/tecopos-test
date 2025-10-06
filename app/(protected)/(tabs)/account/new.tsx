import { Input } from '@/components/global/input';
import { Text, TouchableOpacity, View } from 'react-native';

const NewAccount: React.FC = () => {
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
      placeholder='Ingrese el nombre de su cuenta'
    />
    <Input
    placeholder='Ingrese la cantidad inicial'
    />
    <TouchableOpacity
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
