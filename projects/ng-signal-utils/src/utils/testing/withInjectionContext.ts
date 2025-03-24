import { Injector, runInInjectionContext } from '@angular/core';

/**
 * Runs a function within an Angular injection context.
 *
 * @template TFunc The type of function to be wrapped
 * @param injector The Angular injector to use for the context
 * @param fn The function to run within the injection context
 * @returns A function with the same signature as the input function which runs in the provided injection context
 *
 */
export function withInjectionContext<TFunc extends (...args: any[]) => any>(
  injector: Injector,
  fn: TFunc
): TFunc {
  return ((...args: Parameters<TFunc>): ReturnType<TFunc> => {
    return runInInjectionContext(injector, () =>
      fn(...args)
    ) as ReturnType<TFunc>;
  }) as TFunc;
}
