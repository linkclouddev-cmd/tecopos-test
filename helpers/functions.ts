export function calc_ram_num():number{
  const ram = Math.floor((Math.random() * 10)); 
  return ram;
};

export function return_value(arr:string[], num:number):string{
  if(num === 0) return arr[0];
  if(num < arr.length) return arr[num];
  let count:number = 0;
  let color:string = "";
  for(let x = 0;x<num;x++){
    if(count === num) {
      color = arr[x];
      break;
    };
    if(x === arr.length - 1) {
      x = -1;
      count+=1;
      continue;
    };
    count += 1;
  };
  return color;
};

export function random_value(arr:string[]):string{
  const num = calc_ram_num();
  const value = return_value(arr, num);
  return value;
};


