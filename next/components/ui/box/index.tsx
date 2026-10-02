import React from "react";

import { View, ViewProps, ViewStyle, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import type { VariantProps } from "@gluestack-ui/nativewind-utils";
import { boxStyle } from "./styles";

type IBoxProps = ViewProps &
  VariantProps<typeof boxStyle> & {
    className?: string;
    style?: ViewStyle & {
      color?: string;
      fontFeatureSettings?: string;
      textTransform?: string;
      fontStyle?: string;
      fontWeight?: string;
      fontSize?: string;
      lineHeight?: string;
      letterSpacing?: string;
      textAlign?: string;
      textDecoration?: string;
      textDecorationColor?: string;
      textDecorationStyle?: string;
      minHeight?: string;
      WebkitLineClamp?: string;
      backdropFilter?: string;
      WebkitMask?: string;
      mask?: string;
      boxShadow?: string;
      touchAction?: string;
      cursor?: string;
      transform?: string;
      scrollSnapType?: string;
      scrollbarWidth?: string;
      msOverflowStyle?: string;
      scrollBehavior?: string;
      WebkitOverflowScrolling?: string | undefined;
      WebkitTransform?: string | undefined;
    };
    onClick?: React.MouseEventHandler<HTMLElement>;
    onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
    onMouseDown?: React.MouseEventHandler<HTMLElement>;
    title?: string;
  };

const Box = React.forwardRef<React.ElementRef<typeof View>, IBoxProps>(
  ({ className, onClick, onScroll, ...props }, ref) => {
    return (
      <View
        ref={ref}
        {...({ onClick } as any)}
        {...({ onScroll } as any)}
        {...props}
        className={boxStyle({ class: className })}
      />
    );
  },
);

Box.displayName = "Box";
export { Box };
