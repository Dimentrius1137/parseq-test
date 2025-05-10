<template>
	<div class="panel">
		<table class="mutations-table">
			<thead>
				<tr class="mutations-table__main-title">
					<th colspan="5">
						Мутации
					</th>
				</tr>
				<tr>
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
			<tbody v-if="mutations.length > 0">
				<tr
					v-for="item in mutations"
					:key="item.mutationId"
					class="mutations-table__row"
					@click="console.log(item)"
				>
					<td class="mutations-table__item first-column">
						{{ item.mutationId }}
					</td>
					<td class="mutations-table__item">
						{{ item.mutationType }}
					</td>
					<td class="mutations-table__item">
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
					{{ emptyTable }}
				</tr>
			</tbody>
		</table>
		<div class="page-pagination">
			<DropDown
				:item-width="50"
				direction="top"
				:options="mutationPerPageList"
				@select-option="mutationsPerPage = $event; getMutations()"
			/>
			<DropDown
				:options="mutationTypes"
				@select-option="console.log($event)"
			/>
			<BaseButton
				btn-text="<"
				:btn-width="50"
				@click="pageCount--; getMutations()" 
			/>
			<div class="page-counter">
				{{ pageCount }} из {{ totalPages }}
			</div>
			<BaseButton
				btn-text=">"
				:btn-width="50"
				@click="pageCount++; getMutations()"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'; 
import api from '@/api/instance';
import { MutationType } from '@/utils/types/types';
import DropDown from '@/components/shared/DropDown.vue';
import BaseButton from './shared/BaseButton.vue';
import { useCheckEmpty } from '@/utils/composables/checkEmptyField';

const mutationPerPageList = ref<number[]>([10, 25, 50, 100]);
const mutationsPerPage = ref<number>(mutationPerPageList.value[0]);
const pageCount = ref<number>(1);
const totalPages = ref<number>(0);
const mutationTypes = ref<string[]>(['SNP', 'CNV', 'FUSION']);
const selectedMutationType = ref<string>('SNP')
const mutations = ref<MutationType[]>([]);
const emptyTable = ref<string>('Загрузка');

const filtredMutations = ref<MutationType[]>([]);
const allMutations = ref<MutationType[]>([]);
async function getMutations(){
	try{
		if(selectedMutationType.value){
			if(allMutations.value.length === 0){
				const mutationsData = 
				await api.get(`/mutations?pageZeroBasedNumber=${1}&pageSize=${1}`);
				const allMutationsData = await api.get(`/mutations?pageZeroBasedNumber=${0}&pageSize=${mutationsData.data.resourcesTotalNumber}`);

				allMutations.value = allMutationsData.data.resources;
				filtredMutations.value = allMutations.value.filter((el: MutationType) => el.mutationType === selectedMutationType.value);
				const mutationsCounter = (filtredMutations.value.length < 10) ? filtredMutations.value.length : mutationsPerPage.value * pageCount.value;
				console.log(mutationsCounter);
				for(let i = pageCount.value; i < mutationsCounter; i++){
					mutations.value.push(filtredMutations.value[i - 1]);
				}
				totalPages.value = Math.ceil(filtredMutations.value.length / mutationsPerPage.value);
				console.log('a')
			}
			else{
				const mutationsCounter = (filtredMutations.value.length < 10) ? filtredMutations.value.length : mutationsPerPage.value * pageCount.value;
				console.log(mutationsCounter);
				for(let i = pageCount.value; i < mutationsCounter; i++){
					mutations.value.shift();
					mutations.value.push(filtredMutations.value[i - 1]);
				}
				totalPages.value = Math.ceil(filtredMutations.value.length / mutationsPerPage.value);
			}
			
		}
		// console.log(mutations.value)
		
		//условия для пустой коллекции мутаций нет, т.к. приложение предполагает что мутации есть изначально
	}
	catch(e){
		emptyTable.value = 'Не удалось загрузить мутации';
		console.log(e);
	}
}
getMutations();

</script>

<style scoped lang="scss">
	.panel{
		max-width: 100vw;
		overflow: hidden;
	}
  .mutations-table{
    width: 95%;
    border-collapse: collapse;
	padding: 1rem;
	&__main-title{
		border: 1px solid #ccc;
		height: 35px;
		th{
			width: 100%;
			text-align: center;
			align-items: center;
		}
	}
	&__title{
		border: 1px solid #ccc;
		padding: 10px;
	}
	&__row:hover{
		background-color: #ccc;
	}
	&__item{
		border: 1px solid #ccc;
		padding: 10px;
		.evidence-level{
			font-weight: 600;
			font-size: 1.2rem;
  		}
	}
	.first-column{
		overflow-wrap: anywhere;
	}
  }
  .page-pagination{
	display: flex;
	flex-direction: row;
	justify-content: space-around;
	height: 100px;
  }
  </style>