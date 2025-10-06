import React from "react";
import { TextInput } from "react-native";

export const Input = React.forwardRef<TextInput, React.ComponentProps<typeof TextInput>>(
  (props, ref) => (
    <TextInput
      ref={ref}
      placeholderTextColor="gray"
      cursorColor={"#000"}
      selectionColor={"#000"}
      style={{
        paddingRight: 12,
        paddingVertical: 12,
        fontSize: 16,
        borderBottomWidth:1,
        borderColor:"#E8E8E8",
        fontFamily:"Avenir",
      }}
      {...props}
    />
  )
);
Input.displayName = "Input";
