export const electronIpcLoggerMiddleware = () => (next: any) => (action: any) => {
  return next(action);
};
