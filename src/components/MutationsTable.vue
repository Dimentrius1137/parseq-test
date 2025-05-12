<template>
	<div :class="['panel', {'popup-panel': isPopup}]">
		<div class="panel__type-toggler">
			<p>Тип мутации:</p>
			<DropDown
				:options="mutationTypes"
				:default-value="'-'"
				@select-option="changeMutationType"
			/>
		</div>

		<div class="table-container">
			<table class="mutations-table">
				<thead>
					<tr>
						<th
							class="mutations-table__title"
							colspan="6"
						>
							Мутации
						</th>
					</tr>
					<tr>
						<th class="mutations-table__title">
							Добавить
						</th>
						<th class="mutations-table__title">
							Название мутации
						</th>
						<th class="mutations-table__title">
							Тип мутации
						</th>
						<th class="mutations-table__title">
							hgvsGdna
						</th>
						<th class="mutations-table__title">
							evidenceLevel
						</th>
						<th class="mutations-table__title">
							acmgSignificances
						</th>
					</tr>
				</thead>
				<tbody v-if="mutationsIsLoaded && mutationsError">
					<tr class="mutations-table__item">
						Не удалось получить мутации
					</tr>
				</tbody>
				<tbody v-if="mutationsIsLoaded && mutationsInPage.length == 0 && !mutationsError">
					<tr class="mutations-table__item">
						Пусто
					</tr>
				</tbody>
				<tbody v-if="mutationsIsLoaded">
					<tr
						v-for="item in mutationsInPage"
						:key="item.mutationId"
						class="mutations-table__row"
					>
						<td class="mutations-table__item long-column">
							<input
								:id="item.mutationId"
								v-model="item.isAdded"
								type="checkbox"
							>
						</td>
						<td class="mutations-table__item long-column">
							{{ item.mutationId }}
						</td>
						<td class="mutations-table__item">
							{{ item.mutationType }}
						</td>
						<td class="mutations-table__item long-column">
							{{ useCheckEmpty(item.maybeHgvsGdna) }}
						</td>
						<td class="mutations-table__item">
							<div>
								therapeuticAnnotations: 
								<span class="evidence-level">
									{{ useCheckEmpty(item?.therapeuticAnnotations[0]?.evidenceLevel) }}
								</span>
							</div>
							<div>
								prognosticAnnotations: 
								<span class="evidence-level">
									{{ useCheckEmpty(item?.prognosticAnnotations[0]?.evidenceLevel) }}
								</span>
							</div>
							<div>
								lowTierAnnotations: 
								<span class="evidence-level">
									{{ useCheckEmpty(item?.lowTierAnnotations[0]?.evidenceLevel) }}
								</span>
							</div>
						</td>
						<td class="mutations-table__item">
							{{ useCheckEmpty(item?.acmgAnnotations[0]?.acmgSignificances) }}
						</td>
					</tr>
				</tbody>
				<tbody v-else>
					<tr class="mutations-table__item">
						Загрузка мутаций
					</tr>
				</tbody>
			</table>
		</div>
			
		<div class="page-pagination">
			<div class="page-pagination__mutation-counter">
				<p>Мутаций на странице:</p>
				<DropDown
					:item-width="50"
					direction="top"
					:options="mutationPerPageList"
					@select-option="changeMutationPerPage"
				/>
			</div>
			
			<BaseButton
				:disable="pageCount == 1"
				btn-text="<"
				:btn-width="50"
				@click="pageBack" 
			/>
			<div class="page-counter">
				{{ pageCount }} из {{ totalPages }}
			</div>
			<BaseButton
				:disable="pageCount == totalPages"
				btn-text=">"
				:btn-width="50"
				@click="pageForward"
			/>
		</div>
		<div class="navigation-btns">
			<BaseButton
				btn-text="Добавить"
				@click="emit('addMutations', addedMutations)"
			/>
			<BaseButton
				v-if="isPopup"
				btn-text="Закрыть"
				@click="emit('close')"
			/>
		</div>
	</div>
	<div
		v-if="isPopup"
		class="table-wrapper"
	/>
</template>

<script setup lang="ts">
import { ref, computed, onActivated, watch } from 'vue'; 
import api from '@/api/instance';
import { MutationType } from '@/utils/types/mutation';
import DropDown from '@/components/shared/DropDown.vue';
import BaseButton from './shared/BaseButton.vue';
import { useCheckEmpty } from '@/utils/composables/checkEmptyField';

const mutationPerPageList = ref<number[]>([10, 25, 50, 100]);
const mutationsPerPage = ref<number>(mutationPerPageList.value[0]);
const pageCount = ref<number>(1);
const totalPages = ref<number>(0);
const mutationTypes = ref<string[]>(['SNP', 'CNV', 'FUSION']);
const selectedMutationType = ref<string>('');
const mutationsIsLoaded = ref<boolean>(false); 
const mutationsError = ref<boolean>(false);
const mutations = ref<MutationType[]>([]);

