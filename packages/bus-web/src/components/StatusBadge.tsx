interface StatusBadgeProps {
  isRisk: boolean;
}

export const StatusBadge = ({ isRisk }: StatusBadgeProps) => {
  if (!isRisk) {
    return null;
  }

  return (
    <span className="inline-flex rounded-full bg-[#fff3e6] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#b45309]">
      High Risk
    </span>
  );
};
