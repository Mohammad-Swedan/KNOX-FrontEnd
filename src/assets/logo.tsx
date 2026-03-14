import logoSrc from "@/assets/svg/Logo.png";

interface LogoProps {
  className?: string;
  style?: React.CSSProperties;
}

const Logo = ({ className, style }: LogoProps) => {
  return (
    <img
      src={logoSrc}
      alt="eCampus"
      className={className}
      style={{ height: "40px", width: "auto", ...style }}
    />
  );
};

export default Logo;
