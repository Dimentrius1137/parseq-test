import { computed } from "vue";
export function useCheckEmpty(item: unknown){
    return computed(() => item ? item : '-');
}
