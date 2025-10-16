import { X } from "lucide-react";
import { useModelState } from "@/store/modelState";

export default function LevelTableModel({ showLevelTableModel }) {
  return (
    <>
      {showLevelTableModel && (
        <div
          className="w-screen h-screen fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 animate-fadeIn"
          onClick={() => {
            useModelState.setState({ showLevelTableModel: false });
          }}
        >
          <div className="relative w-full h-full flex items-center justify-center p-2">
            <button
              type="button"
              onClick={() => useModelState.setState({ showLevelTableModel: false })}
              className="cursor-pointer absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10 bg-black/30 hover:bg-black/50 rounded-full p-2"
            >
              <X size={24} />
            </button>
            <img
              src="/level-table.webp"
              alt="程度表"
              className="w-auto h-auto max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
}
