interface AvatarProps {
  readonly src: string;
  readonly name: string;
  readonly size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-9 w-9 rounded-xl",
  md: "h-12 w-12 rounded-2xl",
  lg: "h-18 w-18 rounded-3xl"
} as const;

export const Avatar = ({ src, name, size = "md" }: AvatarProps) => (
  <img
    src={src}
    alt={name}
    className={`${sizeClasses[size]} border border-white/10 object-cover shadow-lg`}
    loading="lazy"
  />
);