const emit = defineEmits(['addMutations', 'close']);
const props = defineProps({ 
	isPopup: Boolean,
	hasMutations: Array
})

//наблюдатель для исключения уже добавленных элементов в список 
watch(() => props.hasMutations?.length, () => {
getCurrentMutations()
}, { deep: true})

function changeMutationType(e: string){
	selectedMutationType.value = e; 
	pageCount.value = 1;
	pageWasChanged.value = false; 
	getCurrentMutations()
}

function changeMutationPerPage(e: number){
	mutationsPerPage.value = e; 
	getCurrentMutations()
}

const addedMutations = computed(() => {
	const checkedMutations = mutations.value.filter((el: MutationType) => {
		return el.isAdded;
	})
	return checkedMutations.map((el: MutationType) => el.mutationId);
})

onActivated(() => 
    mutations.value.forEach((el) => {
        el.isAdded = false;
    })
);
//представленный ниже код можно было бы сократить до 1ой функции getMutations, если бы был query параметр для фильтрации (на стороне сервера), но т.к. его нет пришлось сделать не самым хорошим путём в угоду того что бы у таблицы была адекватная пагинация.

const filtredMutations = ref<MutationType[]>([]);
const mutationsInPage = ref<MutationType[]>([]);
const pageWasChanged = ref<boolean>(false);
async function getMutations(){
	try{
		const mutationsData = await api.get(`/mutations?pageZeroBasedNumber=${1}&pageSize=${1}`);
		const allMutationsData = await api.get(`/mutations?pageZeroBasedNumber=${0}&pageSize=${mutationsData.data.resourcesTotalNumber}`);
		mutations.value = allMutationsData.data.resources;
		getCurrentMutations();
	}
	catch(e){
		mutationsError.value = true;
		console.log(e);
	}
	finally{
		mutationsIsLoaded.value = true;
	}
}
if(mutations.value.length == 0){
getMutations();

}

function getCurrentMutations() { 
	if(selectedMutationType.value){
		filtredMutations.value = mutations.value.filter((el: MutationType) => el.mutationType === selectedMutationType.value && !props.hasMutations?.includes(el.mutationId));
	}
	else{
		filtredMutations.value = [...mutations.value.filter((el) => !props.hasMutations?.includes(el.mutationId))];
	}
	const mutationsCounter = (filtredMutations.value.length < 10) ? filtredMutations.value.length : mutationsPerPage.value * pageCount.value;
	mutationsInPage.value.splice(0);
	if(!pageWasChanged.value){
		for(let i = pageCount.value; i <= mutationsCounter; i++){
				mutationsInPage.value.push(filtredMutations.value[i - 1]);
		}
	}
	else{
		for(let i = mutationsCounter - mutationsPerPage.value; i < mutationsCounter; i++){
			mutationsInPage.value.push(filtredMutations.value[i - 1]);
		}
	}
	totalPages.value = Math.ceil(filtredMutations.value.length / mutationsPerPage.value);
}

function pageForward(){
	pageCount.value++; 
	pageWasChanged.value = true;
	getCurrentMutations();

}
function pageBack(){
	pageCount.value--; 
	getCurrentMutations()
}
</script>

<style scoped lang="scss">
.table-wrapper{
		width: 100vw;
		height: 100vh;
		position: absolute;
		top: 0; 
		left: 0;	
		background-color: rgba(0, 0, 0, 0.39);
	}
	.popup-panel{
		width: 90% !important;
		position: absolute;
		z-index: 2;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
	}

	.panel{	
		width: 100%;
		height: 90%;
		background-color: white;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		&__type-toggler{
				display: flex;
		align-items: center;
		gap: 1rem
		}
	}
	.table-container{
		width: 100%;
		overflow-y: auto;
		height: 100%;
			border: 1px solid #ccc;
	}
  .mutations-table{
    width: 100%;
	border: 1px solid #ccc;
	border-collapse: collapse;
	padding: 1rem;
	font-size: 1rem;
	overflow-y: auto; 
	&__title{
		border: 1px solid #ccc;
	}
	&__row:hover{
		background-color: #ccc;
	}
	&__item{
		border: 1px solid #ccc;
		padding: 10px;
		min-height: 100%;
		.evidence-level{
			font-weight: 600;
			font-size: 1.2rem;
  		}
	}
	.long-column{
		overflow-wrap: anywhere;
	}
  }
  .page-pagination{
	width: 100%;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	padding: 0 1rem;
	&__mutation-counter{
		display: flex;
		align-items: center;
		gap: 1rem
	}
  }

  .navigation-btns{
	width: 100%;
	display: flex;
	gap: 1rem;
	justify-content: center;
	padding: 1rem;
  }
  </style>