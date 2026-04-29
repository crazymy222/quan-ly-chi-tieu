"use client"

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { InputGroup, InputGroupButton, InputGroupAddon, InputGroupInput } from "./ui/input-group";
import { useState } from "react";


export default function PasswordInput(props: React.ComponentProps<"input">) {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const togglePasswordVisibility = () => setShowPassword(val => !val);
  
  return (
    <InputGroup>
      <InputGroupInput
        {...props}
        type={showPassword ? "text" : "password"}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton onClick={togglePasswordVisibility}>
          {showPassword ? (
            <EyeOffIcon className="size-4 text-muted-foreground" />
          ) : (
            <EyeIcon className="size-4 text-muted-foreground" />
          )}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}