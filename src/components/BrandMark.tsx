
type BrandMarkProps = {
  className?: string;
  iconClassName?: string;
};

const BrandMark = ({ className = "", iconClassName = "" }: BrandMarkProps) => (
  <div
    className={`flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white/8 bg-white/5 ${className}`.trim()}
  >
    <img 
      src="/logo.png" 
      alt="Arena TRZ Logo" 
      className={`h-full w-full object-contain p-1.5 ${iconClassName}`.trim()} 
    />
  </div>
);

export default BrandMark;
