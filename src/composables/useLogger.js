import { Notify } from 'quasar';

export function notify({message, caption = "", type = "", sender}) {
    Notify.create({
        message,
        caption,
        position: "bottom-right",
        type
    });

    console.log(`[${sender}] - ${message} ${caption}`);

    return {
        notify
    };
}