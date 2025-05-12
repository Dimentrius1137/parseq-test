import { ListType } from "@/utils/types/list";

export function getAddedLists(addedMutations: string[], list: ListType){
	addedMutations.forEach((el: string) => list?.mutations.push(el));
}