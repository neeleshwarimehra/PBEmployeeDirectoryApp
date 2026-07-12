import { Vortex } from "react-loader-spinner";

type LoaderProps = {
  visible: boolean;
};

export default function Loader({ visible }: LoaderProps) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30">
      <Vortex
        visible={true}
        height={100}
        width={100}
        ariaLabel="loading"
        colors={[
          "#1A3A6B", // Dark Blue
          "#2563EB", // Blue
          "#3B82F6", // Light Blue
          "#F4832A", // Orange
          "#FCD34D", // Yellow-300
          "#FDE68A", // Yellow-200
        ]}
      />
    </div>
  );
}
