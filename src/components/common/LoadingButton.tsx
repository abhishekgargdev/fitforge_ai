import React from "react";
import { Loader2 } from "lucide-react";

export interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: React.ReactNode;
  icon?: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading = false,
  loadingText,
  icon,
  variant = "primary",
  disabled,
  className = "",
  children,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return "bg-[#B8F34A] text-[#0B0D0F] hover:bg-[#C8FF68] font-black shadow-[0_0_15px_rgba(184,243,74,0.3)]";
      case "secondary":
        return "bg-[#181D22] border border-[#252B30] text-[#F5F7F2] hover:text-white hover:border-[#B8F34A]/40 font-bold";
      case "danger":
        return "bg-[#F05D5E]/20 border border-[#F05D5E]/40 text-[#F05D5E] hover:bg-[#F05D5E]/30 font-bold";
      case "outline":
        return "bg-transparent border border-[#252B30] text-[#9AA3A0] hover:text-white hover:border-[#9AA3A0] font-bold";
      case "ghost":
        return "bg-transparent text-[#9AA3A0] hover:text-white font-semibold";
    }
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      disabled={isDisabled}
      className={`px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${getVariantStyles()} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>{loadingText || children}</span>
        </>
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};
