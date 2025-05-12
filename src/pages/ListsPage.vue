<template>
	<div class="page">
		<div class="page__header">
			<h1 class="page__title">
				Списки
			</h1>
			<RouterLink :to="{name: 'list-form'}">
				Добавить список ->
			</RouterLink>
		</div>
		<div class="page__search">
			<label for="search"> Поиск:</label>
			<input
				id="search"
				v-model="searchValue"
				class="page__search-field"
				type="text"
				placeholder="название списка"
			>
		</div>
		<div class="page-panels">
			<div class="lists-panel">
				<ul
					v-if="lists.length > 0"
					class="lists"
				>
					<li
						v-for="list in currentLists"
						:key="list.name"
						class="lists__item"
						@click="selectList(list)"
					>
						<p class="lists__name">
							{{ list.name }}
						</p>
						<p class="lists__mutation-count">
							Мутаций: {{ list.mutations?.length }}
						</p>
					</li>
				</ul>
				<p v-else>
					{{ emptyList }}
				</p>
			</div>
			<Transition>
				<ListPanel
					v-if="selectedList"
					:selected-list="selectedList"
					@remove-list="getLists(); selectedList = null"
					@add-mutations="getLists(); isTableOpen = $event"
					@list-saved="getLists(); selectedList = null"
				/>
			</Transition>
		</div>
		<Teleport to="body">
			<KeepAlive>
				<MutationsTable
					v-if="isTableOpen"
					:is-popup="true"
					:has-mutations="selectedList?.mutations"
					@add-mutations="getAddedLists($event, selectedList as ListType); isTableOpen = false"
					@close="isTableOpen = false"
				/>
			</KeepAlive>
		</Teleport>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { RouterLink } from 'vue-router';
import api from '@/api/instance';
import { ListType } from '@/utils/types/list'
import { getAddedLists } from '@/utils/composables/getAddedMutations';
import ListPanel from '@/components/ListPanel.vue';
import MutationsTable from '@/components/MutationsTable.vue';

const selectedList = ref<ListType | null>(null);
const searchValue = ref<string>('');
const lists = ref<ListType[]>([]);
const emptyList = ref<string>('Загрузка списков');
const isTableOpen = ref<boolean>(false);

async function getLists(){
    try{
        const listsData = await api.get('/lists');
        if(listsData.data.length === 0){
            emptyList.value = 'Пусто'
        }
        lists.value = listsData.data;
    }
    catch(e){
        emptyList.value = 'Не удалось загрузить списки';
        console.log(e)
    }
}
getLists();

function selectList(list: ListType){
    if(selectedList.value?.name == list.name){
        selectedList.value = null
    }
    else{
        selectedList.value = list
    }
}

const currentLists = computed(() =>{
    return lists.value.filter((el) => {
      return el.name.toLowerCase().includes(searchValue.value.toLowerCase());
    })
})
</script>

<style scoped lang="scss">
	.page{
		width: 80%;
		height: 100vh;
		display: flex;
		flex-direction: column;
		gap: 15px;

		&__header{
			display: flex;
			justify-content: space-between;
			align-items: center;
		}
		&__search{
			display: flex;
			flex-direction: column;
		}
		&__search-field{
			width: 150px;
			height: 35px;
			border: 1px solid #ccc;
			border-radius: 5px;
			&::placeholder{
				padding-left: 6px;
				font-size: 16px;
			}
		}
	}
	.page-panels{
		width: 100%;
		height: 100%;
		display: flex;
		gap: 2rem;
		overflow: hidden;

	}

	.lists-panel{
		width: 30%;
		border: 1px solid #ccc;
		border-radius: 1rem;
		padding: 1rem;
		padding-right: 0;
		margin-bottom: 1rem;
	}
	
	.lists{
		width: 100%;
		height: 100%;
		padding-right: 1rem;
		overflow-y: auto;
		list-style: none;
		&__item{
		cursor: pointer;
		border-bottom: 1px solid #ccc;
		margin-top: 10px;
		position: relative;
		&::after{
			content: '';
			position: absolute;
			width: 100%;
			height: 1px;
			transform: scaleX(0);
			transform-origin: left;
			background-color: var(--black);
			transition: all 300ms ease;
		}
		&:hover::after{
			transform: scaleX(1);
		}
	}
	}

	.v-enter-active,
	.v-leave-active {
	transition: all 0.5s ease;
	}

	.v-enter-from,
	.v-leave-to {
		transform: translateX(100%);
		opacity: 0;
	}
  </style>
