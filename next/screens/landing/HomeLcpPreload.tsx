import LcpImagePreload from "@/components/lcp/LcpImagePreload";
import { getHomeHeroLcpImageUrl } from "@/utils/lcp-utils";

/** Server-only: preload homepage hero carousel LCP image. */
export default function HomeLcpPreload() {
  return <LcpImagePreload href={getHomeHeroLcpImageUrl()} />;
}
