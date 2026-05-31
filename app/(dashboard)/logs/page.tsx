import { Suspense } from "react";
import LogsPageContent from "./LogsContent";

export default function LogsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col h-full">
          <div className="p-4 sm:p-6 space-y-4">
            <div className="skeleton h-12 rounded-2xl" />
            <div className="skeleton h-64 rounded-2xl" />
          </div>
        </div>
      }
    >
      <LogsPageContent />
    </Suspense>
  );
}
