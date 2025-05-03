import { onCleanup } from "solid-js";

export default function clickOutside(el: Element, accessor: Function) {
  const onClick = (e: any) => !el.contains(e.target) && accessor()?.();
  document.body.addEventListener("click", onClick);

  onCleanup(() => document.body.removeEventListener("click", onClick));
}

declare module "solid-js" {
    namespace JSX {
      interface Directives {  
        clickOutside(el: Element, accessor: Function): void
      }
    }
  }