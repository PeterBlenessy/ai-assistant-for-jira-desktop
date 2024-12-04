import { useQuasar } from 'quasar'

/**
 * Creates a composable for handling confirmation dialogs
 * @returns {Object} Object containing dialog utility functions
 */
export function useConfirmDialog() {
    const q = useQuasar()

    /**
     * Shows a confirmation dialog for delete operations
     * @param {Object} options - Configuration options for the dialog
     * @param {string} options.message - The message to display in the dialog
     * @param {Function} options.onConfirm - Callback function to execute when confirmed
     * @param {string} [options.title='Confirm Deletion'] - The dialog title
     * @param {string} [options.confirmLabel='Delete'] - The confirmation button label
     * @param {string} [options.cancelLabel='Cancel'] - The cancel button label
     */
    const confirmDelete = (options) => {
        const {
            message, 
            onConfirm, 
            title = 'Confirm Deletion', 
            confirmLabel = 'Delete',
            cancelLabel = 'Cancel'
        } = options

        q.dialog({
            title,
            message,
            html: true,
            cancel: true,
            persistent: true,
            ok: {
                label: confirmLabel,
                color: 'negative',
                size: "sm"
            },
            cancel: {
                label: cancelLabel,
                color: 'dark',
                size: "sm",
                flat: true
            }
        }).onOk(onConfirm)
    }

    return { confirmDelete }
}
