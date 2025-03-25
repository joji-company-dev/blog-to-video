import * as React from "react";
import { DotLoader } from "react-spinners";
import { Button } from "./button";

function ButtonWithLoading({
  onClick,
  disabled,
  asChild = false,
  children,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "onClick"> & {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
}) {
  const [isLoading, setIsLoading] = React.useState(false);

  return (
    <Button
      data-slot="button"
      disabled={isLoading || disabled}
      onClick={async (e) => {
        try {
          setIsLoading(true);
          await onClick(e);
        } finally {
          setIsLoading(false);
        }
      }}
      {...props}
    >
      {isLoading && !asChild && (
        <DotLoader className="h-8" size={24} color="currentColor" />
      )}
      {(!isLoading || asChild) && children}
    </Button>
  );
}

export { ButtonWithLoading };
