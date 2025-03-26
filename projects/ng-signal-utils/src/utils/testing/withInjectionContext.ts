import { Injector, runInInjectionContext } from '@angular/core';

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
