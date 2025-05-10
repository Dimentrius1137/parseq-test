<template>
	<button
		:style="{ width: `${btnWidth}px`}"
		class="base-btn"
		:disabled="disable"
		:type="btnType"
	>
		{{ btnText }}
	</button>
</template>

<script setup lang="ts">
import { PropType } from 'vue';

type BtnType = 'button' | 'submit';

defineProps({
    btnType: {
        type: String as PropType<BtnType>,
        default: 'button'
    },
    btnWidth: {
        type: Number,
        default: 100
    },
    disable: {
        type: Boolean,
        default: false
    },
    btnText: {
        type: String,
        default: ''
    }
})
</script>

<style scoped lang="scss">
    .base-btn{
        height: 35px;
        border: none;
        border-radius: 5px;
        text-align: center;
        font-weight: 600;
        font-size: 16px;
        transition: all 200ms ease;
        outline: 0;
        cursor: pointer;
        background-color: #b4b4b4;

        &:hover{
            background-color: var(--yellow);
        }

        &:active{
            transform: scale(0.9);
        }
    }
</style>