import { ErrorBoundary } from "react-error-boundary";

type FallbackComponentProps = {
  error: Error;
  resetErrorBoundary: () => void;
};

const FallbackComponent: React.FC<FallbackComponentProps> = ({
  error,
  resetErrorBoundary,
}): JSX.Element => {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre style={{ color: "red" }}>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
};

type MyErrorBoundaryProps = {
  children: React.ReactNode;
  resetHandler: () => void;
};

const errorLogger = (error: Error, info: { componentStack: string }) => {
  // logging the error & info to browser console
  console.log(info);
  throw error;
};

const MyErrorBoundary: React.FC<MyErrorBoundaryProps> = ({
  children,
  resetHandler,
}) => {
  return (
    <ErrorBoundary
      FallbackComponent={FallbackComponent}
      onError={errorLogger}
      onReset={resetHandler}
    >
      {children}
    </ErrorBoundary>
  );
};

export default MyErrorBoundary;
