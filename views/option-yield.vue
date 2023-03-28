<template>
    <div class="main d-flex flex-column justify-content-center text-center p-4">
        <div class="align-self-center p-2">
            <h3 class="text-dark">{{ title }}</h3>
            <slot></slot>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        title: {
            type: String,
            required: true
        }
    }
}
</script>