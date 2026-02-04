import HACCPMasterFlow from "@/components/builder/HACCPMasterFlow";
import { Suspense } from "react";

export default function BuilderPage() {
  return (
    <div className="min-h-screen bg-white">
      <main>
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        }>
          <HACCPMasterFlow />
        </Suspense>
      </main>
    </div>
  );
}
