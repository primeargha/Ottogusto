import StoreSwitcher from "../StoreSwitcher";
import ColorsShowcase from "../ColorsShowcase";
import TypographyShowcase from "../TypographyShowcase";
import FlagsShowcase from "../FlagsShowcase";
import SpaceLayoutGeometryShowcase from "../SpaceLayoutGeometryShowcase";

export default function OttogustoDesignSystemPage() {
  return (
    <div className="min-h-screen bg-color-background-l2">
      <div className="container mx-auto max-w-7xl px-4 py-20">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-color-text-body typography-display-01">
            Design System - Ottogusto
          </h1>
          <p className="mx-auto max-w-3xl text-color-text-placeholder typography-body-01">
            A comprehensive design system showcasing colors, typography, and components for the
            Ottogusto theme. All colors and typography automatically adapt based on the URL-based
            store configuration.
          </p>
        </div>

        {/* Store Switcher */}
        <StoreSwitcher />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
          {/* Colors Section */}
          <div className="xl:col-span-2">
            <ColorsShowcase />
          </div>

          {/* Typography Section */}
          <div className="xl:col-span-2">
            <TypographyShowcase />
          </div>

          {/* Feature Flags Section */}
          <div className="xl:col-span-2">
            <FlagsShowcase />
          </div>

          {/* Space, Layout & Geometry Section */}
          <div className="xl:col-span-2">
            <SpaceLayoutGeometryShowcase />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 border-t border-color-background-l8 pt-8">
          <div className="text-center">
            <p className="text-color-text-placeholder typography-caption">
              This design system demonstrates the Ottogusto theme with Anton display font, Overpass
              body font, and Overpass Mono for code. Visit /design-system/qv to see the Qverde
              theme.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
