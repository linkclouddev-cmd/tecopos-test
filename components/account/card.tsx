import { Text, TouchableOpacity, View }  from 'react-native';
import { useEffect, useState } from 'react';
import { random_value } from '@/helpers/functions';
import { Account } from '@/server/interfaces';
import { useRouter } from 'expo-router';

const AccountCard: React.FC<{item:Account}> = (props:{item:Account}) => {
  const colors = [
    "#000",
  ];
  const [color,setColor] = useState<string>("#fff");
  const router = useRouter();
  useEffect(()=>setColor(random_value(colors)),[]);
  return <TouchableOpacity
  onPress={()=>{
    router.push({
      pathname:'/(protected)/(tabs)/account/details',
      params:{id:props.item.id}
    });
  }}
   style={{
    backgroundColor:color,
    display:"flex",
    flexDirection:"row",
    borderRadius:10,
    width:"49%",
    height:"90%",
    marginBottom:50
  }}>
  <View style={{height:"100%",
    backgroundColor:color,
  borderTopLeftRadius:10,
  borderBottomLeftRadius:10
  }} />
  <View style={{flex:1,display:"flex",flexDirection:"column",padding:10}}>
  <View style={{flex:1}}>
    <Text style={{
    fontSize:10,
    color:"gray",
  }}>{props.item.createdAt}</Text>
    <View style={{
      marginTop:10,
      display:"flex",
      flexDirection:"column",
      gap:8
    }}
    >
      <Text style={{
        fontSize:15,
        color:"#fff"
      }}
      >
      {props.item.name}
      </Text>
      <View style={{display:"flex", gap:4,flexDirection:"column",justifyContent:"space-between"}}>
      <Text style={{color:"#fff",fontSize:12}}>
        {(props.item.currency)}
      </Text>
      </View>
    </View>
</View>
<View style={{display:"flex",flexDirection:"row",alignItems:"center",justifyContent:"space-between"}}>
      <Text style={{fontSize:15,color:"#fff"}}>
        {props.item.amountCents}$
      </Text>
</View>
    </View>
  </TouchableOpacity>;
}

export default AccountCard;
