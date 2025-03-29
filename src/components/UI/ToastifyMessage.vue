<script>

export default {
    name: 'Msg',
    props: {
        event_data: Object,
    },
    data() {
        return {
            icon_classes: {
                name: 'fa-user-check',
                number: 'fa-phone',
                email: 'fa-envelope',
                company: 'fa-building',
                telegram: 'fa-telegram',
            }
        }
    },
    methods: {
        getItemDate(date) {
            return (
                `${date.format("h:i")}, ${date.format("d.m.Y")}`
            ).trim();
        },
    },
    // mounted() {
    //     console.log('toastProps', this.toastProps);
    // },
};
</script>

<template>

    <div style="display: flex;align-items: center;"> 
        <i :class="`${event_data?.task_category == 'telegram' ? 'fa-brands' : 'fa-solid'} ${icon_classes[event_data?.task_category]}`" :style="`margin: 0 8px 0 5px;color: ${event_data?.task_status == 'failed' ? '#ec5e5e' : 'rgb(22,144,119)'};`"></i> <b :title="event_data?.task_title" style="font-size: 15px;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">{{ event_data?.task_title }}</b> 
    </div> 
    <p style="font-size: 13px;">{{ getItemDate(new Date(event_data?.task_created_at ?? '')) }}</p> 

</template>