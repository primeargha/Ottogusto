import { getCurrentServerStore } from "@/utils/server-store";

export default function ServerStoreDisplay() {
  const currentStore = getCurrentServerStore();

  return (
    <div className="rounded-lg bg-color-background-l1 p-4">
      <h3 className="mb-2 text-lg font-medium text-color-primary-main">
        Server Component Store Detection
      </h3>
      <p className="text-color-text-body">
        Current Store: <strong>{currentStore}</strong>
      </p>
      <p className="text-sm text-color-text-body opacity-75">
        This store was automatically detected from the URL subdomain at the server level.
      </p>
    </div>
  );
}
