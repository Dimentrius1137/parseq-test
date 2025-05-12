<template>
	<div class="page">
		<div class="page__header">
			<h1 class="page__title">
				Списки
			</h1>
			<RouterLink :to="{name: 'lists'}">
				Списки ->
			</RouterLink>
		</div>
		<div class="mutations-panel">
			<form
				class="new-list"
				@submit.prevent="fetchNewList"
			>
				<label for="list-name">Название мутации</label>
				<input
					id="list-name"
					v-model="newList.name"
					type="text"
				>
				<BaseButton
					btn-type="submit"
					btn-text="Сохранить"
				/>
				<p>Мутации:</p>
				<ul class="added-mutations">
					<li
						v-for="mutation in newList.mutations"
						:key="mutation"
						class="added-mutations__item"
					>
						{{ mutation }}
					</li>
				</ul>
			</form>
			<MutationsTable
				@add-mutations="newList.mutations.splice(0); getAddedLists($event, newList)"
				@close="isTableOpen = false"
			/>
		</div>
	</div>
</template>
<script setup lang="ts">
	import { reactive, ref, toRaw } from 'vue';
	import { ListType } from '@/utils/types/list';
	import { getAddedLists } from '@/utils/composables/getAddedMutations';
	import { useRouter } from 'vue-router';
	import MutationsTable from '@/components/MutationsTable.vue';
	import BaseButton from '@/components/shared/BaseButton.vue';
	import api from '@/api/instance';

	const router = useRouter();
	const isTableOpen = ref<boolean>(false);
	const newList = reactive<ListType>({
		name: '',
		mutations: []
	});
	async function fetchNewList(){
		try{
			await api.post(`/lists/create?name=${newList.name}`);
			await api.patch(`/lists/${newList.name}/mutations`, toRaw(newList.mutations));
			router.push({name: 'lists'});
		}
		catch(e){
			console.log(e)
		}

	}
</script>

<style scoped lang="scss">
	.page{
		width: 80%;
		height: 100vh;
		display: flex;
		flex-direction: column;
		gap: 1rem;

		&__header{
			display: flex;
			justify-content: space-between;
			align-items: center;
		}
	}
	.mutations-panel{
			display: flex;
			flex-direction: row;
			height: calc(100% - 58px);
			gap: 1rem
		}
	.new-list{
		width: 30%;
	}
	.added-mutations{	
		width: 100%;
		list-style: none;
		&__item{
			border-bottom: 1px solid #ccc;
			overflow-wrap: anywhere;
			margin-bottom: 0.5rem;
		}
	}
</style>