<template>
	<div
		ref="dropdown"
		class="dropdown"
		:style="{ width: `${itemWidth ?? 100}px`}"
	>
		<p
			class="selected-option"
			@click="isOpen = !isOpen"
		>
			{{ selectedOptionFromList }}
		</p>
		<Transition :name="(direction == 'top') ? 'top': 'bottom'">
			<ul
				v-if="isOpen"
				:class="['option-list', { 'view-top': direction == 'top'}]"
			>
				<li
					v-if="defaultValue"
					class="option-list__item"
					@click="selectOption('')"
				>
					{{ defaultValue }}
				</li>
				<li
					v-for="option in options"
					:key="option"
					class="option-list__item"
					@click="selectOption(option)"
				>
					{{ option }}
				</li>
			</ul>
		</Transition>
	</div>
</template>
<script setup lang="ts">
    import { ref, computed } from 'vue';
    import { onClickOutside } from '@vueuse/core'
    import { useTemplateRef } from 'vue'
    interface Props {
		options: (number | string)[];
        defaultValue?: (number | string);
		direction?: 'top';
		itemWidth?: number;
    }
    type optionType = string | number | null;

    defineProps<Props>()
	//протипизировать emit
    const emit = defineEmits(['selectOption']);

    const selectedOption = ref<optionType>(null);
    const isOpen = ref<boolean>(false);

    function selectOption(option: optionType){
        selectedOption.value = option;
        isOpen.value = false;
        emit('selectOption', option);
    }

    const selectedOptionFromList = computed(() => {
        if(selectedOption.value){
            return selectedOption.value;
        }
        return '-'
    })
    
    const dropdown = useTemplateRef<HTMLElement>('dropdown');
    onClickOutside(dropdown, () => isOpen.value = false);
</script>
<style scoped>
    .dropdown{
        height: 35px;
        position: relative;
    }
    .selected-option{
		width: 100%;
        border: 1px solid #ccc;
        cursor: pointer;
        height: 35px;
        text-align: center;
        align-content: center;
    }
    .option-list{
		width: 100%;
        background-color: white;
        display: flex;
        flex-direction: column;
        list-style: none;
        position: absolute;
        z-index: 2;
        border: 1px solid #ccc;
    }
    .view-top{
        bottom: 100%;
    }
    .option-list__item{
        cursor: pointer;
        height: 35px;
        text-align: center;
        align-content: center;
    }

    .top-enter-active,
	.top-leave-active {
	transition: all 0.2s ease;
	}

	.top-enter-from,
	.top-leave-to {
		transform: translateY(20%);
		opacity: 0;
	}
    .bottom-enter-active,
	.bottom-leave-active {
	transition: all 0.2s ease;
	}

	.bottom-enter-from,
	.bottom-leave-to {
		transform: translateY(-20%);
		opacity: 0;
	}
</style>