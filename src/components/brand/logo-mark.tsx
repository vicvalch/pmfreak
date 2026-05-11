import Image from "next/image";
import Link from "next/link";

const sizeClasses = {
  small: "h-9 w-9",
  navbar: "h-11 w-11",
  large: "h-14 w-14",
} as const;

type LogoMarkProps = {
  size?: keyof typeof sizeClasses;
  href?: string;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
};

export function LogoMark({ size = "navbar", href = "/", priority = false, className = "", imageClassName = "" }: LogoMarkProps) {
  const shellClass = `relative inline-flex items-center justify-center border border-white/55  from-[#fffcf4] to-[#f1e8d8]  ring-1 ring-[#22d3ee]/35 ${sizeClasses[size]} ${className}`;

  return (
    <Link href={href} aria-label="PMFreak Home" className={shellClass}>
      <span className="absolute inset-0  " aria-hidden />
      <Image
        src="/assets/LogoTrazoBlanco.png"
        alt="PM Freak"
        width={96}
        height={96}
        priority={priority}
        className={`relative h-full w-full object-contain ${imageClassName}`}
      />
    </Link>
  );
}
