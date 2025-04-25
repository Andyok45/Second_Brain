import { ReactElement } from "react";


interface ButtonProps {
    variant: 'primary' | 'secondary';
    size: 'sm' | 'md' | 'lg';
    text: string;
    startIcon?: ReactElement;
    endIcon?: ReactElement;
    onClick?: () => void;
    fullWidth?: boolean;
    loading?: boolean;
}

const variantStyles = {
    "primary": "bg-purple-600 text-white",
    "secondary": "bg-purple-300 text-purple-500"
}

const sizeVariants = {
    "sm": "py-1 px-2",
    "md": "py-2 px-4",
    "lg": "py-4 px-6"
}

const defaultStyles = "rounded-lg space-x-2 flex font-light items-center justify-center";

export const Button = (props: ButtonProps) => {

    return <button onClick={props.onClick} className={`${variantStyles[props.variant]} ${defaultStyles} ${sizeVariants[props.size]} ${props.fullWidth ? " w-full" : ""} ${props.loading ? " opacity-50" : ""} `} disabled={props.loading}>{props.startIcon ? <div className="">{props.startIcon}</div> : null} {props.text ? <div className="pl-2">{props.text}</div> : null} {props.endIcon}</button>
}

<Button variant="primary" size="md" onClick={()=>{}} text={"asd"} />